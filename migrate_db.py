import mysql.connector
import pandas as pd
import bcrypt

def migrate():
    # Connect to DB
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="12@34#",
        database="complaints_db"
    )
    cursor = conn.cursor()

    print("Adding department column to users table...")
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN department VARCHAR(100) DEFAULT NULL")
        conn.commit()
        print("Column added.")
    except mysql.connector.Error as err:
        if err.errno == 1060: # Duplicate column name
            print("Column 'department' already exists.")
        else:
            print(f"Error: {err}")

    # Read unique departments
    print("Reading departments from CSV...")
    df = pd.read_csv('backend/data/complaints.csv')
    departments = df['department'].unique()
    
    # Capitalize appropriately to match typical frontend expectations
    # Actually, the model uses whatever is in the CSV, so we use exactly that.
    
    print("Seeding admin users...")
    
    password = b"admin123"
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt()).decode('utf-8')
    
    for dept in departments:
        name = f"{dept} Admin"
        email = f"{dept.lower().replace(' ', '')}@admin.com"
        
        # Check if exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO users (name, email, password, role, department)
                VALUES (%s, %s, %s, 'admin', %s)
            """, (name, email, hashed_password, dept))
            print(f"Added {name} ({email})")
        else:
            print(f"User {email} already exists.")
            
    conn.commit()
    cursor.close()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
