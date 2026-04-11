import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_connection():
    return sqlite3.connect(os.path.join(BASE_DIR, "complaints.db"))