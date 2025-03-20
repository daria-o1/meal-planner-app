import pytest
from datetime import datetime
from app.db.dynamodb import (
    generate_id, format_date, 
    get_recipes, get_recipe, create_recipe, update_recipe, delete_recipe,
    get_ingredients, create_ingredient,
    get_meal_plans, create_meal_plan, update_meal_plan, delete_meal_plan,
    get_grocery_lists, get_grocery_list, create_grocery_list, update_grocery_list, delete_grocery_list
)

# Recipe Tests
def test_generate_id():
    """Test ID generation."""
    id1 = generate_id()
    id2 = generate_id()
    
    assert isinstance(id1, str)
    assert len(id1) > 0
    assert id1 != id2  # IDs should be unique

def test_format_date():
    """Test date formatting."""
    # Test with datetime object
    date_obj = datetime(2023, 5, 1)
    formatted = format_date(date_obj)
    assert formatted == "2023-05-01"
    
    # Test with string
    date_str = "2023-05-01"
    formatted = format_date(date_str)
    assert formatted == date_str

def test_create_and_get_recipe(dynamodb, sample_recipe):
    """Test creating and retrieving a recipe."""
    # Create recipe
    created = create_recipe(sample_recipe)
    
    assert created["name"] == sample_recipe["name"]
    assert created["description"] == sample_recipe["description"]
    assert "id" in created
    assert "created_at" in created
    
    # Get recipe by ID
    recipe_id = created["id"]
    retrieved = get_recipe(recipe_id)
    
    assert retrieved["id"] == recipe_id
    assert retrieved["name"] == sample_recipe["name"]
    assert retrieved["description"] == sample_recipe["description"]
    
    # Get all recipes
    recipes = get_recipes()
    
    assert len(recipes) == 1
    assert recipes[0]["id"] == recipe_id

def test_update_recipe_db(dynamodb, sample_recipe):
    """Test updating a recipe in the database."""
    # Create recipe
    created = create_recipe(sample_recipe)
    recipe_id = created["id"]
    
    # Update recipe
    updated_data = {
        "name": "Updated Recipe Name",
        "description": "Updated description"
    }
    updated = update_recipe(recipe_id, updated_data)
    
    assert updated["id"] == recipe_id
    assert updated["name"] == updated_data["name"]
    assert updated["description"] == updated_data["description"]
    # Fields not included in the update should remain unchanged
    assert updated["prep_time"] == sample_recipe["prep_time"]
    
    # Verify update
    retrieved = get_recipe(recipe_id)
    assert retrieved["name"] == updated_data["name"]
    assert retrieved["description"] == updated_data["description"]

def test_delete_recipe_db(dynamodb, sample_recipe):
    """Test deleting a recipe from the database."""
    # Create recipe
    created = create_recipe(sample_recipe)
    recipe_id = created["id"]
    
    # Delete recipe
    result = delete_recipe(recipe_id)
    assert "message" in result
    
    # Verify deletion
    recipes = get_recipes()
    assert len(recipes) == 0

# Ingredient Tests
def test_create_and_get_ingredient(dynamodb, sample_ingredient):
    """Test creating and retrieving an ingredient."""
    # Create ingredient
    created = create_ingredient(sample_ingredient)
    
    assert created["name"] == sample_ingredient["name"]
    assert created["category"] == sample_ingredient["category"]
    assert "id" in created
    
    # Get all ingredients
    ingredients = get_ingredients()
    
    assert len(ingredients) == 1
    assert ingredients[0]["name"] == sample_ingredient["name"]

# Meal Plan Tests
def test_create_and_get_meal_plan(dynamodb, sample_meal_plan):
    """Test creating and retrieving a meal plan."""
    # Create meal plan
    created = create_meal_plan(sample_meal_plan)
    
    assert created["date"] == sample_meal_plan["date"]
    assert len(created["recipes"]) == len(sample_meal_plan["recipes"])
    assert "id" in created
    
    # Get all meal plans
    meal_plans = get_meal_plans()
    
    assert len(meal_plans) == 1
    assert meal_plans[0]["date"] == sample_meal_plan["date"]
    
    # Get meal plans with date filtering
    filtered_plans = get_meal_plans(start_date="2023-05-01")
    assert len(filtered_plans) == 1
    
    filtered_plans = get_meal_plans(end_date="2023-05-01")
    assert len(filtered_plans) == 1
    
    filtered_plans = get_meal_plans(start_date="2023-05-01", end_date="2023-05-01")
    assert len(filtered_plans) == 1
    
    filtered_plans = get_meal_plans(start_date="2023-05-02")
    assert len(filtered_plans) == 0

def test_update_meal_plan_db(dynamodb, sample_meal_plan):
    """Test updating a meal plan in the database."""
    # Create meal plan
    created = create_meal_plan(sample_meal_plan)
    meal_plan_id = created["id"]
    
    # Update meal plan
    updated_data = {
        "date": "2023-05-02",
        "recipes": [
            {
                "recipe_id": "test-recipe-4",
                "meal_type": "breakfast"
            }
        ]
    }
    updated = update_meal_plan(meal_plan_id, updated_data)
    
    assert updated["id"] == meal_plan_id
    assert updated["date"] == updated_data["date"]
    assert len(updated["recipes"]) == len(updated_data["recipes"])
    
    # Verify update with date filtering
    filtered_plans = get_meal_plans(start_date="2023-05-02")
    assert len(filtered_plans) == 1
    assert filtered_plans[0]["id"] == meal_plan_id

def test_delete_meal_plan_db(dynamodb, sample_meal_plan):
    """Test deleting a meal plan from the database."""
    # Create meal plan
    created = create_meal_plan(sample_meal_plan)
    meal_plan_id = created["id"]
    
    # Delete meal plan
    result = delete_meal_plan(meal_plan_id)
    assert "message" in result
    
    # Verify deletion
    meal_plans = get_meal_plans()
    assert len(meal_plans) == 0

# Grocery List Tests
def test_create_and_get_grocery_list(dynamodb, sample_grocery_list):
    """Test creating and retrieving a grocery list."""
    # Create grocery list
    created = create_grocery_list(sample_grocery_list)
    
    assert created["name"] == sample_grocery_list["name"]
    assert created["meal_plan_id"] == sample_grocery_list["meal_plan_id"]
    assert len(created["items"]) == len(sample_grocery_list["items"])
    assert "id" in created
    
    # Get all grocery lists
    grocery_lists = get_grocery_lists()
    
    assert len(grocery_lists) == 1
    assert grocery_lists[0]["name"] == sample_grocery_list["name"]
    
    # Get grocery list by ID
    grocery_list_id = created["id"]
    retrieved = get_grocery_list(grocery_list_id)
    
    assert retrieved["id"] == grocery_list_id
    assert retrieved["name"] == sample_grocery_list["name"]
    assert len(retrieved["items"]) == len(sample_grocery_list["items"])

def test_update_grocery_list_db(dynamodb, sample_grocery_list):
    """Test updating a grocery list in the database."""
    # Create grocery list
    created = create_grocery_list(sample_grocery_list)
    grocery_list_id = created["id"]
    
    # Update grocery list
    updated_data = {
        "name": "Updated Grocery List",
        "items": [
            {
                "ingredient_id": "test-ingredient-3",
                "ingredient_name": "Test Ingredient 3",
                "quantity": 3.0,
                "unit": "ounces",
                "checked": True
            }
        ]
    }
    updated = update_grocery_list(grocery_list_id, updated_data)
    
    assert updated["id"] == grocery_list_id
    assert updated["name"] == updated_data["name"]
    assert len(updated["items"]) == len(updated_data["items"])
    
    # Verify update
    retrieved = get_grocery_list(grocery_list_id)
    assert retrieved["name"] == updated_data["name"]
    assert len(retrieved["items"]) == len(updated_data["items"])

def test_delete_grocery_list_db(dynamodb, sample_grocery_list):
    """Test deleting a grocery list from the database."""
    # Create grocery list
    created = create_grocery_list(sample_grocery_list)
    grocery_list_id = created["id"]
    
    # Delete grocery list
    result = delete_grocery_list(grocery_list_id)
    assert "message" in result
    
    # Verify deletion
    grocery_lists = get_grocery_lists()
    assert len(grocery_lists) == 0 