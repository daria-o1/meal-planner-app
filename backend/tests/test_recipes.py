import json
import pytest
from fastapi import status
from app.db.dynamodb import create_recipe, get_recipe

def test_create_recipe(client, sample_recipe):
    """Test creating a recipe."""
    response = client.post("/api/recipes/", json=sample_recipe)
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == sample_recipe["name"]
    assert data["description"] == sample_recipe["description"]
    assert "id" in data
    assert len(data["ingredients"]) == len(sample_recipe["ingredients"])

def test_get_recipes_empty(client):
    """Test getting recipes when none exist."""
    response = client.get("/api/recipes/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

def test_get_recipes(client, sample_recipe):
    """Test getting recipes after creating one."""
    # Create a recipe first
    create_response = client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    
    # Get all recipes
    response = client.get("/api/recipes/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == sample_recipe["name"]

def test_get_recipe_by_id(client, sample_recipe):
    """Test getting a specific recipe by ID."""
    # Create a recipe first
    create_response = client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe_id = create_response.json()["id"]
    
    # Get the recipe by ID
    response = client.get(f"/api/recipes/{recipe_id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == recipe_id
    assert data["name"] == sample_recipe["name"]
    assert data["description"] == sample_recipe["description"]

def test_get_recipe_not_found(client):
    """Test getting a recipe that doesn't exist."""
    response = client.get("/api/recipes/nonexistent-id")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "detail" in response.json()

def test_update_recipe(client, sample_recipe):
    """Test updating a recipe."""
    # Create a recipe first
    create_response = client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe_id = create_response.json()["id"]
    
    # Update the recipe
    updated_data = {
        "name": "Updated Recipe Name",
        "description": "Updated description",
        "servings": 6
    }
    response = client.put(f"/api/recipes/{recipe_id}", json=updated_data)
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == recipe_id
    assert data["name"] == updated_data["name"]
    assert data["description"] == updated_data["description"]
    assert data["servings"] == updated_data["servings"]
    # Fields not included in the update should remain unchanged
    assert data["prep_time"] == sample_recipe["prep_time"]
    assert data["cook_time"] == sample_recipe["cook_time"]

def test_update_recipe_not_found(client, sample_recipe):
    """Test updating a recipe that doesn't exist."""
    updated_data = {
        "name": "Updated Recipe Name",
        "description": "Updated description"
    }
    response = client.put("/api/recipes/nonexistent-id", json=updated_data)
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "detail" in response.json()

def test_delete_recipe(client, sample_recipe):
    """Test deleting a recipe."""
    # Create a recipe first
    create_response = client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe_id = create_response.json()["id"]
    
    # Delete the recipe
    response = client.delete(f"/api/recipes/{recipe_id}")
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify the recipe is deleted
    get_response = client.get(f"/api/recipes/{recipe_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_recipe_not_found(client):
    """Test deleting a recipe that doesn't exist."""
    response = client.delete("/api/recipes/nonexistent-id")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "detail" in response.json() 