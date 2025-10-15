from __future__ import annotations

from logging.config import fileConfig
import os

from sqlalchemy import engine_from_config, pool
from alembic import context

import app.models as models

config = context.config
fileConfig(config.config_file_name)

target_metadata = models.Base.metadata

def get_url() -> str:
	url = os.getenv("DATABASE_URL")
	if not url:
		raise RuntimeError("DATABASE_URL is not set")
	return url

def run_migrations_online() -> None:
	configuration = config.get_section(config.config_ini_section) or {}
	configuration["sqlalchemy.url"] = get_url()
	connectable = engine_from_config(
		configuration,
		prefix="sqlalchemy.",
		poolclass=pool.NullPool,
	)
	with connectable.connect() as connection:
		context.configure(connection=connection, target_metadata=target_metadata)
		with context.begin_transaction():
			context.run_migrations()

run_migrations_online()
