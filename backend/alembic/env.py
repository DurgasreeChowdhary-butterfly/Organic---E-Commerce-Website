"""
Alembic migration environment. Wires Alembic's target_metadata to our
SQLAlchemy Base so `alembic revision --autogenerate` picks up model changes.
TODO: wire settings.DATABASE_URL and app.models imports here.
"""
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# from app.core.config import settings
# from app.db.base import Base
# import app.models  # noqa: ensures all models are registered

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = None  # TODO: set to Base.metadata


def run_migrations_offline():
    raise NotImplementedError


def run_migrations_online():
    raise NotImplementedError


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
