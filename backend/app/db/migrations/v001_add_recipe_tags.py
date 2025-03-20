"""
Migration to add 'tags' field to recipes.

This migration adds a 'tags' array field to all existing recipes.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)

def up(db: Any) -> None:
    """
    Apply the migration - add 'tags' field to all recipes.
    
    Args:
        db: Database adapter instance
    """
    logger.info("Adding 'tags' field to all recipes...")
    
    # Query all recipes
    key_condition = {
        "expression": "GSI1PK = :pk",
        "values": {":pk": "RECIPE"}
    }
    recipes = db.query(key_condition, index_name="GSI1")
    
    # Update each recipe to add the tags field
    for recipe in recipes:
        # Skip if tags already exist
        if "tags" in recipe:
            continue
            
        # Add empty tags array
        recipe["tags"] = []
        
        # Save the updated recipe
        db.put_item(recipe)
        
        logger.info(f"Added tags field to recipe {recipe.get('id')}")
    
    logger.info(f"Migration complete: Added tags field to {len(recipes)} recipes")


def down(db: Any) -> None:
    """
    Revert the migration - remove 'tags' field from all recipes.
    
    Args:
        db: Database adapter instance
    """
    logger.info("Removing 'tags' field from all recipes...")
    
    # Query all recipes
    key_condition = {
        "expression": "GSI1PK = :pk",
        "values": {":pk": "RECIPE"}
    }
    recipes = db.query(key_condition, index_name="GSI1")
    
    # Update each recipe to remove the tags field
    for recipe in recipes:
        # Skip if tags don't exist
        if "tags" not in recipe:
            continue
            
        # Remove tags field
        del recipe["tags"]
        
        # Save the updated recipe
        db.put_item(recipe)
        
        logger.info(f"Removed tags field from recipe {recipe.get('id')}")
    
    logger.info(f"Migration rollback complete: Removed tags field from {len(recipes)} recipes") 