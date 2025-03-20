"""
Database migration system for the Meal Planner application.

This package provides tools for managing database schema migrations
across both DynamoDB and SQLite backends.
"""

import os
import importlib
import pkgutil
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.db.db_adapter import db

# Set up logging
logger = logging.getLogger(__name__)

# Migration metadata table/item details
MIGRATION_PK = "SYSTEM#MIGRATION"
MIGRATION_SK = "METADATA"
MIGRATION_VERSION_KEY = "current_version"


def get_current_version() -> int:
    """Get the current migration version from the database."""
    try:
        # Try to get the migration metadata
        migration_data = db.get_item(MIGRATION_PK, MIGRATION_SK)
        
        if migration_data:
            return int(migration_data.get(MIGRATION_VERSION_KEY, 0))
        else:
            # If no migration metadata exists, initialize it
            db.put_item({
                "PK": MIGRATION_PK,
                "SK": MIGRATION_SK,
                MIGRATION_VERSION_KEY: 0,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            })
            return 0
    except Exception as e:
        logger.error(f"Error getting migration version: {e}")
        return 0


def set_current_version(version: int) -> None:
    """Update the current migration version in the database."""
    try:
        # Get existing migration data
        migration_data = db.get_item(MIGRATION_PK, MIGRATION_SK) or {
            "PK": MIGRATION_PK,
            "SK": MIGRATION_SK,
            "created_at": datetime.now().isoformat()
        }
        
        # Update version and timestamp
        migration_data[MIGRATION_VERSION_KEY] = version
        migration_data["updated_at"] = datetime.now().isoformat()
        
        # Save to database
        db.put_item(migration_data)
        logger.info(f"Migration version updated to {version}")
    except Exception as e:
        logger.error(f"Error setting migration version: {e}")
        raise


def get_available_migrations() -> List[Dict[str, Any]]:
    """
    Get all available migrations from the migrations directory.
    
    Returns:
        List of migration dictionaries with 'version', 'name', and 'module' keys,
        sorted by version.
    """
    migrations = []
    
    # Get the package path
    package_path = os.path.dirname(__file__)
    
    # Iterate through all modules in the migrations package
    for _, name, is_pkg in pkgutil.iter_modules([package_path]):
        if is_pkg or not name.startswith('v'):
            continue
        
        try:
            # Extract version number from module name (v001_xxx -> 1)
            version_str = name.split('_')[0][1:]
            version = int(version_str)
            
            # Import the migration module
            module = importlib.import_module(f"app.db.migrations.{name}")
            
            migrations.append({
                'version': version,
                'name': name,
                'module': module
            })
        except (ValueError, ImportError) as e:
            logger.error(f"Error loading migration {name}: {e}")
    
    # Sort migrations by version
    return sorted(migrations, key=lambda m: m['version'])


def run_migrations(target_version: Optional[int] = None) -> None:
    """
    Run all pending migrations up to the target version.
    
    Args:
        target_version: Optional target version to migrate to.
            If None, migrate to the latest version.
    """
    current_version = get_current_version()
    available_migrations = get_available_migrations()
    
    if not available_migrations:
        logger.info("No migrations available.")
        return
    
    # If no target version specified, use the latest available
    if target_version is None:
        target_version = available_migrations[-1]['version']
    
    logger.info(f"Current version: {current_version}, Target version: {target_version}")
    
    # Determine if we're migrating up or down
    if target_version > current_version:
        # Migrate up
        for migration in available_migrations:
            if current_version < migration['version'] <= target_version:
                logger.info(f"Running migration {migration['name']}...")
                try:
                    # Run the up migration
                    migration['module'].up(db)
                    # Update the current version
                    set_current_version(migration['version'])
                    logger.info(f"Migration {migration['name']} completed successfully.")
                except Exception as e:
                    logger.error(f"Migration {migration['name']} failed: {e}")
                    raise
    elif target_version < current_version:
        # Migrate down (in reverse order)
        for migration in reversed(available_migrations):
            if target_version < migration['version'] <= current_version:
                logger.info(f"Rolling back migration {migration['name']}...")
                try:
                    # Run the down migration
                    migration['module'].down(db)
                    # Update the current version to the previous version
                    prev_version = migration['version'] - 1
                    set_current_version(prev_version)
                    logger.info(f"Rollback of {migration['name']} completed successfully.")
                except Exception as e:
                    logger.error(f"Rollback of {migration['name']} failed: {e}")
                    raise
    else:
        logger.info("Database is already at the target version.") 