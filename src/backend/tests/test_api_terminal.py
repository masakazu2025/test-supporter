"""端末API エンドポイントのテスト"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_entries_returns_list() -> None:
    response = client.get("/api/terminal/192.168.1.10/entries")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    entry = data[0]
    assert "entry_id" in entry
    assert "filename" in entry
    assert "captured_at" in entry
    assert "in_pool" in entry


def test_list_screenshots_returns_list() -> None:
    response = client.get("/api/terminal/192.168.1.10/screenshots")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    screenshot = data[0]
    assert "filename" in screenshot
    assert "captured_at" in screenshot
    assert "in_pool" in screenshot


def test_list_management_returns_list() -> None:
    response = client.get("/api/terminal/management")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    t = data[0]
    assert "id" in t
    assert "ip_address" in t
    assert "auto_collect" in t
    assert "collect_date_mode" in t
    assert "collect_date" in t


def test_get_pool_stats() -> None:
    response = client.get("/api/terminal/t1/pool-stats")
    assert response.status_code == 200
    data = response.json()
    assert "file_count" in data
    assert "total_bytes" in data


def test_cleanup_pool_all() -> None:
    response = client.post("/api/terminal/t1/cleanup", json={"mode": "all"})
    assert response.status_code == 200
    data = response.json()
    assert "deleted_count" in data
    assert "freed_bytes" in data


def test_cleanup_pool_before_date() -> None:
    response = client.post(
        "/api/terminal/t1/cleanup",
        json={"mode": "before", "date_from": "2026-03-01"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "deleted_count" in data
