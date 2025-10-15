from __future__ import annotations

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, or_, update, delete

from app import models
from app.schemas import TermCreate, TermUpdate, RelationCreate, RelationUpdate


def list_terms(db: Session, query: Optional[str] = None, limit: int = 100, offset: int = 0) -> List[models.Term]:
	stmt = select(models.Term)
	if query:
		q = f"%{query.lower()}%"
		stmt = stmt.where(
			or_(
				models.Term.term.ilike(q),
				models.Term.definition.ilike(q),
				models.Term.synonyms.ilike(q),
				models.Term.tags.ilike(q),
			)
		)
	stmt = stmt.order_by(models.Term.term).limit(limit).offset(offset)
	return list(db.scalars(stmt).all())


def get_term_by_id(db: Session, term_id: int) -> Optional[models.Term]:
	return db.get(models.Term, term_id)


def get_term_by_keyword(db: Session, keyword: str) -> Optional[models.Term]:
	stmt = select(models.Term).where(models.Term.term.ilike(keyword))
	return db.scalars(stmt).first()


def create_term(db: Session, data: TermCreate) -> models.Term:
	synonyms = ",".join(data.synonyms) if data.synonyms else None
	tags = ",".join(data.tags) if data.tags else None
	source_title = data.source.title if data.source else None
	source_authors = data.source.authors if data.source else None
	source_year = data.source.year if data.source else None
	source_link = data.source.link if data.source else None
	obj = models.Term(
		term=data.term,
		definition=data.definition,
		synonyms=synonyms,
		tags=tags,
		source_title=source_title,
		source_authors=source_authors,
		source_year=source_year,
		source_link=source_link,
	)
	db.add(obj)
	db.commit()
	db.refresh(obj)
	return obj


def update_term(db: Session, term_id: int, data: TermUpdate) -> Optional[models.Term]:
	obj = db.get(models.Term, term_id)
	if not obj:
		return None
	if data.term is not None:
		obj.term = data.term
	if data.definition is not None:
		obj.definition = data.definition
	if data.synonyms is not None:
		obj.synonyms = ",".join(data.synonyms)
	if data.tags is not None:
		obj.tags = ",".join(data.tags)
	if data.source is not None:
		obj.source_title = data.source.title
		obj.source_authors = data.source.authors
		obj.source_year = data.source.year
		obj.source_link = data.source.link
	db.commit()
	db.refresh(obj)
	return obj


def delete_term(db: Session, term_id: int) -> bool:
	obj = db.get(models.Term, term_id)
	if not obj:
		return False
	db.delete(obj)
	db.commit()
	return True


def create_relation(db: Session, data: RelationCreate) -> models.Relation:
	obj = models.Relation(**data.model_dump())
	db.add(obj)
	db.commit()
	db.refresh(obj)
	return obj


def list_relations(db: Session) -> List[models.Relation]:
	stmt = select(models.Relation)
	return list(db.scalars(stmt).all())


def update_relation(db: Session, relation_id: int, data: RelationUpdate) -> Optional[models.Relation]:
    obj = db.get(models.Relation, relation_id)
    if not obj:
        return None
    if data.source_id is not None:
        obj.source_id = data.source_id
    if data.target_id is not None:
        obj.target_id = data.target_id
    if data.type is not None:
        obj.type = data.type
    db.commit()
    db.refresh(obj)
    return obj


def delete_relation(db: Session, relation_id: int) -> bool:
    obj = db.get(models.Relation, relation_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
