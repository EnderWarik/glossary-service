from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.middleware import bearer_auth_middleware
from app.routers import router

app = FastAPI(title="Glossary API", version="1.0.0", openapi_url="/api/openapi.json", docs_url="/api/docs", redoc_url="/api/redoc")
app.add_middleware(
	CORSMiddleware,
	allow_origins=settings.cors_origins(),
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


app.middleware("http")(bearer_auth_middleware)


app.include_router(router, prefix="/api")
