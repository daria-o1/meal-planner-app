#!/bin/bash

# Exit on error
set -e

echo "Preparing backend for deployment..."

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install mangum

# Create deployment package directory
echo "Creating deployment package..."
mkdir -p package

# Install dependencies to package directory
pip install --target ./package -r requirements.txt

# Add Lambda handler
echo "Adding Lambda handler..."
cp lambda_handler.py package/

# Add application code
echo "Adding application code..."
cp -r app package/
cp main.py package/

# Create zip file
echo "Creating zip file..."
cd package
zip -r ../backend-lambda.zip .
cd ..

echo "Backend deployment package created: backend-lambda.zip" 