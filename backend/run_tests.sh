#!/bin/bash

# Exit on error
set -e

echo "Running backend tests..."

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
pip install -r requirements-dev.txt

# Run tests
echo "Running tests..."
pytest

# Run linting
echo "Running linting..."
flake8 app tests
black --check app tests
isort --check-only app tests

echo "All tests and checks passed!" 