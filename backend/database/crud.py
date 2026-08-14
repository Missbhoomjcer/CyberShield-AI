from sqlalchemy.orm import Session

from database.models import Scan, ActivityLog, Threat, Report


# ============================================================
# SCAN DAO
# ============================================================

def create_scan(db: Session, scan_data: dict):
    scan = Scan(**scan_data)

    db.add(scan)
    db.commit()
    db.refresh(scan)

    return scan


def get_scan(db: Session, scan_id: int):
    return (
        db.query(Scan)
        .filter(Scan.id == scan_id)
        .first()
    )


def get_all_scans(db: Session):
    return (
        db.query(Scan)
        .order_by(Scan.created_at.desc())
        .all()
    )


# ============================================================
# ACTIVITY DAO
# ============================================================

def create_activity_log(
    db: Session,
    activity_data: dict
):
    activity = ActivityLog(**activity_data)

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


def get_recent_activity(
    db: Session,
    limit: int = 50
):
    return (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )


# ============================================================
# THREAT DAO
# ============================================================

def create_threat(
    db: Session,
    threat_data: dict
):
    threat = Threat(**threat_data)

    db.add(threat)
    db.commit()
    db.refresh(threat)

    return threat


def get_all_threats(db: Session):
    return (
        db.query(Threat)
        .order_by(Threat.created_at.desc())
        .all()
    )


def update_threat_status(
    db: Session,
    threat_id: int,
    status: str
):
    threat = (
        db.query(Threat)
        .filter(Threat.id == threat_id)
        .first()
    )

    if threat is None:
        return None

    threat.status = status

    db.commit()
    db.refresh(threat)

    return threat


# ============================================================
# REPORT DAO
# ============================================================

def create_report(
    db: Session,
    report_data: dict
):
    report = Report(**report_data)

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def get_all_reports(db: Session):
    return (
        db.query(Report)
        .order_by(Report.created_at.desc())
        .all()
    )