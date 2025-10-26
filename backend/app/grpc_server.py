from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Optional

import grpc
from grpc_reflection.v1alpha import reflection
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app import crud
from .protos import glossary_pb2 as pb
from .protos import glossary_pb2_grpc as pb_grpc


def _iso(dt: datetime | None) -> str:
    return dt.isoformat() if dt else ""


def _term_to_pb(obj) -> pb.Term:
    synonyms = obj.synonyms.split(",") if obj.synonyms else []
    tags = obj.tags.split(",") if obj.tags else []
    source = pb.SourceInfo(
        title=obj.source_title or "",
        authors=obj.source_authors or "",
        year=int(obj.source_year or 0),
        link=obj.source_link or "",
    )
    return pb.Term(
        id=obj.id,
        term=obj.term,
        definition=obj.definition,
        synonyms=synonyms,
        tags=tags,
        source=source,
        created_at=_iso(obj.created_at),
        updated_at=_iso(obj.updated_at),
    )


class GlossaryService(pb_grpc.GlossaryServiceServicer):
    def __init__(self) -> None:
        pass

    def _db(self) -> Session:
        return SessionLocal()

    async def Health(self, request: pb.Empty, context: grpc.aio.ServicerContext) -> pb.Empty:  # type: ignore[override]
        return pb.Empty()

    async def ListTerms(self, request: pb.ListTermsRequest, context: grpc.aio.ServicerContext) -> pb.ListTermsResponse:  # type: ignore[override]
        with self._db() as db:
            items = crud.list_terms(db, query=request.query or None, limit=request.limit or 100, offset=request.offset or 0)
            return pb.ListTermsResponse(items=[_term_to_pb(i) for i in items])

    async def GetTermByKeyword(self, request: pb.TermByKeywordRequest, context: grpc.aio.ServicerContext) -> pb.Term:  # type: ignore[override]
        with self._db() as db:
            obj = crud.get_term_by_keyword(db, keyword=request.keyword)
            if not obj:
                await context.abort(grpc.StatusCode.NOT_FOUND, "Term not found")
            return _term_to_pb(obj)

    async def CreateTerm(self, request: pb.CreateTermRequest, context: grpc.aio.ServicerContext) -> pb.Term:  # type: ignore[override]
        with self._db() as db:
            data = type("TermCreateLike", (), {})()
            data.term = request.term
            data.definition = request.definition
            data.synonyms = list(request.synonyms)
            data.tags = list(request.tags)
            if request.HasField("source"):
                data.source = type("SourceLike", (), dict(
                    title=request.source.title or None,
                    authors=request.source.authors or None,
                    year=int(request.source.year) if request.source.year else None,
                    link=request.source.link or None,
                ))
            else:
                data.source = None
            obj = crud.create_term(db, data)  # type: ignore[arg-type]
            return _term_to_pb(obj)

    async def UpdateTerm(self, request: pb.UpdateTermRequest, context: grpc.aio.ServicerContext) -> pb.Term:  # type: ignore[override]
        with self._db() as db:
            data = type("TermUpdateLike", (), {})()
            data.term = request.term if request.HasField("term") else None
            data.definition = request.definition if request.HasField("definition") else None
            data.synonyms = list(request.synonyms) if len(request.synonyms) > 0 or request.HasField("synonyms") else None
            data.tags = list(request.tags) if len(request.tags) > 0 or request.HasField("tags") else None
            if request.HasField("source"):
                s = request.source
                data.source = type("SourceLike", (), dict(
                    title=s.title or None,
                    authors=s.authors or None,
                    year=int(s.year) if s.year else None,
                    link=s.link or None,
                ))
            else:
                data.source = None if request.ByteSize() else None
            obj = crud.update_term(db, int(request.id), data)  # type: ignore[arg-type]
            if not obj:
                await context.abort(grpc.StatusCode.NOT_FOUND, "Term not found")
            return _term_to_pb(obj)

    async def DeleteTerm(self, request: pb.DeleteTermRequest, context: grpc.aio.ServicerContext) -> pb.Empty:  # type: ignore[override]
        with self._db() as db:
            ok = crud.delete_term(db, int(request.id))
            if not ok:
                await context.abort(grpc.StatusCode.NOT_FOUND, "Term not found")
        return pb.Empty()

    async def CreateRelation(self, request: pb.CreateRelationRequest, context: grpc.aio.ServicerContext) -> pb.Relation:  # type: ignore[override]
        with self._db() as db:
            data = type("RelationCreateLike", (), dict(
                source_id=int(request.source_id),
                target_id=int(request.target_id),
                type=request.type,
            ))
            obj = crud.create_relation(db, data)  # type: ignore[arg-type]
            return pb.Relation(id=obj.id, source_id=obj.source_id, target_id=obj.target_id, type=obj.type)

    async def UpdateRelation(self, request: pb.UpdateRelationRequest, context: grpc.aio.ServicerContext) -> pb.Relation:  # type: ignore[override]
        with self._db() as db:
            data = type("RelationUpdateLike", (), dict(
                source_id=int(request.source_id) if request.HasField("source_id") else None,
                target_id=int(request.target_id) if request.HasField("target_id") else None,
                type=request.type if request.HasField("type") else None,
            ))
            obj = crud.update_relation(db, int(request.id), data)  # type: ignore[arg-type]
            if not obj:
                await context.abort(grpc.StatusCode.NOT_FOUND, "Relation not found")
            return pb.Relation(id=obj.id, source_id=obj.source_id, target_id=obj.target_id, type=obj.type)

    async def DeleteRelation(self, request: pb.DeleteRelationRequest, context: grpc.aio.ServicerContext) -> pb.Empty:  # type: ignore[override]
        with self._db() as db:
            ok = crud.delete_relation(db, int(request.id))
            if not ok:
                await context.abort(grpc.StatusCode.NOT_FOUND, "Relation not found")
        return pb.Empty()

    async def ListRelations(self, request: pb.Empty, context: grpc.aio.ServicerContext) -> pb.ListRelationsResponse:  # type: ignore[override]
        with self._db() as db:
            items = crud.list_relations(db)
            return pb.ListRelationsResponse(items=[pb.Relation(id=i.id, source_id=i.source_id, target_id=i.target_id, type=i.type) for i in items])

    async def GetGraph(self, request: pb.Empty, context: grpc.aio.ServicerContext) -> pb.Graph:  # type: ignore[override]
        with self._db() as db:
            terms = crud.list_terms(db, limit=10000)
            rels = crud.list_relations(db)
            return pb.Graph(
                nodes=[_term_to_pb(i) for i in terms],
                edges=[pb.Relation(id=r.id, source_id=r.source_id, target_id=r.target_id, type=r.type) for r in rels],
            )


async def serve(bind: str = "0.0.0.0:50051") -> None:
    server = grpc.aio.server()
    pb_grpc.add_GlossaryServiceServicer_to_server(GlossaryService(), server)
    service_names = (
        pb.DESCRIPTOR.services_by_name['GlossaryService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(service_names, server)
    server.add_insecure_port(bind)
    await server.start()
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())


