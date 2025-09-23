import sqlite3
import time
from typing import Optional

db_path= "crew.db"

def init_db():
    conn = sqlite3.connect(db_path)
    cursor= conn.cursor()

    cursor.execute(
        """CREATE TABLE IF NOT EXISTS human_fb_req (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        prompt TEXT,
        agent_response TEXT,
        status TEXT)"""
    )
    cursor.execute(
        """CREATE TABLE IF NOT EXISTS human_fb_res (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        req_id INTEGER,
        response TEXT,
        FOREIGN KEY (req_id) REFERENCES human_fb_req(id))"""
    )

    conn.commit()
    conn.close()


def save_feedback_request(session_id: str, prompt: str) -> int:
    """Insert a new feedback request into DB and return its ID."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO human_fb_req (session_id, prompt, agent_response, status) VALUES (?, ?, ?, ?)",
        (session_id, prompt, "pending")
    )
    fb_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return fb_id  # this is the feedback id


def save_agent_response(fb_id: int, agent_response: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE human_fb_req SET agent_response=? WHERE id=?",
        (agent_response, fb_id)
    )
    conn.commit()
    conn.close()

def save_feedback_response(fb_id: int, response: str):
    """Save human feedback response linked to a request."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE human_fb_req SET response=?, status=? WHERE id=?",
        (response,"completed", fb_id)
    )

    conn.commit()
    conn.close()

def wait_for_feedback_response(fb_id: int, timeout: int = 300, interval: int = 2) -> str:
    """Poll DB until feedback response arrives or timeout."""
    start = time.time()
    while time.time() - start < timeout:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT response FROM human_fb_res WHERE req_id=?", (fb_id,))
        row = cursor.fetchone()
        conn.close()
        if row and row[0]:
            return row[0]
        time.sleep(interval)
    raise TimeoutError("No human feedback received in time.")

def get_feedback_request(req_id: int):
    """Fetch a feedback request by ID (for debugging or API use)."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM human_fb_req WHERE id=?", (req_id,))
    row = cursor.fetchone()
    conn.close()
    return row