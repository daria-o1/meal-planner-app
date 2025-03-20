#!/usr/bin/env python3
"""
Migration management tool for the Meal Planner application.

This script provides a command-line interface for managing database migrations.
"""

import os
import sys
import argparse
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("migrate")

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import migration functions
from app.db.migrations import (
    get_current_version,
    get_available_migrations,
    run_migrations
)

def create_migration(name):
    """Create a new migration file."""
    # Get the migrations directory
    migrations_dir = os.path.abspath(os.path.join(
        os.path.dirname(__file__), 
        '..', 
        'app', 
        'db', 
        'migrations'
    ))
    
    # Get all available migrations to determine the next version number
    available_migrations = get_available_migrations()
    if available_migrations:
        next_version = available_migrations[-1]['version'] + 1
    else:
        next_version = 1
    
    # Format the version number with leading zeros
    version_str = f"v{next_version:03d}"
    
    # Create a snake_case name from the provided name
    snake_name = name.lower().replace(' ', '_').replace('-', '_')
    
    # Create the filename
    filename = f"{version_str}_{snake_name}.py"
    filepath = os.path.join(migrations_dir, filename)
    
    # Check if the file already exists
    if os.path.exists(filepath):
        logger.error(f"Migration file {filename} already exists")
        return False
    
    # Create the migration file from template
    with open(filepath, 'w') as f:
        f.write(f'''"""
Migration: {name}

Version: {next_version}
Created: {datetime.now().isoformat()}
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)

def up(db: Any) -> None:
    """
    Apply the migration.
    
    Args:
        db: Database adapter instance
    """
    logger.info("Applying migration...")
    
    # TODO: Implement the migration
    
    logger.info("Migration complete")


def down(db: Any) -> None:
    """
    Revert the migration.
    
    Args:
        db: Database adapter instance
    """
    logger.info("Reverting migration...")
    
    # TODO: Implement the rollback
    
    logger.info("Migration rollback complete")
''')
    
    logger.info(f"Created migration file: {filepath}")
    return True

def main():
    """Main entry point for the migration tool."""
    parser = argparse.ArgumentParser(description="Database migration tool")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Create migration command
    create_parser = subparsers.add_parser("create", help="Create a new migration")
    create_parser.add_argument("name", help="Name of the migration")
    
    # Status command
    subparsers.add_parser("status", help="Show migration status")
    
    # Up command
    up_parser = subparsers.add_parser("up", help="Apply migrations")
    up_parser.add_argument("--to", type=int, help="Target version to migrate to")
    
    # Down command
    down_parser = subparsers.add_parser("down", help="Revert migrations")
    down_parser.add_argument("--to", type=int, required=True, help="Target version to revert to")
    
    args = parser.parse_args()
    
    if args.command == "create":
        create_migration(args.name)
    
    elif args.command == "status":
        current_version = get_current_version()
        available_migrations = get_available_migrations()
        
        print(f"Current database version: {current_version}")
        print(f"Available migrations: {len(available_migrations)}")
        
        if available_migrations:
            print("\nMigrations:")
            for migration in available_migrations:
                status = "Applied" if migration['version'] <= current_version else "Pending"
                print(f"  {migration['version']:3d}: {migration['name']} - {status}")
    
    elif args.command == "up":
        target_version = args.to
        run_migrations(target_version)
    
    elif args.command == "down":
        if args.to is None:
            logger.error("You must specify a target version to revert to")
            return
        
        run_migrations(args.to)
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 