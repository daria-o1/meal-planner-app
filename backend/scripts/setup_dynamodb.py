#!/usr/bin/env python3
"""
Script to set up DynamoDB table for local development.
"""
import os
import boto3
import time

# Get table name from environment variable
TABLE_NAME = os.environ.get("DYNAMODB_TABLE", "meal-planner-local")

def create_table():
    """Create DynamoDB table if it doesn't exist."""
    # Connect to local DynamoDB
    dynamodb = boto3.resource(
        "dynamodb",
        endpoint_url="http://localhost:8000",
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test"
    )
    
    # Check if table already exists
    existing_tables = dynamodb.meta.client.list_tables()["TableNames"]
    if TABLE_NAME in existing_tables:
        print(f"Table {TABLE_NAME} already exists")
        return
    
    # Create the table
    print(f"Creating table {TABLE_NAME}...")
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
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 5,
                    "WriteCapacityUnits": 5
                }
            }
        ],
        ProvisionedThroughput={
            "ReadCapacityUnits": 5,
            "WriteCapacityUnits": 5
        }
    )
    
    # Wait for table to be created
    print("Waiting for table to be created...")
    table.meta.client.get_waiter("table_exists").wait(TableName=TABLE_NAME)
    print(f"Table {TABLE_NAME} created successfully")

def create_sample_data():
    """Create sample data for development."""
    # Connect to local DynamoDB
    dynamodb = boto3.resource(
        "dynamodb",
        endpoint_url="http://localhost:8000",
        region_name="us-east-1",
        aws_access_key_id="test",
        aws_secret_access_key="test"
    )
    
    # Get the table
    table = dynamodb.Table(TABLE_NAME)
    
    # Check if sample data already exists
    response = table.query(
        KeyConditionExpression="PK = :pk",
        ExpressionAttributeValues={":pk": "RECIPE#sample1"}
    )
    
    if response["Items"]:
        print("Sample data already exists")
        return
    
    # Create sample recipe
    print("Creating sample data...")
    table.put_item(
        Item={
            "PK": "RECIPE#sample1",
            "SK": "RECIPE#sample1",
            "GSI1PK": "RECIPE",
            "GSI1SK": "Sample Recipe",
            "id": "sample1",
            "name": "Sample Recipe",
            "description": "A sample recipe for development",
            "instructions": "Mix and bake at 350F for 30 minutes",
            "prep_time": 15,
            "cook_time": 30,
            "servings": 4,
            "image_url": "https://example.com/sample-recipe.jpg",
            "ingredients": [
                {
                    "ingredient_id": "sample-ingredient-1",
                    "name": "Sample Ingredient 1",
                    "quantity": 2.0,
                    "unit": "cups"
                },
                {
                    "ingredient_id": "sample-ingredient-2",
                    "name": "Sample Ingredient 2",
                    "quantity": 1.0,
                    "unit": "tablespoon"
                }
            ],
            "created_at": "2023-01-01T00:00:00",
            "updated_at": "2023-01-01T00:00:00"
        }
    )
    
    # Create sample meal plan
    table.put_item(
        Item={
            "PK": "MEALPLAN#sample1",
            "SK": "MEALPLAN#sample1",
            "GSI1PK": "MEALPLAN",
            "GSI1SK": "2023-01-01",
            "id": "sample1",
            "date": "2023-01-01",
            "recipes": [
                {
                    "recipe_id": "sample1",
                    "meal_type": "breakfast"
                }
            ],
            "created_at": "2023-01-01T00:00:00",
            "updated_at": "2023-01-01T00:00:00"
        }
    )
    
    print("Sample data created successfully")

if __name__ == "__main__":
    create_table()
    create_sample_data() 