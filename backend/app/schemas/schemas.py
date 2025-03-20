from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime

# Ingredient schemas
class IngredientBase(BaseModel):
    name: str
    category: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientInRecipe(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    quantity: float
    unit: str

class Ingredient(IngredientBase):
    id: str
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

# Recipe schemas
class RecipeIngredient(BaseModel):
    ingredient_id: str
    name: Optional[str] = None  # For display purposes
    quantity: float
    unit: str

class RecipeBase(BaseModel):
    name: str
    description: str
    instructions: str
    prep_time: int
    cook_time: int
    servings: int
    image_url: Optional[str] = None

class RecipeCreate(RecipeBase):
    ingredients: List[RecipeIngredient]

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    prep_time: Optional[int] = None
    cook_time: Optional[int] = None
    servings: Optional[int] = None
    image_url: Optional[str] = None
    ingredients: Optional[List[RecipeIngredient]] = None

class Recipe(RecipeBase):
    id: str
    ingredients: List[RecipeIngredient] = []
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

# Meal Plan schemas
class MealPlanRecipe(BaseModel):
    recipe_id: str
    meal_type: str  # breakfast, lunch, dinner

class MealPlanBase(BaseModel):
    date: str  # ISO format date string

class MealPlanCreate(MealPlanBase):
    recipes: List[MealPlanRecipe]

class MealPlanUpdate(BaseModel):
    date: Optional[str] = None
    recipes: Optional[List[MealPlanRecipe]] = None

class MealPlanRecipeDetail(BaseModel):
    recipe_id: str
    recipe_name: Optional[str] = None
    meal_type: str

class MealPlan(MealPlanBase):
    id: str
    recipes: List[MealPlanRecipeDetail] = []
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

# Grocery List schemas
class GroceryItemBase(BaseModel):
    ingredient_id: str
    ingredient_name: Optional[str] = None
    quantity: float
    unit: str
    checked: bool = False

class GroceryListBase(BaseModel):
    name: str
    meal_plan_id: Optional[str] = None

class GroceryListCreate(GroceryListBase):
    items: List[GroceryItemBase]

class GroceryListUpdate(BaseModel):
    name: Optional[str] = None
    meal_plan_id: Optional[str] = None
    items: Optional[List[GroceryItemBase]] = None

class GroceryItem(BaseModel):
    ingredient_id: str
    ingredient_name: str
    quantity: float
    unit: str
    checked: bool

class GroceryList(GroceryListBase):
    id: str
    items: List[GroceryItem] = []
    created_at: Optional[str] = None

    class Config:
        from_attributes = True 