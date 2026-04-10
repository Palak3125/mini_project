from flask import Flask, request, jsonify
import pickle
from database import get_connection
from utils import preprocess, fallback_priority
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# Load models
vectorizer = pickle.load(open("models/vectorizer.pkl", "rb"))
dept_model = pickle.load(open("models/department_model.pkl", "rb"))
priority_model = pickle.load(open("models/priority_model.pkl", "rb"))

# ================= ROUTES =================

# 1. Add complaint (SMART DUPLICATE DETECTION)
@app.route("/complaints", methods=["POST"])
def add_complaint():
    data = request.get_json()
    text = data.get("text")
    student_id = data.get("student_id", 1)

    if not text:
        return jsonify({"error": "Text is required"}), 400

    # preprocess
    clean_text = preprocess(text)
    new_vec = vectorizer.transform([clean_text])

    # predictions
    department = dept_model.predict(new_vec)[0]

    try:
        priority = priority_model.predict(new_vec)[0]
    except:
        priority = fallback_priority(text)

    conn = get_connection()
    cursor = conn.cursor()

    # 🔥 NEW: SMART SIMILARITY MATCHING
    cursor.execute("SELECT id, normalized_text FROM complaint_master")
    rows = cursor.fetchall()

    best_match_id = None
    max_similarity = 0

    for row in rows:
        existing_id = row[0]
        existing_text = row[1]

        existing_clean = preprocess(existing_text)
        existing_vec = vectorizer.transform([existing_clean])

        similarity = cosine_similarity(new_vec, existing_vec)[0][0]

        if similarity > max_similarity:
            max_similarity = similarity
            best_match_id = existing_id

    # 🎯 Threshold decision
    if max_similarity > 0.7:
        # SAME complaint → increase count
        master_id = best_match_id

        cursor.execute("""
            UPDATE complaint_master
            SET count = count + 1
            WHERE id = %s
        """, (master_id,))
    else:
        # NEW complaint → insert new master
        cursor.execute("""
            INSERT INTO complaint_master
            (normalized_text, department, priority, count)
            VALUES (%s, %s, %s, 1)
        """, (text, department, priority))

        master_id = cursor.lastrowid

    # 🔹 Insert individual complaint
    cursor.execute("""
        INSERT INTO complaints
        (complaint_master_id, text, department, priority, status)
        VALUES (%s, %s, %s, %s, 'Pending')
    """, (master_id, text, department, priority))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "text": text,
        "department": department,
        "priority": priority,
        "status": "Pending",
        "similarity_used": round(max_similarity, 2)
    })


# 2. Get grouped complaints (ADMIN VIEW)
@app.route("/complaints", methods=["GET"])
def get_complaints():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, normalized_text, department, priority, status, count
        FROM complaint_master
        ORDER BY count DESC
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)


# 3. Resolve all complaints (ONE CLICK)
@app.route("/resolve/<int:id>", methods=["PUT"])
def resolve_complaint(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE complaint_master
        SET status = 'Resolved'
        WHERE id = %s
    """, (id,))

    cursor.execute("""
        UPDATE complaints
        SET status = 'Resolved'
        WHERE complaint_master_id = %s
    """, (id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "All complaints resolved"})


# 4. Student complaints (INDIVIDUAL VIEW)
@app.route("/student/<int:id>", methods=["GET"])
def student_complaints(id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.text, cm.status
        FROM complaints c
        JOIN complaint_master cm
        ON c.complaint_master_id = cm.id
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)


# 5. Health check
@app.route("/")
def home():
    return "AI Complaint Backend Running"


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)