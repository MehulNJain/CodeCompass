from fastapi.testclient import TestClient


def test_liveness_needs_no_services(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_unbuilt_endpoints_answer_501_not_404(client: TestClient) -> None:
    """A 404 would tell the frontend the URL is wrong. 501 says the route is
    real and the module is not built."""
    response = client.get("/api/v1/graph/repository/1")
    assert response.status_code == 501
    assert "module M3" in response.json()["detail"]


def test_openapi_is_served(client: TestClient) -> None:
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    assert "/api/v1/repositories" in response.json()["paths"]
