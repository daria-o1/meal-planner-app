# Meal Planner Frontend

This is the frontend for the Meal Planner application. It provides a user interface for managing recipes, meal plans, and grocery lists.

## Features

- **Calendar View**: Plan your meals for the week with breakfast, lunch, and dinner options.
- **Recipe Management**: Create, view, edit, and delete recipes with ingredients and instructions.
- **Grocery List**: Automatically generate grocery lists from your meal plans or create custom lists.

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Axios

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

The application will be available at http://localhost:5173.

## Project Structure

- `src/components`: React components for the UI
- `src/services`: API services for communicating with the backend
- `src/types`: TypeScript type definitions

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run lint`: Run ESLint to check for code quality issues
- `npm run preview`: Preview the production build locally

## Backend API

The frontend communicates with a FastAPI backend. Make sure the backend server is running at http://localhost:8000 before using the application.
