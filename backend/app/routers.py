from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app import crud
from app.schemas import TermCreate, TermUpdate, TermOut, RelationCreate, RelationOut, RelationUpdate, GraphOut

router = APIRouter()

@router.get("/health")
def health() -> dict:
	return {"status": "ok"}

@router.get("/terms", response_model=List[TermOut])
def list_terms(query: Optional[str] = Query(None), limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
	items = crud.list_terms(db, query=query, limit=limit, offset=offset)
	return [
		TermOut(
			id=i.id,
			term=i.term,
			definition=i.definition,
			synonyms=i.synonyms.split(",") if i.synonyms else None,
			tags=i.tags.split(",") if i.tags else None,
			source={
				"title": i.source_title,
				"authors": i.source_authors,
				"year": i.source_year,
				"link": i.source_link,
			},
			created_at=i.created_at,
			updated_at=i.updated_at,
		)
		for i in items
	]

@router.get("/terms/by-keyword/{keyword}", response_model=TermOut)
def get_term_by_keyword(keyword: str, db: Session = Depends(get_db)):
	obj = crud.get_term_by_keyword(db, keyword=keyword)
	if not obj:
		raise HTTPException(status_code=404, detail="Term not found")
	return TermOut(
		id=obj.id,
		term=obj.term,
		definition=obj.definition,
		synonyms=obj.synonyms.split(",") if obj.synonyms else None,
		tags=obj.tags.split(",") if obj.tags else None,
		source={
			"title": obj.source_title,
			"authors": obj.source_authors,
			"year": obj.source_year,
			"link": obj.source_link,
		},
		created_at=obj.created_at,
		updated_at=obj.updated_at,
	)

@router.post("/terms", response_model=TermOut, status_code=201)
def create_term(data: TermCreate, db: Session = Depends(get_db)):
	obj = crud.create_term(db, data)
	return get_term_by_keyword(obj.term, db)

@router.put("/terms/{term_id}", response_model=TermOut)
def update_term(term_id: int, data: TermUpdate, db: Session = Depends(get_db)):
	obj = crud.update_term(db, term_id, data)
	if not obj:
		raise HTTPException(status_code=404, detail="Term not found")
	return get_term_by_keyword(obj.term, db)

@router.delete("/terms/{term_id}", status_code=204)
def delete_term(term_id: int, db: Session = Depends(get_db)):
	ok = crud.delete_term(db, term_id)
	if not ok:
		raise HTTPException(status_code=404, detail="Term not found")
	return None

@router.post("/relations", response_model=RelationOut, status_code=201)
def create_relation(data: RelationCreate, db: Session = Depends(get_db)):
	return crud.create_relation(db, data)

@router.get("/relations", response_model=List[RelationOut])
def list_relations(db: Session = Depends(get_db)):
    return [RelationOut(id=r.id, source_id=r.source_id, target_id=r.target_id, type=r.type) for r in crud.list_relations(db)]

@router.put("/relations/{relation_id}", response_model=RelationOut)
def update_relation(relation_id: int, data: RelationUpdate, db: Session = Depends(get_db)):
    obj = crud.update_relation(db, relation_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail="Relation not found")
    return RelationOut(id=obj.id, source_id=obj.source_id, target_id=obj.target_id, type=obj.type)

@router.delete("/relations/{relation_id}", status_code=204)
def delete_relation(relation_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_relation(db, relation_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Relation not found")
    return None

@router.get("/graph", response_model=GraphOut)
def get_graph(db: Session = Depends(get_db)):
	terms = crud.list_terms(db, limit=10000)
	relations = crud.list_relations(db)
	return GraphOut(
		nodes=[
			TermOut(
				id=i.id,
				term=i.term,
				definition=i.definition,
				synonyms=i.synonyms.split(",") if i.synonyms else None,
				tags=i.tags.split(",") if i.tags else None,
				source={
					"title": i.source_title,
					"authors": i.source_authors,
					"year": i.source_year,
					"link": i.source_link,
				},
				created_at=i.created_at,
				updated_at=i.updated_at,
			)
			for i in terms
		],
		edges=[
			RelationOut(id=r.id, source_id=r.source_id, target_id=r.target_id, type=r.type)
			for r in relations
		],
	)
