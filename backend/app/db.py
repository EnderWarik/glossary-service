from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

class Base(DeclarativeBase):
	pass

if not settings.database_url:
	raise RuntimeError("DATABASE_URL must be set (Postgres DSN)")
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
