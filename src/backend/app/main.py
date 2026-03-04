"""FastAPI アプリケーションのエントリポイント"""

from fastapi import FastAPI

from app.api.collection import router as collection_router

app = FastAPI(title="Test Supporter API")
app.include_router(collection_router)
