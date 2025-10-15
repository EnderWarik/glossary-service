from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

class Term(Base):
	__tablename__ = "terms"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	term: Mapped[str] = mapped_column(String(255), unique=True, index=True)
	definition: Mapped[str] = mapped_column(Text)
	synonyms: Mapped[str | None] = mapped_column(Text, nullable=True)
	tags: Mapped[str | None] = mapped_column(Text, nullable=True)
	source_title: Mapped[str | None] = mapped_column(String(512), nullable=True)
	source_authors: Mapped[str | None] = mapped_column(String(512), nullable=True)
	source_year: Mapped[int | None] = mapped_column(nullable=True)
	source_link: Mapped[str | None] = mapped_column(String(1024), nullable=True)
	created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
	updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

	relations_from: Mapped[list[Relation]] = relationship(
		"Relation", back_populates="source", foreign_keys="Relation.source_id"
	)
	relations_to: Mapped[list[Relation]] = relationship(
		"Relation", back_populates="target", foreign_keys="Relation.target_id"
	)

class Relation(Base):
	__tablename__ = "relations"

	id: Mapped[int] = mapped_column(primary_key=True)
	source_id: Mapped[int] = mapped_column(ForeignKey("terms.id", ondelete="CASCADE"))
	target_id: Mapped[int] = mapped_column(ForeignKey("terms.id", ondelete="CASCADE"))
	type: Mapped[str] = mapped_column(String(64))  # is-a, part-of, related-to, synonym-of, derived-from

	source: Mapped[Term] = relationship("Term", foreign_keys=[source_id], back_populates="relations_from")
	target: Mapped[Term] = relationship("Term", foreign_keys=[target_id], back_populates="relations_to")
