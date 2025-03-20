import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
import uuid
from datetime import datetime

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Get table name from environment variable or use default
TABLE_NAME = os.environ.get('DYNAMODB_TABLE', 'meal-planner-prod')

# Get the table
table = dynamodb.Table(TABLE_NAME)

# Helper functions for DynamoDB operations

def generate_id():
    """Generate a unique ID for items"""
    return str(uuid.uuid4())

def format_date(date_obj):
    """Format date object to string for DynamoDB"""
    if isinstance(date_obj, datetime):
        return date_obj.strftime('%Y-%m-%d')
    return date_obj

# Recipe operations
def get_recipes():
    """Get all recipes"""
    response = table.query(
        KeyConditionExpression=Key('PK').eq('RECIPE')
    )
    return response.get('Items', [])

def get_recipe(recipe_id):
    """Get a specific recipe"""
    response = table.get_item(
        Key={
            'PK': 'RECIPE',
            'SK': recipe_id
        }
    )
    return response.get('Item')

def create_recipe(recipe_data):
    """Create a new recipe"""
    recipe_id = generate_id()
    item = {
        'PK': 'RECIPE',
        'SK': recipe_id,
        'GSI1PK': 'RECIPE',
        'GSI1SK': recipe_data.get('name', ''),
        'id': recipe_id,
        'name': recipe_data.get('name', ''),
        'description': recipe_data.get('description', ''),
        'instructions': recipe_data.get('instructions', ''),
        'prep_time': recipe_data.get('prep_time', 0),
        'cook_time': recipe_data.get('cook_time', 0),
        'servings': recipe_data.get('servings', 0),
        'image_url': recipe_data.get('image_url', ''),
        'created_at': datetime.now().isoformat(),
        'ingredients': recipe_data.get('ingredients', [])
    }
    table.put_item(Item=item)
    return item

def update_recipe(recipe_id, recipe_data):
    """Update an existing recipe"""
    update_expression = "SET "
    expression_attribute_values = {}
    
    for key, value in recipe_data.items():
        if key not in ['PK', 'SK', 'id']:
            update_expression += f"#{key} = :{key}, "
            expression_attribute_values[f":{key}"] = value
    
    # Remove trailing comma and space
    update_expression = update_expression[:-2]
    
    # Create expression attribute names
    expression_attribute_names = {f"#{key}": key for key in recipe_data if key not in ['PK', 'SK', 'id']}
    
    # Update GSI1SK if name is being updated
    if 'name' in recipe_data:
        update_expression += ", #GSI1SK = :GSI1SK"
        expression_attribute_values[":GSI1SK"] = recipe_data['name']
        expression_attribute_names["#GSI1SK"] = "GSI1SK"
    
    response = table.update_item(
        Key={
            'PK': 'RECIPE',
            'SK': recipe_id
        },
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_attribute_values,
        ExpressionAttributeNames=expression_attribute_names,
        ReturnValues="ALL_NEW"
    )
    return response.get('Attributes')

def delete_recipe(recipe_id):
    """Delete a recipe"""
    table.delete_item(
        Key={
            'PK': 'RECIPE',
            'SK': recipe_id
        }
    )
    return {"message": "Recipe deleted"}

# Ingredient operations
def get_ingredients():
    """Get all ingredients"""
    response = table.query(
        KeyConditionExpression=Key('PK').eq('INGREDIENT')
    )
    return response.get('Items', [])

def create_ingredient(ingredient_data):
    """Create a new ingredient"""
    ingredient_id = generate_id()
    item = {
        'PK': 'INGREDIENT',
        'SK': ingredient_id,
        'GSI1PK': 'INGREDIENT',
        'GSI1SK': ingredient_data.get('name', ''),
        'id': ingredient_id,
        'name': ingredient_data.get('name', ''),
        'category': ingredient_data.get('category', ''),
        'created_at': datetime.now().isoformat()
    }
    table.put_item(Item=item)
    return item

# Meal Plan operations
def get_meal_plans(start_date=None, end_date=None):
    """Get meal plans with optional date filtering"""
    response = table.query(
        KeyConditionExpression=Key('PK').eq('MEAL_PLAN')
    )
    meal_plans = response.get('Items', [])
    
    # Filter by date if provided
    if start_date or end_date:
        filtered_plans = []
        for plan in meal_plans:
            plan_date = plan.get('date', '')
            if start_date and end_date:
                if start_date <= plan_date <= end_date:
                    filtered_plans.append(plan)
            elif start_date and plan_date >= start_date:
                filtered_plans.append(plan)
            elif end_date and plan_date <= end_date:
                filtered_plans.append(plan)
        return filtered_plans
    
    return meal_plans

def create_meal_plan(meal_plan_data):
    """Create a new meal plan"""
    meal_plan_id = generate_id()
    date = format_date(meal_plan_data.get('date'))
    
    item = {
        'PK': 'MEAL_PLAN',
        'SK': meal_plan_id,
        'GSI1PK': 'MEAL_PLAN',
        'GSI1SK': date,
        'id': meal_plan_id,
        'date': date,
        'recipes': meal_plan_data.get('recipes', []),
        'created_at': datetime.now().isoformat()
    }
    table.put_item(Item=item)
    return item

def update_meal_plan(meal_plan_id, meal_plan_data):
    """Update an existing meal plan"""
    update_expression = "SET "
    expression_attribute_values = {}
    
    for key, value in meal_plan_data.items():
        if key not in ['PK', 'SK', 'id']:
            if key == 'date':
                value = format_date(value)
                update_expression += f"#GSI1SK = :{key}, "
                expression_attribute_values[f":{key}"] = value
                update_expression += f"#{key} = :{key}, "
            else:
                update_expression += f"#{key} = :{key}, "
                expression_attribute_values[f":{key}"] = value
    
    # Remove trailing comma and space
    update_expression = update_expression[:-2]
    
    # Create expression attribute names
    expression_attribute_names = {f"#{key}": key for key in meal_plan_data if key not in ['PK', 'SK', 'id']}
    if 'date' in meal_plan_data:
        expression_attribute_names["#GSI1SK"] = "GSI1SK"
    
    response = table.update_item(
        Key={
            'PK': 'MEAL_PLAN',
            'SK': meal_plan_id
        },
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_attribute_values,
        ExpressionAttributeNames=expression_attribute_names,
        ReturnValues="ALL_NEW"
    )
    return response.get('Attributes')

def delete_meal_plan(meal_plan_id):
    """Delete a meal plan"""
    table.delete_item(
        Key={
            'PK': 'MEAL_PLAN',
            'SK': meal_plan_id
        }
    )
    return {"message": "Meal plan deleted"}

# Grocery List operations
def get_grocery_lists():
    """Get all grocery lists"""
    response = table.query(
        KeyConditionExpression=Key('PK').eq('GROCERY_LIST')
    )
    return response.get('Items', [])

def get_grocery_list(grocery_list_id):
    """Get a specific grocery list"""
    response = table.get_item(
        Key={
            'PK': 'GROCERY_LIST',
            'SK': grocery_list_id
        }
    )
    return response.get('Item')

def create_grocery_list(grocery_list_data):
    """Create a new grocery list"""
    grocery_list_id = generate_id()
    item = {
        'PK': 'GROCERY_LIST',
        'SK': grocery_list_id,
        'GSI1PK': 'GROCERY_LIST',
        'GSI1SK': grocery_list_data.get('name', ''),
        'id': grocery_list_id,
        'name': grocery_list_data.get('name', ''),
        'meal_plan_id': grocery_list_data.get('meal_plan_id', ''),
        'items': grocery_list_data.get('items', []),
        'created_at': datetime.now().isoformat()
    }
    table.put_item(Item=item)
    return item

def update_grocery_list(grocery_list_id, grocery_list_data):
    """Update an existing grocery list"""
    update_expression = "SET "
    expression_attribute_values = {}
    
    for key, value in grocery_list_data.items():
        if key not in ['PK', 'SK', 'id']:
            update_expression += f"#{key} = :{key}, "
            expression_attribute_values[f":{key}"] = value
    
    # Remove trailing comma and space
    update_expression = update_expression[:-2]
    
    # Create expression attribute names
    expression_attribute_names = {f"#{key}": key for key in grocery_list_data if key not in ['PK', 'SK', 'id']}
    
    # Update GSI1SK if name is being updated
    if 'name' in grocery_list_data:
        update_expression += ", #GSI1SK = :GSI1SK"
        expression_attribute_values[":GSI1SK"] = grocery_list_data['name']
        expression_attribute_names["#GSI1SK"] = "GSI1SK"
    
    response = table.update_item(
        Key={
            'PK': 'GROCERY_LIST',
            'SK': grocery_list_id
        },
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_attribute_values,
        ExpressionAttributeNames=expression_attribute_names,
        ReturnValues="ALL_NEW"
    )
    return response.get('Attributes')

def delete_grocery_list(grocery_list_id):
    """Delete a grocery list"""
    table.delete_item(
        Key={
            'PK': 'GROCERY_LIST',
            'SK': grocery_list_id
        }
    )
    return {"message": "Grocery list deleted"} 