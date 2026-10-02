from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from database.database import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=True)

    sha256 = Column(String(64), nullable=True, index=True)
    entropy = Column(Float, nullable=True)

    prediction = Column(String(100), nullable=True)
    threat_score = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)

    model = Column(String(100), nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    cpu_usage = Column(Float, nullable=True)
    memory_usage = Column(Float, nullable=True)
    process_count = Column(Integer, nullable=True)
    file_change_count = Column(Integer, nullable=True)
    network_connection_count = Column(Integer, nullable=True)
    suspicious_process_count = Column(Integer, nullable=True)
    suspicious_score = Column(Float, nullable=True)

    prediction = Column(String(100), nullable=True)
    risk_score = Column(Float, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)

    threat_type = Column(String(100), nullable=False)
    severity = Column(String(50), nullable=True)

    description = Column(Text, nullable=True)

    source = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=True)

    status = Column(
        String(50),
        default="Open"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    report_type = Column(String(100), nullable=True)

    content = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )