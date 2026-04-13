import os
import sys
import bcrypt

# Ensure the parent directory is in sys.path to resolve backend.database properly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import get_connection

def migrate_passwords():
    print("Starting password migration...")
    conn = get_connection()
    cursor = conn.cursor()

    # Fetch all users
    cursor.execute("SELECT id, email, password FROM users")
    users = cursor.fetchall()
    
    updated_count = 0
    for user_id, email, password in users:
        # Check if the password is already a bcrypt hash
        # A typical bcrypt hash in Python starts with $2b$ and is 60 characters long
        if not (password.startswith("$2") and len(password) == 60):
            print(f"Migrating password for user {email} (ID: {user_id})...")
            
            # Hash the plain text password
            hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Update in the database
            update_cursor = conn.cursor()
            update_cursor.execute("UPDATE users SET password = %s WHERE id = %s", (hashed_pw, user_id))
            conn.commit()
            update_cursor.close()
            
            updated_count += 1
            
    cursor.close()
    conn.close()
    
    print(f"Migration completed successfully. Updated {updated_count} plain text password(s) to bcrypt.")

if __name__ == "__main__":
    migrate_passwords()
