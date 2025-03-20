import pytest
from fastapi.testclient import TestClient
from fastapi import status

def test_create_and_retrieve_recipe_flow(client, sample_recipe):
    """Test the full flow of creating and retrieving a recipe."""
    # 1. Create a recipe
    create_response = client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_recipe = create_response.json()
    recipe_id = created_recipe["id"]
    
    # 2. Get the recipe by ID
    get_response = client.get(f"/api/recipes/{recipe_id}")
    assert get_response.status_code == status.HTTP_200_OK
    retrieved_recipe = get_response.json()
    assert retrieved_recipe["id"] == recipe_id
    assert retrieved_recipe["name"] == sample_recipe["name"]
    
    # 3. Update the recipe
    updated_data = {
        "name": "Updated Recipe Name",
        "description": "Updated description"
    }
    update_response = client.put(f"/api/recipes/{recipe_id}", json=updated_data)
    assert update_response.status_code == status.HTTP_200_OK
    updated_recipe = update_response.json()
    assert updated_recipe["name"] == updated_data["name"]
    
    # 4. Verify the update
    get_updated_response = client.get(f"/api/recipes/{recipe_id}")
    assert get_updated_response.status_code == status.HTTP_200_OK
    retrieved_updated_recipe = get_updated_response.json()
    assert retrieved_updated_recipe["name"] == updated_data["name"]
    
    # 5. Delete the recipe
    delete_response = client.delete(f"/api/recipes/{recipe_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    
    # 6. Verify deletion
    get_deleted_response = client.get(f"/api/recipes/{recipe_id}")
    assert get_deleted_response.status_code == status.HTTP_404_NOT_FOUND

def test_meal_planning_flow(client, sample_recipe, sample_meal_plan, sample_grocery_list):
    """Test the full flow of meal planning."""
    # 1. Create a recipe
    create_recipe_response = client.post("/api/recipes/", json=sample_recipe)
    assert create_recipe_response.status_code == status.HTTP_201_CREATED
    created_recipe = create_recipe_response.json()
    recipe_id = created_recipe["id"]
    
    # Update the meal plan to use the created recipe
    sample_meal_plan["recipes"][0]["recipe_id"] = recipe_id
    
    # 2. Create a meal plan
    create_meal_plan_response = client.post("/api/meal-plans/", json=sample_meal_plan)
    assert create_meal_plan_response.status_code == status.HTTP_201_CREATED
    created_meal_plan = create_meal_plan_response.json()
    meal_plan_id = created_meal_plan["id"]
    
    # 3. Get the meal plan
    get_meal_plan_response = client.get(f"/api/meal-plans/{meal_plan_id}")
    assert get_meal_plan_response.status_code == status.HTTP_200_OK
    
    # Update the grocery list to use the created meal plan
    sample_grocery_list["meal_plan_id"] = meal_plan_id
    
    # 4. Create a grocery list
    create_grocery_list_response = client.post("/api/grocery-lists/", json=sample_grocery_list)
    assert create_grocery_list_response.status_code == status.HTTP_201_CREATED
    created_grocery_list = create_grocery_list_response.json()
    grocery_list_id = created_grocery_list["id"]
    
    # 5. Get the grocery list
    get_grocery_list_response = client.get(f"/api/grocery-lists/{grocery_list_id}")
    assert get_grocery_list_response.status_code == status.HTTP_200_OK
    
    # 6. Clean up - delete grocery list
    delete_grocery_list_response = client.delete(f"/api/grocery-lists/{grocery_list_id}")
    assert delete_grocery_list_response.status_code == status.HTTP_204_NO_CONTENT
    
    # 7. Clean up - delete meal plan
    delete_meal_plan_response = client.delete(f"/api/meal-plans/{meal_plan_id}")
    assert delete_meal_plan_response.status_code == status.HTTP_204_NO_CONTENT
    
    # 8. Clean up - delete recipe
    delete_recipe_response = client.delete(f"/api/recipes/{recipe_id}")
    assert delete_recipe_response.status_code == status.HTTP_204_NO_CONTENT

def test_error_handling(client):
    """Test API error handling."""
    # Test 404 for non-existent recipe
    get_response = client.get("/api/recipes/nonexistent-id")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    # Test 404 for non-existent meal plan
    get_response = client.get("/api/meal-plans/nonexistent-id")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    # Test 404 for non-existent grocery list
    get_response = client.get("/api/grocery-lists/nonexistent-id")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
    
    # Test validation error for invalid recipe data
    invalid_recipe = {
        "name": "Invalid Recipe",
        # Missing required fields
    }
    create_response = client.post("/api/recipes/", json=invalid_recipe)
    assert create_response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY 