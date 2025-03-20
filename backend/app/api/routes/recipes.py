from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.db.dynamodb import get_recipes, get_recipe, create_recipe, update_recipe, delete_recipe
from app.schemas.schemas import Recipe, RecipeCreate, RecipeUpdate

router = APIRouter()

@router.post("/recipes/", response_model=Recipe, status_code=status.HTTP_201_CREATED)
def create_recipe_endpoint(recipe: RecipeCreate):
    """Create a new recipe"""
    try:
        # Convert Pydantic model to dict
        recipe_data = recipe.dict()
        
        # Create recipe in DynamoDB
        created_recipe = create_recipe(recipe_data)
        return created_recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create recipe: {str(e)}")

@router.get("/recipes/", response_model=List[Recipe])
def read_recipes_endpoint(skip: int = 0, limit: int = 100):
    """Get all recipes with optional pagination"""
    try:
        recipes = get_recipes()
        
        # Apply pagination
        start = skip
        end = skip + limit if skip + limit < len(recipes) else len(recipes)
        return recipes[start:end]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recipes: {str(e)}")

@router.get("/recipes/{recipe_id}", response_model=Recipe)
def read_recipe_endpoint(recipe_id: str):
    """Get a specific recipe by ID"""
    recipe = get_recipe(recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.put("/recipes/{recipe_id}", response_model=Recipe)
def update_recipe_endpoint(recipe_id: str, recipe: RecipeUpdate):
    """Update an existing recipe"""
    # Check if recipe exists
    existing_recipe = get_recipe(recipe_id)
    if existing_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    try:
        # Convert Pydantic model to dict
        recipe_data = recipe.dict(exclude_unset=True)
        
        # Update recipe in DynamoDB
        updated_recipe = update_recipe(recipe_id, recipe_data)
        return updated_recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update recipe: {str(e)}")

@router.delete("/recipes/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe_endpoint(recipe_id: str):
    """Delete a recipe"""
    # Check if recipe exists
    existing_recipe = get_recipe(recipe_id)
    if existing_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    try:
        # Delete recipe from DynamoDB
        delete_recipe(recipe_id)
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete recipe: {str(e)}") 