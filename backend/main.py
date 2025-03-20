import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from app.routers import recipes, ingredients, meal_plans, grocery_lists

# Create FastAPI app
app = FastAPI(
    title="Meal Planner API",
    description="API for meal planning and recipe management",
    version="1.0.0"
)

# Configure CORS
origins = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recipes.router, prefix="/api", tags=["recipes"])
app.include_router(ingredients.router, prefix="/api", tags=["ingredients"])
app.include_router(meal_plans.router, prefix="/api", tags=["meal-plans"])
app.include_router(grocery_lists.router, prefix="/api", tags=["grocery-lists"])

@app.get("/")
def read_root():
    """Root endpoint for the API."""
    return {
        "message": "Welcome to the Meal Planner API",
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "version": "1.0.0"
    }

# Create Lambda handler
handler = Mangum(app)

# Run the app if executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 