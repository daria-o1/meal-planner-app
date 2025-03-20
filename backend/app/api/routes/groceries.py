from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import GroceryList as GroceryListModel, Ingredient as IngredientModel, grocery_list_item
from app.schemas.schemas import GroceryList, GroceryListCreate, GroceryItemBase

router = APIRouter()

@router.post("/grocery-lists/", response_model=GroceryList, status_code=status.HTTP_201_CREATED)
def create_grocery_list(grocery_list: GroceryListCreate, db: Session = Depends(get_db)):
    # Create grocery list
    db_grocery_list = GroceryListModel(
        name=grocery_list.name,
        meal_plan_id=grocery_list.meal_plan_id
    )
    db.add(db_grocery_list)
    db.commit()
    db.refresh(db_grocery_list)
    
    # Add items to grocery list
    for item_data in grocery_list.items:
        # Check if ingredient exists
        db_ingredient = db.query(IngredientModel).filter(IngredientModel.id == item_data.ingredient_id).first()
        if not db_ingredient:
            raise HTTPException(status_code=404, detail=f"Ingredient with id {item_data.ingredient_id} not found")
        
        # Add to association table
        stmt = grocery_list_item.insert().values(
            grocery_list_id=db_grocery_list.id,
            ingredient_id=db_ingredient.id,
            quantity=item_data.quantity,
            unit=item_data.unit,
            checked=1 if item_data.checked else 0
        )
        db.execute(stmt)
    
    db.commit()
    db.refresh(db_grocery_list)
    return db_grocery_list

@router.get("/grocery-lists/", response_model=List[GroceryList])
def read_grocery_lists(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    grocery_lists = db.query(GroceryListModel).offset(skip).limit(limit).all()
    return grocery_lists

@router.get("/grocery-lists/{grocery_list_id}", response_model=GroceryList)
def read_grocery_list(grocery_list_id: int, db: Session = Depends(get_db)):
    grocery_list = db.query(GroceryListModel).filter(GroceryListModel.id == grocery_list_id).first()
    if grocery_list is None:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    return grocery_list

@router.put("/grocery-lists/{grocery_list_id}", response_model=GroceryList)
def update_grocery_list(grocery_list_id: int, grocery_list: GroceryListCreate, db: Session = Depends(get_db)):
    db_grocery_list = db.query(GroceryListModel).filter(GroceryListModel.id == grocery_list_id).first()
    if db_grocery_list is None:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    
    # Update grocery list attributes
    db_grocery_list.name = grocery_list.name
    db_grocery_list.meal_plan_id = grocery_list.meal_plan_id
    
    # Clear existing items
    stmt = grocery_list_item.delete().where(grocery_list_item.c.grocery_list_id == grocery_list_id)
    db.execute(stmt)
    
    # Add new items
    for item_data in grocery_list.items:
        db_ingredient = db.query(IngredientModel).filter(IngredientModel.id == item_data.ingredient_id).first()
        if not db_ingredient:
            raise HTTPException(status_code=404, detail=f"Ingredient with id {item_data.ingredient_id} not found")
        
        stmt = grocery_list_item.insert().values(
            grocery_list_id=db_grocery_list.id,
            ingredient_id=db_ingredient.id,
            quantity=item_data.quantity,
            unit=item_data.unit,
            checked=1 if item_data.checked else 0
        )
        db.execute(stmt)
    
    db.commit()
    db.refresh(db_grocery_list)
    return db_grocery_list

@router.patch("/grocery-lists/{grocery_list_id}/items/{ingredient_id}", response_model=GroceryList)
def update_grocery_item(
    grocery_list_id: int, 
    ingredient_id: int, 
    item: GroceryItemBase, 
    db: Session = Depends(get_db)
):
    # Check if grocery list exists
    db_grocery_list = db.query(GroceryListModel).filter(GroceryListModel.id == grocery_list_id).first()
    if db_grocery_list is None:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    
    # Update the item
    stmt = grocery_list_item.update().where(
        grocery_list_item.c.grocery_list_id == grocery_list_id,
        grocery_list_item.c.ingredient_id == ingredient_id
    ).values(
        quantity=item.quantity,
        unit=item.unit,
        checked=1 if item.checked else 0
    )
    result = db.execute(stmt)
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Item not found in grocery list")
    
    db.commit()
    db.refresh(db_grocery_list)
    return db_grocery_list

@router.delete("/grocery-lists/{grocery_list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grocery_list(grocery_list_id: int, db: Session = Depends(get_db)):
    db_grocery_list = db.query(GroceryListModel).filter(GroceryListModel.id == grocery_list_id).first()
    if db_grocery_list is None:
        raise HTTPException(status_code=404, detail="Grocery list not found")
    
    db.delete(db_grocery_list)
    db.commit()
    return None 