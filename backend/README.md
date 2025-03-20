# Meal Planner API

This is the backend API for the Meal Planner application. It provides endpoints for managing recipes, meal plans, and grocery lists.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python main.py
   ```

The API will be available at http://localhost:8000.

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Recipes
- `GET /api/recipes/` - Get all recipes
- `GET /api/recipes/{recipe_id}` - Get a specific recipe
- `POST /api/recipes/` - Create a new recipe
- `PUT /api/recipes/{recipe_id}` - Update a recipe
- `DELETE /api/recipes/{recipe_id}` - Delete a recipe

### Ingredients
- `GET /api/ingredients/` - Get all ingredients
- `GET /api/ingredients/{ingredient_id}` - Get a specific ingredient
- `POST /api/ingredients/` - Create a new ingredient
- `PUT /api/ingredients/{ingredient_id}` - Update an ingredient
- `DELETE /api/ingredients/{ingredient_id}` - Delete an ingredient

### Meal Plans
- `GET /api/meal-plans/` - Get all meal plans
- `GET /api/meal-plans/week/` - Get meal plans for the current week
- `GET /api/meal-plans/{meal_plan_id}` - Get a specific meal plan
- `POST /api/meal-plans/` - Create a new meal plan
- `PUT /api/meal-plans/{meal_plan_id}` - Update a meal plan
- `DELETE /api/meal-plans/{meal_plan_id}` - Delete a meal plan

### Grocery Lists
- `GET /api/grocery-lists/` - Get all grocery lists
- `GET /api/grocery-lists/{grocery_list_id}` - Get a specific grocery list
- `POST /api/grocery-lists/` - Create a new grocery list
- `PUT /api/grocery-lists/{grocery_list_id}` - Update a grocery list
- `PATCH /api/grocery-lists/{grocery_list_id}/items/{ingredient_id}` - Update a grocery list item
- `DELETE /api/grocery-lists/{grocery_list_id}` - Delete a grocery list 