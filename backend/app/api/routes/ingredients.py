from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Ingredient as IngredientModel
from app.schemas.schemas import Ingredient, IngredientCreate

router = APIRouter()

@router.post("/ingredients/", response_model=Ingredient, status_code=status.HTTP_201_CREATED)
def create_ingredient(ingredient: IngredientCreate, db: Session = Depends(get_db)):
    # Check if ingredient already exists
    db_ingredient = db.query(IngredientModel).filter(IngredientModel.name == ingredient.name).first()
    if db_ingredient:
        raise HTTPException(status_code=400, detail="Ingredient already exists")
    
    # Create new ingredient
    db_ingredient = IngredientModel(**ingredient.dict())
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

@router.get("/ingredients/", response_model=List[Ingredient])
def read_ingredients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    ingredients = db.query(IngredientModel).offset(skip).limit(limit).all()
    return ingredients

@router.get("/ingredients/{ingredient_id}", response_model=Ingredient)
def read_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    ingredient = db.query(IngredientModel).filter(IngredientModel.id == ingredient_id).first()
    if ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient

@router.put("/ingredients/{ingredient_id}", response_model=Ingredient)
def update_ingredient(ingredient_id: int, ingredient: IngredientCreate, db: Session = Depends(get_db)):
    db_ingredient = db.query(IngredientModel).filter(IngredientModel.id == ingredient_id).first()
    if db_ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    # Check if name is being changed and if it would conflict
    if ingredient.name != db_ingredient.name:
        existing = db.query(IngredientModel).filter(IngredientModel.name == ingredient.name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ingredient with this name already exists")
    
    # Update ingredient
    for key, value in ingredient.dict().items():
        setattr(db_ingredient, key, value)
    
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

@router.delete("/ingredients/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ingredient(ingredient_id: int, db: Session = Depends(get_db)):
    db_ingredient = db.query(IngredientModel).filter(IngredientModel.id == ingredient_id).first()
    if db_ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db.delete(db_ingredient)
    db.commit()
    return None 