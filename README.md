# Meal Planner Application

A comprehensive application for planning meals, managing recipes, and creating grocery lists.

## Features

- **Calendar View**: Plan your meals for the week with an intuitive calendar interface
- **Recipe Management**: Create, edit, and organize your favorite recipes
- **Grocery List**: Automatically generate shopping lists based on your meal plan
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing in any environment
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Animated Transitions**: Smooth page transitions for a polished user experience

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

### Frontend
- React
- TypeScript
- Material-UI
- React Router
- Axios
- Framer Motion (for animations)

## Project Structure

```
meal-planner-app/
├── backend/           # FastAPI backend
│   ├── models/        # Database models
│   ├── routes/        # API endpoints
│   └── database.py    # Database configuration
└── frontend/          # React frontend
    ├── src/
    │   ├── components/  # React components
    │   ├── services/    # API services
    │   └── types/       # TypeScript type definitions
    └── public/        # Static assets
```

## Setup and Installation

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Run the backend server:
   ```
   python main.py
   ```
   The API will be available at http://localhost:8000

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```
   The application will be available at http://localhost:5173

## Features in Detail

### Dark Mode
- Toggle between light and dark themes using the icon in the header
- Preferences are saved to localStorage for persistence between sessions
- Optimized color schemes for both modes to ensure readability and comfort

### Responsive Design
- Adapts to different screen sizes from mobile to desktop
- Sidebar collapses to a drawer on mobile devices
- Optimized layouts for different viewport sizes

### Calendar View
- Weekly meal planning with intuitive interface
- Add, edit, and remove meals for breakfast, lunch, and dinner
- Visual indicators for the current day

### Recipe Management
- Organize recipes by categories
- Search functionality to quickly find recipes
- Detailed view with ingredients and instructions

### Grocery List
- Automatically generated based on meal plan
- Ability to add, edit, and check off items
- Organize by categories for easier shopping

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## License

This project is licensed under the MIT License - see the LICENSE file for details. 