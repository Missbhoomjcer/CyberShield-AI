
import sqlite3
import json
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api", tags=["Dashboard and Management"])

DB_PATH = Path(__file__).resolve().parent.parent / "cybershield.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def rows_to_dict(rows):
    return [dict(row) for row in rows]


@router.get("/dashboard")
def dashboard():
    conn = get_db()
    try:
        total = conn.execute(
            "SELECT COUNT(*) FROM scans"
        ).fetchone()[0]

        threats = conn.execute("""
            SELECT COUNT(*) FROM scans
            WHERE LOWER(prediction) NOT LIKE '%benign%'
              AND LOWER(prediction) NOT LIKE '%no malware%'
              AND prediction IS NOT NULL
        """).fetchone()[0]

        recent = conn.execute("""
            SELECT * FROM scans
            ORDER BY id DESC LIMIT 10
        """).fetchall()

        return {
            "total_scans": total,
            "threats_detected": threats,
            "benign_scans": max(0, total - threats),
            "recent_scans": rows_to_dict(recent)
        }
    finally:
        conn.close()


@router.get("/scans")
def scan_history(limit: int = 100, offset: int = 0):
    if limit < 1 or limit > 500 or offset < 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid limit or offset"
        )

    conn = get_db()
    try:
        total = conn.execute(
            "SELECT COUNT(*) FROM scans"
        ).fetchone()[0]

        records = conn.execute("""
            SELECT * FROM scans
            ORDER BY id DESC LIMIT ? OFFSET ?
        """, (limit, offset)).fetchall()

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "scans": rows_to_dict(records)
        }
    finally:
        conn.close()


@router.get("/threats")
def get_threats():
    conn = get_db()
    try:
        records = conn.execute("""
            SELECT * FROM threats
            ORDER BY id DESC
        """).fetchall()

        return {
            "total": len(records),
            "threats": rows_to_dict(records)
        }
    finally:
        conn.close()


@router.get("/reports")
def get_reports():
    conn = get_db()
    try:
        records = conn.execute("""
            SELECT * FROM reports
            ORDER BY id DESC
        """).fetchall()

        return {
            "total": len(records),
            "reports": rows_to_dict(records)
        }
    finally:
        conn.close()


@router.post("/reports/generate")
def generate_report():
    conn = get_db()
    try:
        scans = conn.execute("""
            SELECT * FROM scans ORDER BY id DESC
        """).fetchall()

        total = len(scans)
        detected = sum(
            1 for scan in scans
            if scan["prediction"]
            and "benign" not in scan["prediction"].lower()
            and "no malware" not in scan["prediction"].lower()
        )

        content = {
            "generated_at": datetime.now().isoformat(),
            "total_scans": total,
            "threats_detected": detected,
            "benign_scans": total - detected,
            "scans": rows_to_dict(scans)
        }

        title = f"Scan Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

        cursor = conn.execute("""
            INSERT INTO reports
                (title, report_type, content, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            title,
            "scan_summary",
            json.dumps(content),
            datetime.now().isoformat()
        ))

        conn.commit()

        return {
            "id": cursor.lastrowid,
            "title": title,
            "report_type": "scan_summary",
            "content": content
        }
    finally:
        conn.close()