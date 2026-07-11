"""
Organic E-commerce Platform - FastAPI Application Entry Point.

This is the main entry point that wires together middleware, routers,
and startup/shutdown events. Business logic lives in services/, data
access in crud/, and route definitions in api/v1/endpoints/.
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.router import api_router

STATIC_ROOT = Path(__file__).resolve().parent.parent / "static"
STATIC_ROOT.mkdir(exist_ok=True)

app = FastAPI(
    title="Organic Products E-commerce API",
    description="Backend API for the premium organic products e-commerce platform.",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    # Never enable Starlette's debug traceback pages in production, regardless
    # of the DEBUG env var, to avoid leaking stack traces/internals.
    debug=settings.DEBUG and settings.ENVIRONMENT != "production",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: register global exception handlers (validation errors, 404, 500)
# TODO: register request logging middleware
# TODO: register rate limiting middleware

app.mount("/static", StaticFiles(directory=str(STATIC_ROOT)), name="static")

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check():
    """Simple liveness/readiness probe for Docker/K8s."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.on_event("startup")
async def on_startup():
    # TODO: initialize DB connection pool warmup, cache, etc.
    pass


@app.on_event("shutdown")
async def on_shutdown():
    # TODO: close DB connections, flush logs, etc.
    pass
