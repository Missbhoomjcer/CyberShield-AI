from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite database for local development
DATABASE_URL = "sqlite:///./cybershield.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """
    Provides a database session to FastAPI endpoints.
    The session is automatically closed after use.
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()