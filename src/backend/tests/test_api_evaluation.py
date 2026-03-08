"""評価API エンドポイントのテスト"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_testcases_returns_list() -> None:
    response = client.get("/api/evaluation/testcases")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    tc = data[0]
    assert "id" in tc
    assert "spec_ref" in tc
    assert "evidence_count" in tc
    assert "defect_count" in tc


def test_get_testcase_returns_detail() -> None:
    response = client.get("/api/evaluation/testcases/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "1"
    assert "spec_ref" in data
    assert isinstance(data["evidences"], list)
    assert isinstance(data["defects"], list)


def test_get_testcase_not_found() -> None:
    response = client.get("/api/evaluation/testcases/999")
    assert response.status_code == 404


def test_list_defects_returns_list() -> None:
    response = client.get("/api/evaluation/defects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    defect = data[0]
    assert "id" in defect
    assert "title" in defect
    assert "test_case_id" in defect
