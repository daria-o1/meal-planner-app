import pytest
import json
import time
from fastapi import status
from app.db.db_adapter import db

def test_sqlite_recipe_crud(sqlite_client, sample_recipe):
    """Test CRUD operations for recipes using SQLite backend."""
    # Measure start time
    start_time = time.time()
    
    # 1. Create a recipe
    create_response = sqlite_client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    created_recipe = create_response.json()
    recipe_id = created_recipe["id"]
    
    # 2. Get the recipe by ID
    get_response = sqlite_client.get(f"/api/recipes/{recipe_id}")
    assert get_response.status_code == status.HTTP_200_OK
    retrieved_recipe = get_response.json()
    assert retrieved_recipe["id"] == recipe_id
    assert retrieved_recipe["name"] == sample_recipe["name"]
    
    # 3. Update the recipe
    updated_data = {
        "name": "Updated Recipe Name",
        "description": "Updated description"
    }
    update_response = sqlite_client.put(f"/api/recipes/{recipe_id}", json=updated_data)
    assert update_response.status_code == status.HTTP_200_OK
    updated_recipe = update_response.json()
    assert updated_recipe["name"] == updated_data["name"]
    
    # 4. Delete the recipe
    delete_response = sqlite_client.delete(f"/api/recipes/{recipe_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT
    
    # 5. Verify deletion
    get_deleted_response = sqlite_client.get(f"/api/recipes/{recipe_id}")
    assert get_deleted_response.status_code == status.HTTP_404_NOT_FOUND
    
    # Measure end time and print duration
    end_time = time.time()
    print(f"SQLite test duration: {end_time - start_time:.4f} seconds")

def test_sqlite_vs_dynamodb_performance(client, sqlite_client, sample_recipe):
    """Compare performance between SQLite and DynamoDB for the same operations."""
    # Test with DynamoDB mock
    dynamodb_start_time = time.time()
    
    # Create recipe with DynamoDB
    create_response = client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe_id = create_response.json()["id"]
    
    # Get recipe with DynamoDB
    client.get(f"/api/recipes/{recipe_id}")
    
    # Update recipe with DynamoDB
    client.put(f"/api/recipes/{recipe_id}", json={"name": "Updated with DynamoDB"})
    
    # Delete recipe with DynamoDB
    client.delete(f"/api/recipes/{recipe_id}")
    
    dynamodb_duration = time.time() - dynamodb_start_time
    
    # Test with SQLite
    sqlite_start_time = time.time()
    
    # Create recipe with SQLite
    create_response = sqlite_client.post("/api/recipes/", json=sample_recipe)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe_id = create_response.json()["id"]
    
    # Get recipe with SQLite
    sqlite_client.get(f"/api/recipes/{recipe_id}")
    
    # Update recipe with SQLite
    sqlite_client.put(f"/api/recipes/{recipe_id}", json={"name": "Updated with SQLite"})
    
    # Delete recipe with SQLite
    sqlite_client.delete(f"/api/recipes/{recipe_id}")
    
    sqlite_duration = time.time() - sqlite_start_time
    
    print(f"DynamoDB mock duration: {dynamodb_duration:.4f} seconds")
    print(f"SQLite duration: {sqlite_duration:.4f} seconds")
    print(f"SQLite is {dynamodb_duration / sqlite_duration:.2f}x faster than DynamoDB mock")
    
    # We expect SQLite to be faster
    assert sqlite_duration < dynamodb_duration

def test_sqlite_complex_queries(sqlite_db, sqlite_client, sample_recipe, sample_meal_plan):
    """Test more complex queries using SQLite."""
    # Create multiple recipes
    recipes = []
    for i in range(5):
        recipe_copy = sample_recipe.copy()
        recipe_copy["name"] = f"Test Recipe {i}"
        create_response = sqlite_client.post("/api/recipes/", json=recipe_copy)
        recipes.append(create_response.json())
    
    # Create meal plans for different dates
    dates = ["2023-05-01", "2023-05-02", "2023-05-03"]
    meal_plans = []
    
    for date in dates:
        meal_plan_copy = sample_meal_plan.copy()
        meal_plan_copy["date"] = date
        meal_plan_copy["recipes"] = [
            {"recipe_id": recipes[0]["id"], "meal_type": "breakfast"},
            {"recipe_id": recipes[1]["id"], "meal_type": "lunch"},
            {"recipe_id": recipes[2]["id"], "meal_type": "dinner"}
        ]
        create_response = sqlite_client.post("/api/meal-plans/", json=meal_plan_copy)
        meal_plans.append(create_response.json())
    
    # Test querying meal plans by date range
    response = sqlite_client.get("/api/meal-plans/?start_date=2023-05-01&end_date=2023-05-02")
    assert response.status_code == status.HTTP_200_OK
    result = response.json()
    assert len(result) == 2  # Should return 2 meal plans
    
    # Clean up
    for meal_plan in meal_plans:
        sqlite_client.delete(f"/api/meal-plans/{meal_plan['id']}")
    
    for recipe in recipes:
        sqlite_client.delete(f"/api/recipes/{recipe['id']}")

def test_sqlite_transaction_support(sqlite_db):
    """Test SQLite's transaction support for more reliable tests."""
    # Start a transaction
    sqlite_db.conn.execute("BEGIN TRANSACTION")
    
    # Create some test data directly in the database
    cursor = sqlite_db.conn.cursor()
    cursor.execute(
        """
        INSERT INTO items (PK, SK, GSI1PK, GSI1SK, data)
        VALUES (?, ?, ?, ?, ?)
        """,
        ("RECIPE#test1", "RECIPE#test1", "RECIPE", "Test Recipe 1", 
         json.dumps({"name": "Test Recipe 1", "description": "Test"}))
    )
    
    # Verify the data exists
    cursor.execute("SELECT * FROM items WHERE PK = 'RECIPE#test1'")
    assert cursor.fetchone() is not None
    
    # Rollback the transaction
    sqlite_db.conn.rollback()
    
    # Verify the data no longer exists
    cursor.execute("SELECT * FROM items WHERE PK = 'RECIPE#test1'")
    assert cursor.fetchone() is None
    
    # This demonstrates how SQLite's transaction support can be used
    # to create isolated tests that don't affect each other 