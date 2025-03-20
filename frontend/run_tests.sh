#!/bin/bash

# Exit on error
set -e

echo "Running frontend tests..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run tests
echo "Running tests..."
npm test

# Run linting
echo "Running linting..."
npm run lint

echo "All tests and checks passed!" 