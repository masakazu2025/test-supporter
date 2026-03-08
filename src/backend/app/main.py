"""FastAPI アプリケーションのエントリポイント"""

from fastapi import FastAPI

from app.api.collection import router as collection_router
from app.api.settings import router as settings_router
from app.api.terminal import router as terminal_router
from app.api.evaluation import router as evaluation_router

app = FastAPI(title="Test Supporter API")
app.include_router(collection_router)
app.include_router(settings_router)
app.include_router(terminal_router)
app.include_router(evaluation_router)
