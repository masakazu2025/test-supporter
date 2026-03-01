"""採取 API エンドポイント"""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.collection_monitor import CollectionMonitor, MonitorSession, get_monitor

router = APIRouter(prefix="/api/collection", tags=["collection"])


class SessionRequest(BaseModel):
    terminal: str
    date: str


class SessionResponse(BaseModel):
    terminal: str
    date: str
    status: str


class StatusResponse(BaseModel):
    sessions: list[SessionResponse]


class SyncResponse(BaseModel):
    terminal: str
    date: str
    synced_at: datetime


def _to_response(session: MonitorSession) -> SessionResponse:
    return SessionResponse(
        terminal=session.terminal,
        date=session.date,
        status=session.status,
    )


@router.get("/status", response_model=StatusResponse)
def get_status(monitor: CollectionMonitor = Depends(get_monitor)) -> StatusResponse:
    return StatusResponse(
        sessions=[_to_response(s) for s in monitor.get_sessions()]
    )


@router.post("/start", response_model=SessionResponse)
def start_monitoring(
    req: SessionRequest,
    monitor: CollectionMonitor = Depends(get_monitor),
) -> SessionResponse:
    try:
        session = monitor.start(req.terminal, req.date)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e)) from e
    return _to_response(session)


@router.post("/stop", response_model=SessionResponse)
def stop_monitoring(
    req: SessionRequest,
    monitor: CollectionMonitor = Depends(get_monitor),
) -> SessionResponse:
    try:
        session = monitor.stop(req.terminal, req.date)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return _to_response(session)


@router.post("/sync", response_model=SyncResponse)
def sync_now(
    req: SessionRequest,
    monitor: CollectionMonitor = Depends(get_monitor),
) -> SyncResponse:
    synced_at = monitor.sync(req.terminal, req.date)
    return SyncResponse(
        terminal=req.terminal,
        date=req.date,
        synced_at=synced_at,
    )
