from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class SourceInfo(BaseModel):
	title: Optional[str] = None
	authors: Optional[str] = None
	year: Optional[int] = None
	link: Optional[str] = None

class TermBase(BaseModel):
	term: str = Field(..., min_length=1, max_length=255)
	definition: str
	synonyms: Optional[List[str]] = None
	tags: Optional[List[str]] = None
	source: Optional[SourceInfo] = None

class TermCreate(TermBase):
	pass

class TermUpdate(BaseModel):
	term: Optional[str] = None
	definition: Optional[str] = None
	synonyms: Optional[List[str]] = None
	tags: Optional[List[str]] = None
	source: Optional[SourceInfo] = None

class TermOut(TermBase):
	id: int
	created_at: datetime
	updated_at: datetime

	class Config:
		from_attributes = True

class RelationBase(BaseModel):
	source_id: int
	target_id: int
	type: str = Field(..., pattern=r"^(is-a|part-of|related-to|synonym-of|derived-from)$")

class RelationCreate(RelationBase):
	pass

class RelationOut(RelationBase):
	id: int

	class Config:
		from_attributes = True

class RelationUpdate(BaseModel):
    source_id: Optional[int] = None
    target_id: Optional[int] = None
    type: Optional[str] = Field(None, pattern=r"^(is-a|part-of|related-to|synonym-of|derived-from)$")

class GraphOut(BaseModel):
	nodes: List[TermOut]
	edges: List[RelationOut]
