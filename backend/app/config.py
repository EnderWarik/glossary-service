from __future__ import annotations

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file='.env', env_ignore_empty=True, extra='ignore')

	app_env: str = "development"
	backend_cors_origins: str = "http://localhost:8080"
	database_url: str | None = None
	api_auth_token: str | None = None

	def cors_origins(self) -> List[str]:
		return [o.strip() for o in self.backend_cors_origins.split(',') if o.strip()]

settings = Settings()
