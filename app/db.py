import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///slabpal.db")

# Single dev user that seeded data and new batches attach to, until real auth exists.
# seed.py creates this user; create_batch/temporary.py reference it — keep them in sync.
DEV_USER_ID = "0799c44d-8b92-4b4f-b7e1-61e30b3108e2"

# check_same_thread is a SQLite-only quirk; ignore it for other backends.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for all ORM models."""


def get_session():
    """Yield a session; use as a context manager or dependency."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
