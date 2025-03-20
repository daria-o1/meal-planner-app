from sqlalchemy import Column, Integer, String, ForeignKey, Table, Text, Date, Float
from sqlalchemy.orm import relationship
from app.db.database import Base

# Association table for recipe ingredients
recipe_ingredient = Table(
    "recipe_ingredient",
    Base.metadata,
    Column("recipe_id", Integer, ForeignKey("recipes.id"), primary_key=True),
    Column("ingredient_id", Integer, ForeignKey("ingredients.id"), primary_key=True),
    Column("quantity", Float),
    Column("unit", String(50)),
)

# Association table for meal plan recipes
meal_plan_recipe = Table(
    "meal_plan_recipe",
    Base.metadata,
    Column("meal_plan_id", Integer, ForeignKey("meal_plans.id"), primary_key=True),
    Column("recipe_id", Integer, ForeignKey("recipes.id"), primary_key=True),
    Column("meal_type", String(20)),  # breakfast, lunch, dinner
)

# Association table for grocery list items
grocery_list_item = Table(
    "grocery_list_item",
    Base.metadata,
    Column("grocery_list_id", Integer, ForeignKey("grocery_lists.id"), primary_key=True),
    Column("ingredient_id", Integer, ForeignKey("ingredients.id"), primary_key=True),
    Column("quantity", Float),
    Column("unit", String(50)),
    Column("checked", Integer, default=0),  # 0 for unchecked, 1 for checked
)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    description = Column(Text)
    instructions = Column(Text)
    prep_time = Column(Integer)  # in minutes
    cook_time = Column(Integer)  # in minutes
    servings = Column(Integer)
    image_url = Column(String(255), nullable=True)
    
    # Relationships
    ingredients = relationship("Ingredient", secondary=recipe_ingredient, back_populates="recipes")
    meal_plans = relationship("MealPlan", secondary=meal_plan_recipe, back_populates="recipes")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, unique=True)
    category = Column(String(50), nullable=True)  # e.g., dairy, produce, meat
    
    # Relationships
    recipes = relationship("Recipe", secondary=recipe_ingredient, back_populates="ingredients")
    grocery_lists = relationship("GroceryList", secondary=grocery_list_item, back_populates="ingredients")

class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    
    # Relationships
    recipes = relationship("Recipe", secondary=meal_plan_recipe, back_populates="meal_plans")
    grocery_list = relationship("GroceryList", back_populates="meal_plan", uselist=False)

class GroceryList(Base):
    __tablename__ = "grocery_lists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id"), nullable=True)
    
    # Relationships
    meal_plan = relationship("MealPlan", back_populates="grocery_list")
    ingredients = relationship("Ingredient", secondary=grocery_list_item, back_populates="grocery_lists") 