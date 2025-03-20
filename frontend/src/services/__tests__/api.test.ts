import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as api from '../api';

// Create a mock for the axios instance
const mock = new MockAdapter(axios);

describe('API Service', () => {
  // Reset mocks after each test
  afterEach(() => {
    mock.reset();
  });

  // Recipe API Tests
  describe('Recipe API', () => {
    const mockRecipe = {
      id: 'test-recipe-1',
      name: 'Test Recipe',
      description: 'A test recipe',
      instructions: 'Test instructions',
      prep_time: 10,
      cook_time: 20,
      servings: 4,
      image_url: 'https://example.com/image.jpg',
      ingredients: []
    };

    test('getRecipes should fetch recipes', async () => {
      const mockRecipes = [mockRecipe];
      mock.onGet('/recipes/').reply(200, mockRecipes);

      const result = await api.getRecipes();
      expect(result).toEqual(mockRecipes);
    });

    test('getRecipe should fetch a specific recipe', async () => {
      mock.onGet('/recipes/test-recipe-1').reply(200, mockRecipe);

      const result = await api.getRecipe('test-recipe-1');
      expect(result).toEqual(mockRecipe);
    });

    test('createRecipe should create a recipe', async () => {
      mock.onPost('/recipes/').reply(201, mockRecipe);

      const result = await api.createRecipe(mockRecipe);
      expect(result).toEqual(mockRecipe);
    });

    test('updateRecipe should update a recipe', async () => {
      const updatedRecipe = { ...mockRecipe, name: 'Updated Recipe' };
      mock.onPut('/recipes/test-recipe-1').reply(200, updatedRecipe);

      const result = await api.updateRecipe('test-recipe-1', updatedRecipe);
      expect(result).toEqual(updatedRecipe);
    });

    test('deleteRecipe should delete a recipe', async () => {
      mock.onDelete('/recipes/test-recipe-1').reply(204);

      await expect(api.deleteRecipe('test-recipe-1')).resolves.not.toThrow();
    });
  });

  // Ingredient API Tests
  describe('Ingredient API', () => {
    const mockIngredient = {
      id: 'test-ingredient-1',
      name: 'Test Ingredient',
      category: 'Test Category'
    };

    test('getIngredients should fetch ingredients', async () => {
      const mockIngredients = [mockIngredient];
      mock.onGet('/ingredients/').reply(200, mockIngredients);

      const result = await api.getIngredients();
      expect(result).toEqual(mockIngredients);
    });

    test('createIngredient should create an ingredient', async () => {
      mock.onPost('/ingredients/').reply(201, mockIngredient);

      const result = await api.createIngredient(mockIngredient);
      expect(result).toEqual(mockIngredient);
    });
  });

  // Meal Plan API Tests
  describe('Meal Plan API', () => {
    const mockMealPlan = {
      id: 'test-meal-plan-1',
      date: '2023-05-01',
      recipes: [
        {
          recipe_id: 'test-recipe-1',
          meal_type: 'breakfast'
        }
      ]
    };

    test('getMealPlans should fetch meal plans', async () => {
      const mockMealPlans = [mockMealPlan];
      mock.onGet('/meal-plans/').reply(200, mockMealPlans);

      const result = await api.getMealPlans();
      expect(result).toEqual(mockMealPlans);
    });

    test('getMealPlans should handle date parameters', async () => {
      const mockMealPlans = [mockMealPlan];
      mock.onGet('/meal-plans/?start_date=2023-05-01&end_date=2023-05-07').reply(200, mockMealPlans);

      const result = await api.getMealPlans('2023-05-01', '2023-05-07');
      expect(result).toEqual(mockMealPlans);
    });

    test('getWeeklyMealPlan should fetch weekly meal plan', async () => {
      const mockMealPlans = [mockMealPlan];
      mock.onGet('/meal-plans/week/').reply(200, mockMealPlans);

      const result = await api.getWeeklyMealPlan();
      expect(result).toEqual(mockMealPlans);
    });

    test('createMealPlan should create a meal plan', async () => {
      mock.onPost('/meal-plans/').reply(201, mockMealPlan);

      const result = await api.createMealPlan(mockMealPlan);
      expect(result).toEqual(mockMealPlan);
    });

    test('updateMealPlan should update a meal plan', async () => {
      const updatedMealPlan = { ...mockMealPlan, date: '2023-05-02' };
      mock.onPut('/meal-plans/test-meal-plan-1').reply(200, updatedMealPlan);

      const result = await api.updateMealPlan('test-meal-plan-1', updatedMealPlan);
      expect(result).toEqual(updatedMealPlan);
    });

    test('deleteMealPlan should delete a meal plan', async () => {
      mock.onDelete('/meal-plans/test-meal-plan-1').reply(204);

      await expect(api.deleteMealPlan('test-meal-plan-1')).resolves.not.toThrow();
    });
  });

  // Grocery List API Tests
  describe('Grocery List API', () => {
    const mockGroceryList = {
      id: 'test-grocery-list-1',
      name: 'Test Grocery List',
      meal_plan_id: 'test-meal-plan-1',
      items: [
        {
          ingredient_id: 'test-ingredient-1',
          ingredient_name: 'Test Ingredient',
          quantity: 2,
          unit: 'cups',
          checked: false
        }
      ]
    };

    test('getGroceryLists should fetch grocery lists', async () => {
      const mockGroceryLists = [mockGroceryList];
      mock.onGet('/grocery-lists/').reply(200, mockGroceryLists);

      const result = await api.getGroceryLists();
      expect(result).toEqual(mockGroceryLists);
    });

    test('getGroceryList should fetch a specific grocery list', async () => {
      mock.onGet('/grocery-lists/test-grocery-list-1').reply(200, mockGroceryList);

      const result = await api.getGroceryList('test-grocery-list-1');
      expect(result).toEqual(mockGroceryList);
    });

    test('createGroceryList should create a grocery list', async () => {
      mock.onPost('/grocery-lists/').reply(201, mockGroceryList);

      const result = await api.createGroceryList(mockGroceryList);
      expect(result).toEqual(mockGroceryList);
    });

    test('updateGroceryList should update a grocery list', async () => {
      const updatedGroceryList = { ...mockGroceryList, name: 'Updated Grocery List' };
      mock.onPut('/grocery-lists/test-grocery-list-1').reply(200, updatedGroceryList);

      const result = await api.updateGroceryList('test-grocery-list-1', updatedGroceryList);
      expect(result).toEqual(updatedGroceryList);
    });

    test('updateGroceryItem should update a grocery item', async () => {
      const updatedItem = { checked: true };
      mock.onPatch('/grocery-lists/test-grocery-list-1/items/test-ingredient-1').reply(200, {
        ...mockGroceryList,
        items: [
          {
            ingredient_id: 'test-ingredient-1',
            ingredient_name: 'Test Ingredient',
            quantity: 2,
            unit: 'cups',
            checked: true
          }
        ]
      });

      const result = await api.updateGroceryItem('test-grocery-list-1', 'test-ingredient-1', updatedItem);
      expect(result.items[0].checked).toBe(true);
    });

    test('deleteGroceryList should delete a grocery list', async () => {
      mock.onDelete('/grocery-lists/test-grocery-list-1').reply(204);

      await expect(api.deleteGroceryList('test-grocery-list-1')).resolves.not.toThrow();
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      mock.onGet('/recipes/').networkError();
      
      await expect(api.getRecipes()).rejects.toThrow();
    });
  });
}); 