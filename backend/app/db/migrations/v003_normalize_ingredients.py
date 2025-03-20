"""
Migration to normalize ingredients.

This migration:
1. Extracts unique ingredients from recipes
2. Creates ingredient items in the database
3. Updates recipes to reference ingredients by ID instead of embedding them
"""

import logging
import json
from typing import Any, Dict, List
from datetime import datetime

logger = logging.getLogger(__name__)

def up(db: Any) -> None:
    """
    Apply the migration to normalize ingredients.
    
    Args:
        db: Database adapter instance
    """
    logger.info("Normalizing ingredients...")
    
    # Query all recipes
    key_condition = {
        "expression": "GSI1PK = :pk",
        "values": {":pk": "RECIPE"}
    }
    recipes = db.query(key_condition, index_name="GSI1")
    
    # Extract and deduplicate ingredients
    unique_ingredients = {}  # Dict to track unique ingredients by name
    ingredient_mapping = {}  # Map from original ingredient_id to new ingredient_id
    
    # First pass: collect all unique ingredients
    for recipe in recipes:
        if "ingredients" not in recipe:
            continue
            
        for ingredient in recipe.get("ingredients", []):
            name = ingredient.get("name", "").strip().lower()
            if not name:
                continue
                
            # Skip if we've already processed this ingredient
            if name in unique_ingredients:
                # Map the original ingredient_id to the new one
                ingredient_mapping[ingredient.get("ingredient_id")] = unique_ingredients[name]["id"]
                continue
                
            # Generate a new ID if needed
            ingredient_id = ingredient.get("ingredient_id")
            if not ingredient_id:
                ingredient_id = db.generate_id()
            
            # Create a normalized ingredient
            unique_ingredients[name] = {
                "id": ingredient_id,
                "name": ingredient.get("name"),
                "category": ingredient.get("category", "Other")
            }
            
            # Map the original ingredient_id to itself
            ingredient_mapping[ingredient_id] = ingredient_id
    
    # Second pass: store all unique ingredients in the database
    timestamp = datetime.now().isoformat()
    for name, ingredient_data in unique_ingredients.items():
        ingredient_id = ingredient_data["id"]
        
        # Create the ingredient item
        ingredient_item = {
            "PK": f"INGREDIENT#{ingredient_id}",
            "SK": f"INGREDIENT#{ingredient_id}",
            "GSI1PK": "INGREDIENT",
            "GSI1SK": ingredient_data["name"],
            "id": ingredient_id,
            "name": ingredient_data["name"],
            "category": ingredient_data["category"],
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        # Save to database
        db.put_item(ingredient_item)
        logger.info(f"Created ingredient: {ingredient_data['name']} (ID: {ingredient_id})")
    
    # Third pass: update recipes to reference ingredients by ID
    for recipe in recipes:
        if "ingredients" not in recipe:
            continue
            
        # Transform ingredients to references
        ingredient_refs = []
        for ingredient in recipe.get("ingredients", []):
            original_id = ingredient.get("ingredient_id")
            if not original_id or original_id not in ingredient_mapping:
                continue
                
            # Create a reference with quantity and unit
            ingredient_refs.append({
                "ingredient_id": ingredient_mapping[original_id],
                "quantity": ingredient.get("quantity", 1),
                "unit": ingredient.get("unit", "")
            })
        
        # Store the original ingredients for rollback
        recipe["_original_ingredients"] = json.dumps(recipe.get("ingredients", []))
        
        # Update the recipe with the new ingredient references
        recipe["ingredients"] = ingredient_refs
        recipe["updated_at"] = timestamp
        
        # Save the updated recipe
        db.put_item(recipe)
        logger.info(f"Updated recipe {recipe.get('id')} with normalized ingredients")
    
    logger.info(f"Migration complete: Created {len(unique_ingredients)} unique ingredients and updated {len(recipes)} recipes")


def down(db: Any) -> None:
    """
    Revert the migration - restore embedded ingredients and remove ingredient items.
    
    Args:
        db: Database adapter instance
    """
    logger.info("Reverting ingredient normalization...")
    
    # Query all recipes
    key_condition = {
        "expression": "GSI1PK = :pk",
        "values": {":pk": "RECIPE"}
    }
    recipes = db.query(key_condition, index_name="GSI1")
    
    # First pass: restore original ingredients in recipes
    for recipe in recipes:
        if "_original_ingredients" not in recipe:
            continue
            
        try:
            # Restore the original ingredients
            original_ingredients = json.loads(recipe["_original_ingredients"])
            recipe["ingredients"] = original_ingredients
            
            # Remove the backup field
            del recipe["_original_ingredients"]
            
            # Update timestamp
            recipe["updated_at"] = datetime.now().isoformat()
            
            # Save the updated recipe
            db.put_item(recipe)
            logger.info(f"Restored original ingredients for recipe {recipe.get('id')}")
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Error restoring ingredients for recipe {recipe.get('id')}: {e}")
    
    # Second pass: query and delete all ingredient items
    key_condition = {
        "expression": "GSI1PK = :pk",
        "values": {":pk": "INGREDIENT"}
    }
    ingredients = db.query(key_condition, index_name="GSI1")
    
    # Delete each ingredient
    for ingredient in ingredients:
        ingredient_id = ingredient.get("id")
        if not ingredient_id:
            continue
            
        # Delete the ingredient
        db.delete_item(f"INGREDIENT#{ingredient_id}", f"INGREDIENT#{ingredient_id}")
        logger.info(f"Deleted ingredient {ingredient_id}")
    
    logger.info(f"Migration rollback complete: Restored original ingredients in {len(recipes)} recipes and deleted {len(ingredients)} ingredients") 