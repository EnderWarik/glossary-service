from __future__ import annotations

from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.config import settings


async def bearer_auth_middleware(request: Request, call_next):
	path = request.url.path
	if not path.startswith("/api"):
		return await call_next(request)
	if path in ("/api/openapi.json", "/api/docs", "/api/redoc") or request.method == "OPTIONS":
		return await call_next(request)
	expected = settings.api_auth_token
	if expected:
		auth = request.headers.get("authorization") or request.headers.get("Authorization")
		if not auth or not auth.lower().startswith("bearer ") or auth.split(" ", 1)[1] != expected:
			return JSONResponse({"detail": "Unauthorized"}, status_code=status.HTTP_401_UNAUTHORIZED)
	return await call_next(request)


