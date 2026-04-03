"""Centralized logging for the Blogy backend."""
from __future__ import annotations

import logging
import sys


def setup_logging(level: str = "INFO") -> logging.Logger:
    """Configure structured logging for the application."""
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-7s | %(name)-20s | %(message)s",
        datefmt="%H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger("blogy")
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    if not root.handlers:
        root.addHandler(handler)
    root.propagate = False

    return root


def get_logger(name: str) -> logging.Logger:
    """Get a child logger under the 'blogy' namespace."""
    return logging.getLogger(f"blogy.{name}")
