import os
import pytest
import boto3
import sqlite3
from moto import mock_dynamodb
from fastapi.testclient import TestClient
from app.db.dynamodb import table, TABLE_NAME
from main import app

@pytest.fixture(scope="function")
def aws_credentials():
    """Mocked AWS Credentials for moto."""
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_SECURITY_TOKEN"] = "testing"
    os.environ["AWS_SESSION_TOKEN"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    os.environ["DYNAMODB_TABLE"] = "meal-planner-test"

@pytest.fixture(scope="function")
def dynamodb(aws_credentials):
    """DynamoDB mock fixture."""
    with mock_dynamodb():
        # Create the DynamoDB table
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        
        # Create the DynamoDB table
        table = dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[
                {"AttributeName": "PK", "KeyType": "HASH"},
                {"AttributeName": "SK", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "PK", "AttributeType": "S"},
                {"AttributeName": "SK", "AttributeType": "S"},
                {"AttributeName": "GSI1PK", "AttributeType": "S"},
                {"AttributeName": "GSI1SK", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "GSI1",
                    "KeySchema": [
                        {"AttributeName": "GSI1PK", "KeyType": "HASH"},
                        {"AttributeName": "GSI1SK", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        
        # Wait until the table exists
        table.meta.client.get_waiter("table_exists").wait(TableName=TABLE_NAME)
        
        yield dynamodb

@pytest.fixture(scope="function")
def sqlite_db():
    """SQLite database fixture for testing as an alternative to DynamoDB."""
    # Use in-memory SQLite database
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()
    
    # Create tables that mimic DynamoDB structure
    cursor.execute('''
    CREATE TABLE items (
        PK TEXT NOT NULL,
        SK TEXT NOT NULL,
        GSI1PK TEXT,
        GSI1SK TEXT,
        data TEXT,
        PRIMARY KEY (PK, SK)
    )
    ''')
    
    # Create index to mimic GSI1
    cursor.execute('''
    CREATE INDEX GSI1 ON items (GSI1PK, GSI1SK)
    ''')
    
    # Set environment variable to use SQLite instead of DynamoDB
    os.environ["DB_BACKEND"] = "sqlite"
    os.environ["SQLITE_DB_PATH"] = ":memory:"
    
    yield conn
    
    # Clean up
    conn.close()
    os.environ.pop("DB_BACKEND", None)
    os.environ.pop("SQLITE_DB_PATH", None)

@pytest.fixture(scope="function")
def client(dynamodb):
    """Test client for FastAPI app using mocked DynamoDB."""
    with TestClient(app) as client:
        yield client

@pytest.fixture(scope="function")
def sqlite_client(sqlite_db):
    """Test client for FastAPI app using SQLite."""
    with TestClient(app) as client:
        yield client

@pytest.fixture(scope="function")
def sample_recipe():
    """Sample recipe data for tests."""
    return {
        "name": "Test Recipe",
        "description": "A test recipe for unit tests",
        "instructions": "Mix and bake at 350F for 30 minutes",
        "prep_time": 15,
        "cook_time": 30,
        "servings": 4,
        "image_url": "https://example.com/test-recipe.jpg",
        "ingredients": [
            {
                "ingredient_id": "test-ingredient-1",
                "name": "Test Ingredient 1",
                "quantity": 2.0,
                "unit": "cups"
            },
            {
                "ingredient_id": "test-ingredient-2",
                "name": "Test Ingredient 2",
                "quantity": 1.0,
                "unit": "tablespoon"
            }
        ]
    }

@pytest.fixture(scope="function")
def sample_ingredient():
    """Sample ingredient data for tests."""
    return {
        "name": "Test Ingredient",
        "category": "Test Category"
    }

@pytest.fixture(scope="function")
def sample_meal_plan():
    """Sample meal plan data for tests."""
    return {
        "date": "2023-05-01",
        "recipes": [
            {
                "recipe_id": "test-recipe-1",
                "meal_type": "breakfast"
            },
            {
                "recipe_id": "test-recipe-2",
                "meal_type": "lunch"
            },
            {
                "recipe_id": "test-recipe-3",
                "meal_type": "dinner"
            }
        ]
    }

@pytest.fixture(scope="function")
def sample_grocery_list():
    """Sample grocery list data for tests."""
    return {
        "name": "Test Grocery List",
        "meal_plan_id": "test-meal-plan-1",
        "items": [
            {
                "ingredient_id": "test-ingredient-1",
                "ingredient_name": "Test Ingredient 1",
                "quantity": 2.0,
                "unit": "cups",
                "checked": False
            },
            {
                "ingredient_id": "test-ingredient-2",
                "ingredient_name": "Test Ingredient 2",
                "quantity": 1.0,
                "unit": "tablespoon",
                "checked": False
            }
        ]
    } 