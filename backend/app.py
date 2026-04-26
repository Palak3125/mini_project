import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
from backend.database import get_connection
from backend.utils import preprocess, fallback_priority
from sklearn.metrics.pairwise import cosine_similarity
import time
import bcrypt
import jwt
import datetime
from functools import wraps

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'super-secret-key'

def extract_location(text):
    locations = ['hostel', 'college', 'lab', 'classroom', 'mess', 'library', 'ground', 'oat']
    text_lower = text.lower()
    for loc in locations:
        if loc in text_lower:
            return loc
    return 'unknown'

def generate_ticket_id():
    return f"TCKT-{int(time.time() * 1000)}"

def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            request.user_id = data['user_id']
            request.user_role = data['role']
        except Exception:
            return jsonify({'error': 'Token is invalid or expired'}), 401
            
        return f(*args, **kwargs)
    return decorated

# Load models
vectorizer = pickle.load(open(os.path.join(BASE_DIR, "models/vectorizer.pkl"), "rb"))
dept_model = pickle.load(open(os.path.join(BASE_DIR, "models/department_model.pkl"), "rb"))
priority_model = pickle.load(open(os.path.join(BASE_DIR, "models/priority_model.pkl"), "rb"))

# ================= ROUTES =================

# 1. Add complaint (SMART DUPLICATE DETECTION)
@app.route("/complaints", methods=["POST"])
@verify_token
def add_complaint():
    try:
        data = request.get_json() or {}
        text = data.get("text")
        student_id = request.user_id

        if not text:
            return jsonify({"success": False, "error": "Text is required"}), 400

        conn = get_connection()
        cursor = conn.cursor()

        # FIX: DUPLICATE COMPLAINT CRASH (Safe check before processing)
        cursor.execute("""
            SELECT cm.ticket_id 
            FROM complaints c
            JOIN complaint_master cm ON c.complaint_master_id = cm.id
            WHERE c.student_id = %s AND c.text = %s
            LIMIT 1
        """, (student_id, text))
        existing_exact = cursor.fetchone()
        
        if existing_exact:
            cursor.close()
            conn.close()
            return jsonify({
                "success": True,
                "message": "Complaint already exists",
                "ticket_id": existing_exact[0]
            }), 200

        settings = data.get("settings", {})
        ai_active = settings.get("aiModelActive", True)
        thresh_high = settings.get("priorityThresholdHigh", 90)
        thresh_medium = settings.get("priorityThresholdMedium", 70)

        # preprocess
        clean_text = preprocess(text)
        new_vec = vectorizer.transform([clean_text])

        if ai_active:
            # predictions
            department = str(dept_model.predict(new_vec)[0])

            try:
                priority_probs = priority_model.predict_proba(new_vec)[0]
                confidence = float(max(priority_probs) * 100)
                if confidence >= thresh_high:
                    priority = "High"
                elif confidence >= thresh_medium:
                    priority = "Medium"
                else:
                    priority = "Low"
            except Exception as e:
                print("Error calculating priority from probabilities:", e)
                priority = str(fallback_priority(text))
                confidence = 50.0
        else:
            department = "General"
            priority = "Medium"
            confidence = 0.0

        # Extract location
        new_location = extract_location(text)

        best_match_id = None
        best_ticket_id = None
        max_similarity = 0
        is_duplicate = False

        # Optimization: only query database if location is valid
        if new_location != 'unknown':
            cursor.execute("""
                SELECT id, normalized_text, ticket_id, location 
                FROM complaint_master 
                WHERE location = %s 
                LIMIT 50
            """, (new_location,))
            
            rows = cursor.fetchall()
            for row in rows:
                existing_id = row[0]
                existing_text = row[1]
                existing_ticket_id = row[2] if len(row) > 2 else None

                existing_clean = preprocess(existing_text)
                existing_vec = vectorizer.transform([existing_clean])

                similarity = float(cosine_similarity(new_vec, existing_vec)[0][0])

                if similarity > max_similarity:
                    max_similarity = similarity
                    best_match_id = existing_id
                    best_ticket_id = existing_ticket_id

        # 🎯 Threshold decision
        if max_similarity > 0.7:
            # SAME complaint -> increase count
            master_id = best_match_id
            ticket_id = best_ticket_id
            is_duplicate = True

            cursor.execute("""
                UPDATE complaint_master
                SET count = count + 1
                WHERE id = %s
            """, (master_id,))
        else:
            # NEW complaint -> insert new master
            ticket_id = generate_ticket_id()

            # FIX: ADMIN ASSIGNMENT CRASH (SAFE CHECK)
            cursor.execute("SELECT name FROM users WHERE role = 'admin' AND department = %s LIMIT 1", (department,))
            admin = cursor.fetchone()
            assigned_agent = admin[0] if admin else 'Unassigned'

            cursor.execute("""
                INSERT INTO complaint_master
                (normalized_text, department, priority, count, ticket_id, location, status, agent, confidence)
                VALUES (%s, %s, %s, 1, %s, %s, 'pending', %s, %s)
            """, (text, department, priority, ticket_id, new_location, assigned_agent, confidence))

            master_id = cursor.lastrowid

        # 🔹 Insert individual complaint
        cursor.execute("""
            INSERT INTO complaints
            (complaint_master_id, text, department, priority, status, student_id)
            VALUES (%s, %s, %s, %s, 'pending', %s)
        """, (master_id, text, department, priority, student_id))

        conn.commit()
        cursor.close()
        conn.close()

        message = f"Complaint already exists. Linked to Ticket ID: {ticket_id}" if is_duplicate else f"New complaint registered. Ticket ID: {ticket_id}"

        return jsonify({
            "success": True,
            "ticket_id": ticket_id,
            "department": department,
            "priority": priority,
            "status": "pending",
            "similarity_used": round(max_similarity, 2),
            "message": message
        }), 201

    except Exception as e:
        print("ERROR in /complaints:", e)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# 2. Get grouped complaints (ADMIN VIEW)
@app.route("/complaints", methods=["GET"])
@verify_token
def get_complaints():
    if request.user_role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    offset = (page - 1) * limit
    status_filter = request.args.get('status')
    
    if status_filter == 'resolved':
        status_condition = "status = 'resolved'"
    elif status_filter == 'active':
        status_condition = "status IN ('pending', 'in_progress')"
    else:
        status_condition = "1=1" # Get all tickets

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(f"""
        SELECT id, ticket_id, normalized_text, department, priority, status, count, agent, created_at, confidence
        FROM complaint_master
        WHERE {status_condition}
        ORDER BY count DESC
        LIMIT %s OFFSET %s
    """, (limit, offset))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    result = []
    for row in rows:
        result.append({
            "id": row[0],
            "ticket_id": row[1],
            "normalized_text": row[2],
            "department": row[3],
            "priority": row[4],
            "status": row[5],
            "count": row[6],
            "agent": row[7],
            "created_at": row[8].strftime("%Y-%m-%dT%H:%M:%S") if len(row) > 8 and row[8] else None,
            "confidence": round(row[9]) if len(row) > 9 and row[9] is not None else 85
        })

    return jsonify(result)


# 3. Resolve all complaints (ONE CLICK)
@app.route("/resolve/<int:id>", methods=["PUT"])
@verify_token
def resolve_complaint(id):
    if request.user_role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE complaint_master
        SET status = 'resolved'
        WHERE id = %s
    """, (id,))

    cursor.execute("""
        UPDATE complaints
        SET status = 'resolved'
        WHERE complaint_master_id = %s
    """, (id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "All complaints resolved"})


# 3.5 Set in-progress (BONUS)
@app.route("/in_progress/<int:id>", methods=["PUT"])
@verify_token
def in_progress_complaint(id):
    if request.user_role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE complaint_master
        SET status = 'in_progress'
        WHERE id = %s
    """, (id,))

    cursor.execute("""
        UPDATE complaints
        SET status = 'in_progress'
        WHERE complaint_master_id = %s
    """, (id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Complaint status updated to in progress"})


# 3.8 Reassign agent (ADMIN VIEW)
@app.route("/reassign/<int:id>", methods=["PUT"])
@verify_token
def reassign_complaint(id):
    if request.user_role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.get_json()
    new_agent = data.get("agent")
    
    if not new_agent:
        return jsonify({"error": "Agent name is required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE complaint_master
        SET agent = %s
        WHERE id = %s
    """, (new_agent, id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": f"Complaint reassigned to {new_agent}"})


# 4. Student complaints (INDIVIDUAL VIEW)
@app.route("/student/<int:id>", methods=["GET"])
@verify_token
def student_complaints(id):
    if request.user_id != id and request.user_role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT c.text, cm.status, cm.ticket_id
        FROM complaints c
        JOIN complaint_master cm
        ON c.complaint_master_id = cm.id
        WHERE c.student_id = %s
    """, (id,))

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    pending_complaints = []
    resolved_complaints = []

    for row in rows:
        complaint_data = {"text": row[0], "status": row[1], "ticket_id": row[2]}
        if row[1] == 'resolved':
            resolved_complaints.append(complaint_data)
        else:
            pending_complaints.append(complaint_data)

    return jsonify({
        "pending": pending_complaints,
        "resolved": resolved_complaints
    })

# 4.5 Fetch all admins
@app.route("/admins", methods=["GET"])
@verify_token
def get_admins():
    if request.user_role != 'admin':
        return jsonify({"error": "Admin access required"}), 403

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, name, department
        FROM users
        WHERE role = 'admin'
    """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    admins = []
    for row in rows:
        admins.append({
            "id": row[0],
            "name": row[1],
            "dept": row[2],
            "status": "Available" # UI expectation
        })

    return jsonify(admins)



# 5. Track by ticket ID
@app.route("/track/<ticket_id>", methods=["GET"])
@verify_token
def track_complaint(ticket_id):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT normalized_text, department, priority, status, count, agent
        FROM complaint_master
        WHERE ticket_id = %s
    """, (ticket_id,))
    
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if row:
        return jsonify({
            "normalized_text": row[0],
            "department": row[1],
            "priority": row[2],
            "status": row[3],
            "count": row[4],
            "agent": row[5]
        })
    else:
        return jsonify({"error": "Ticket not found"}), 404


# 6. User Signup
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    password_bytes = password.encode('utf-8')
    hashed_password = bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')

    conn = get_connection()
    cursor = conn.cursor()

    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"error": "User already exists"}), 409

    # Insert new user
    cursor.execute("""
        INSERT INTO users (name, email, password, role)
        VALUES (%s, %s, %s, 'user')
    """, (name, email, hashed_password))
    
    student_id = cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({
        "student_id": student_id,
        "role": "user",
        "name": name,
        "message": "Signup successful"
    }), 201


# 7. Role-Based Login
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    email = data.get("email")
    password = data.get("password")
    requested_role = data.get("role")

    if not email or not password or not requested_role:
        return jsonify({"error": "Email, password, and role are required"}), 400

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, password, role FROM users WHERE email = %s", (email,))
    row = cursor.fetchone()

    if not row:
        cursor.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    user_id, name, db_password, db_role = row

    # Automatically upgrade plaintext passwords on successful login
    is_valid_password = False
    needs_upgrade = False

    try:
        if bcrypt.checkpw(password.encode('utf-8'), db_password.encode('utf-8')):
            is_valid_password = True
    except ValueError:
        # Invalid hash format (could be plain text)
        if password == db_password:
            is_valid_password = True
            needs_upgrade = True

    if not is_valid_password:
        cursor.close()
        conn.close()
        return jsonify({"error": "Invalid password"}), 401

    if requested_role != db_role:
        cursor.close()
        conn.close()
        return jsonify({"error": "Not authorized for this role"}), 403

    # Upgrade the password to bcrypt if it was plain text
    if needs_upgrade:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_password, user_id))
        conn.commit()

    cursor.close()
    conn.close()

    token = generate_token(user_id, db_role)

    return jsonify({
        "student_id": user_id,
        "role": db_role,
        "name": name,
        "token": token,
        "message": "Login successful"
    }), 200


# 8. Health check
@app.route("/")
def home():
    return "AI Complaint Backend Running"


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)