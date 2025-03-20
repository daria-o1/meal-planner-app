import pytest
from fastapi import status

def test_root_endpoint(client):
    """Test the root endpoint of the API."""
    response = client.get("/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "message" in data
    assert "environment" in data
    assert "version" in data
    assert data["message"] == "Welcome to the Meal Planner API"

def test_cors_headers(client):
    """Test that CORS headers are properly set."""
    response = client.options(
        "/",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "access-control-allow-methods" in response.headers
    assert "GET" in response.headers["access-control-allow-methods"]
    assert "access-control-allow-headers" in response.headers
    assert "Content-Type" in response.headers["access-control-allow-headers"] 