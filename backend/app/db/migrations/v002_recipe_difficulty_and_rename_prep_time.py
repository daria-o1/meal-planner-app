"""
Migration to add 'difficulty' field and rename 'prep_time' to 'preparation_time'.

This migration:
1. Adds a 'difficulty' field to all recipes (easy, medium, hard)
2. Renames 'prep_time' to 'preparation_time' for all recipes
"""

import logging
import random
from typing import Any

logger = logging.getLogger(__name__)

# Difficulty levels to choose from based on prep_time
DIFFICULTY_MAPPING = {
    (0, 15): "easy",
    (16, 30): "medium",
    (31, float('inf')): "hard"
}

def get_difficulty(prep_time: int) -> str:
    """Determine difficulty based on prep_time."""
    for (min_time, max_time), difficulty in DIFFICULTY_MAPPING.items():
        if min_time <= prep_time <= max_time:
            return difficulty
    return "medium"  # Default

def up(db: Any) -> None:
    """
    Apply the migration:
    - Add 'difficulty' field
    - Rename 'prep_time' to 'preparation_time'
    
    Args:
        db: Database adapter instance
    """
    logger.info("Adding 'difficulty' field and renaming 'prep_time' to 'preparation_time'...")
    
    # Query all recipes
    key_condition = {
        "expression": "GSI1PK = :pk",
        "values": {":pk": "RECIPE"}
    }
    recipes = db.query(key_condition, index_name="GSI1")
    
    # Update each recipe
    for recipe in recipes:
        modified = False
        
        # Add difficulty field based on prep_time
        if "difficulty" not in recipe:
            prep_time = recipe.get("prep_time", 0)
            recipe["difficulty"] = get_difficulty(prep_time)
            modified = True
        
        # Rename prep_time to preparation_time
        if "prep_time" in recipe and "preparation_time" not in recipe:
            recipe["preparation_time"] = recipe["prep_time"]
            del recipe["prep_time"]
            modified = True
        
        # Save the updated recipe if modified
        if modified:
            db.put_item(recipe)
            logger.info(f"Updated recipe {recipe.get('id')}")
    
    logger.info(f"Migration complete: Updated {len(recipes)} recipes")


def down(db: Any) -> None:
    """
    Revert the migration:
    - Remove 'difficulty' field
    - Rename 'preparation_time' back to 'prep_time'
    
    Args:
        db: Database adapter instance
    """
    logger.info("Removing 'difficulty' field and renaming 'preparation_time' back to 'prep_time'...")
    
    # Query all recipes
    key_condition = {
        "expression": "GSI1PK = :pk",
        "values": {":pk": "RECIPE"}
    }
    recipes = db.query(key_condition, index_name="GSI1")
    
    # Update each recipe
    for recipe in recipes:
        modified = False
        
        # Remove difficulty field
        if "difficulty" in recipe:
            del recipe["difficulty"]
            modified = True
        
        # Rename preparation_time back to prep_time
        if "preparation_time" in recipe and "prep_time" not in recipe:
            recipe["prep_time"] = recipe["preparation_time"]
            del recipe["preparation_time"]
            modified = True
        
        # Save the updated recipe if modified
        if modified:
            db.put_item(recipe)
            logger.info(f"Reverted recipe {recipe.get('id')}")
    
    logger.info(f"Migration rollback complete: Reverted {len(recipes)} recipes") 