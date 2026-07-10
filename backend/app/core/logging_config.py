"""
Application-wide logging configuration.
TODO: configure structured (JSON) logging for production, plain for dev.
"""
import logging


def setup_logging(environment: str = "development") -> None:
    level = logging.DEBUG if environment == "development" else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
