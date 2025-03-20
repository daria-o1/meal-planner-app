from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
from app.db.database import get_db
from app.models.models import MealPlan as MealPlanModel, Recipe as RecipeModel, meal_plan_recipe
from app.schemas.schemas import MealPlan, MealPlanCreate

router = APIRouter()

@router.post("/meal-plans/", response_model=MealPlan, status_code=status.HTTP_201_CREATED)
def create_meal_plan(meal_plan: MealPlanCreate, db: Session = Depends(get_db)):
    # Check if meal plan for this date already exists
    existing_plan = db.query(MealPlanModel).filter(MealPlanModel.date == meal_plan.date).first()
    if existing_plan:
        raise HTTPException(status_code=400, detail=f"Meal plan for date {meal_plan.date} already exists")
    
    # Create meal plan
    db_meal_plan = MealPlanModel(date=meal_plan.date)
    db.add(db_meal_plan)
    db.commit()
    db.refresh(db_meal_plan)
    
    # Add recipes to meal plan
    for recipe_data in meal_plan.recipes:
        # Check if recipe exists
        db_recipe = db.query(RecipeModel).filter(RecipeModel.id == recipe_data.recipe_id).first()
        if not db_recipe:
            raise HTTPException(status_code=404, detail=f"Recipe with id {recipe_data.recipe_id} not found")
        
        # Add to association table with meal type
        stmt = meal_plan_recipe.insert().values(
            meal_plan_id=db_meal_plan.id,
            recipe_id=db_recipe.id,
            meal_type=recipe_data.meal_type
        )
        db.execute(stmt)
    
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan

@router.get("/meal-plans/", response_model=List[MealPlan])
def read_meal_plans(start_date: date = None, end_date: date = None, db: Session = Depends(get_db)):
    query = db.query(MealPlanModel)
    
    # Filter by date range if provided
    if start_date and end_date:
        query = query.filter(MealPlanModel.date >= start_date, MealPlanModel.date <= end_date)
    elif start_date:
        query = query.filter(MealPlanModel.date >= start_date)
    elif end_date:
        query = query.filter(MealPlanModel.date <= end_date)
    
    # Order by date
    query = query.order_by(MealPlanModel.date)
    
    meal_plans = query.all()
    return meal_plans

@router.get("/meal-plans/week/", response_model=List[MealPlan])
def read_weekly_meal_plan(start_date: date = None, db: Session = Depends(get_db)):
    # If no start date provided, use today
    if not start_date:
        start_date = date.today()
    
    # Calculate end date (7 days from start)
    end_date = start_date + timedelta(days=6)
    
    # Get meal plans for the week
    meal_plans = db.query(MealPlanModel).filter(
        MealPlanModel.date >= start_date,
        MealPlanModel.date <= end_date
    ).order_by(MealPlanModel.date).all()
    
    return meal_plans

@router.get("/meal-plans/{meal_plan_id}", response_model=MealPlan)
def read_meal_plan(meal_plan_id: int, db: Session = Depends(get_db)):
    meal_plan = db.query(MealPlanModel).filter(MealPlanModel.id == meal_plan_id).first()
    if meal_plan is None:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    return meal_plan

@router.put("/meal-plans/{meal_plan_id}", response_model=MealPlan)
def update_meal_plan(meal_plan_id: int, meal_plan: MealPlanCreate, db: Session = Depends(get_db)):
    db_meal_plan = db.query(MealPlanModel).filter(MealPlanModel.id == meal_plan_id).first()
    if db_meal_plan is None:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    # Update date if changed
    if meal_plan.date != db_meal_plan.date:
        # Check if new date conflicts with existing meal plan
        existing_plan = db.query(MealPlanModel).filter(
            MealPlanModel.date == meal_plan.date,
            MealPlanModel.id != meal_plan_id
        ).first()
        if existing_plan:
            raise HTTPException(status_code=400, detail=f"Meal plan for date {meal_plan.date} already exists")
        
        db_meal_plan.date = meal_plan.date
    
    # Clear existing recipes
    stmt = meal_plan_recipe.delete().where(meal_plan_recipe.c.meal_plan_id == meal_plan_id)
    db.execute(stmt)
    
    # Add new recipes
    for recipe_data in meal_plan.recipes:
        db_recipe = db.query(RecipeModel).filter(RecipeModel.id == recipe_data.recipe_id).first()
        if not db_recipe:
            raise HTTPException(status_code=404, detail=f"Recipe with id {recipe_data.recipe_id} not found")
        
        stmt = meal_plan_recipe.insert().values(
            meal_plan_id=db_meal_plan.id,
            recipe_id=db_recipe.id,
            meal_type=recipe_data.meal_type
        )
        db.execute(stmt)
    
    db.commit()
    db.refresh(db_meal_plan)
    return db_meal_plan

@router.delete("/meal-plans/{meal_plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal_plan(meal_plan_id: int, db: Session = Depends(get_db)):
    db_meal_plan = db.query(MealPlanModel).filter(MealPlanModel.id == meal_plan_id).first()
    if db_meal_plan is None:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    db.delete(db_meal_plan)
    db.commit()
    return None 