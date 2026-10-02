from database.database import Base, engine
from database.models import Scan, ActivityLog, Threat, Report


def init_db():
    Base.metadata.create_all(bind=engine)
    print("CyberShield AI database initialized successfully.")


if __name__ == "__main__":
    init_db()