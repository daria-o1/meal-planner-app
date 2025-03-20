import axios from 'axios';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed in the future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API errors gracefully
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Recipes
export const getRecipes = async () => {
  const response = await api.get('/recipes/');
  return response.data;
};

export const getRecipe = async (id: string) => {
  const response = await api.get(`/recipes/${id}`);
  return response.data;
};

export const createRecipe = async (recipe: any) => {
  const response = await api.post('/recipes/', recipe);
  return response.data;
};

export const updateRecipe = async (id: string, recipe: any) => {
  const response = await api.put(`/recipes/${id}`, recipe);
  return response.data;
};

export const deleteRecipe = async (id: string) => {
  await api.delete(`/recipes/${id}`);
};

// Ingredients
export const getIngredients = async () => {
  const response = await api.get('/ingredients/');
  return response.data;
};

export const createIngredient = async (ingredient: any) => {
  const response = await api.post('/ingredients/', ingredient);
  return response.data;
};

// Meal Plans
export const getMealPlans = async (startDate?: string, endDate?: string) => {
  let url = '/meal-plans/';
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  } else if (startDate) {
    url += `?start_date=${startDate}`;
  } else if (endDate) {
    url += `?end_date=${endDate}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const getWeeklyMealPlan = async (startDate?: string) => {
  let url = '/meal-plans/week/';
  if (startDate) {
    url += `?start_date=${startDate}`;
  }
  const response = await api.get(url);
  return response.data;
};

export const createMealPlan = async (mealPlan: any) => {
  const response = await api.post('/meal-plans/', mealPlan);
  return response.data;
};

export const updateMealPlan = async (id: string, mealPlan: any) => {
  const response = await api.put(`/meal-plans/${id}`, mealPlan);
  return response.data;
};

export const deleteMealPlan = async (id: string) => {
  await api.delete(`/meal-plans/${id}`);
};

// Grocery Lists
export const getGroceryLists = async () => {
  const response = await api.get('/grocery-lists/');
  return response.data;
};

export const getGroceryList = async (id: string) => {
  const response = await api.get(`/grocery-lists/${id}`);
  return response.data;
};

export const createGroceryList = async (groceryList: any) => {
  const response = await api.post('/grocery-lists/', groceryList);
  return response.data;
};

export const updateGroceryList = async (id: string, groceryList: any) => {
  const response = await api.put(`/grocery-lists/${id}`, groceryList);
  return response.data;
};

export const updateGroceryItem = async (groceryListId: string, ingredientId: string, item: any) => {
  const response = await api.patch(`/grocery-lists/${groceryListId}/items/${ingredientId}`, item);
  return response.data;
};

export const deleteGroceryList = async (id: string) => {
  await api.delete(`/grocery-lists/${id}`);
};

export default api; 