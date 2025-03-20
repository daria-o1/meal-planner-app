#!/bin/bash
set -e

# Function to run migrations
run_migrations() {
    echo "Running database migrations..."
    python -c "from app.db.migrations import run_migrations; run_migrations()"
    echo "Migrations completed successfully."
}

# Check if we're running in local development mode
if [ "$1" = "local" ]; then
    echo "Starting in local development mode..."
    
    # Start DynamoDB Local in the background
    echo "Starting DynamoDB Local..."
    java -Djava.library.path=/opt/dynamodb/DynamoDBLocal_lib -jar /opt/dynamodb/DynamoDBLocal.jar -sharedDb -inMemory &
    DYNAMODB_PID=$!
    
    # Set environment variables for local development
    export AWS_ACCESS_KEY_ID=test
    export AWS_SECRET_ACCESS_KEY=test
    export AWS_DEFAULT_REGION=us-east-1
    export DYNAMODB_TABLE=meal-planner-local
    
    # Wait for DynamoDB to start
    echo "Waiting for DynamoDB Local to start..."
    sleep 2
    
    # Create the table if it doesn't exist
    echo "Setting up DynamoDB table..."
    python scripts/setup_dynamodb.py
    
    # Run migrations
    run_migrations
    
    # Start the FastAPI server with uvicorn
    echo "Starting FastAPI server..."
    exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    
# Check if we're running in SQLite mode
elif [ "$1" = "sqlite" ]; then
    echo "Starting in SQLite mode..."
    
    # Set environment variables for SQLite
    export DB_BACKEND=sqlite
    export SQLITE_DB_PATH=/tmp/meal-planner.db
    
    # Run migrations
    run_migrations
    
    # Start the FastAPI server with uvicorn
    echo "Starting FastAPI server with SQLite backend..."
    exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    
# Default to Lambda handler
else
    # Check if we're running in AWS Lambda
    if [ -z "$AWS_LAMBDA_RUNTIME_API" ]; then
        echo "Not running in AWS Lambda, starting in Lambda emulation mode..."
        # Start the Lambda Runtime Interface Emulator
        exec /usr/local/bin/python -m awslambdaric $1
    else
        # Running in AWS Lambda
        echo "Starting in AWS Lambda mode..."
        
        # Run migrations before starting the Lambda handler
        # This ensures the database is up to date before handling requests
        run_migrations
        
        exec /usr/local/bin/python -m awslambdaric $1
    fi
fi 