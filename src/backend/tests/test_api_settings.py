"""設定API エンドポイントのテスト"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_profiles_returns_list() -> None:
    response = client.get("/api/settings/profiles")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]
    assert "name" in data[0]


def test_get_profile_returns_detail() -> None:
    response = client.get("/api/settings/profiles/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "1"
    assert "name" in data
    assert "archiver_path" in data
    assert isinstance(data["terminals"], list)


def test_get_profile_not_found() -> None:
    response = client.get("/api/settings/profiles/999")
    assert response.status_code == 404
