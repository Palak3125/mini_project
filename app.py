from flask import Flask, request, jsonify
import pickle
from database import get_connection
from utils import preprocess, fallback_priority

app = Flask(__name__)

# Load models
vectorizer = pickle.load(open("models/vectorizer.pkl", "rb"))
dept_model = pickle.load(open("models/department_model.pkl", "rb"))
priority_model = pickle.load(open("models/priority_model.pkl", "rb"))

# ================= ROUTES =================

# 1. Add complaint
@app.route("/complaints", methods=["POST"])
def add_complaint():
    data = request.get_json()
    text = data.get("text")

    if not text:
        return jsonify({"error": "Text is required"}), 400

    # preprocess
    clean_text = preprocess(text)
    vector = vectorizer.transform([clean_text])

    # predictions
    department = dept_model.predict(vector)[0]

    try:
        priority = priority_model.predict(vector)[0]
    except:
        priority = fallback_priority(text)

    status = "Pending"

    # save to MySQL
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO complaints (text, department, priority, status)
    VALUES (%s, %s, %s, %s)
    """, (text, department, priority, status))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "text": text,
        "department": department,
        "priority": priority,
        "status": status
    })


# 2. Get all complaints
@app.route("/complaints", methods=["GET"])
def get_complaints():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM complaints")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows)


# 3. Update status
@app.route("/update/<int:id>", methods=["PUT"])
def update_status(id):
    data = request.get_json()
    status = data.get("status")

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE complaints SET status=%s WHERE id=%s",
        (status, id)
    )

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Status updated"})


# 4. Health check
@app.route("/")
def home():
    return "AI Complaint Backend Running"


if __name__ == "__main__":
    app.run(debug=True)