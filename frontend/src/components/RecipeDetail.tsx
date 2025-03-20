import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  Card,
  CardMedia,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// Mock recipe data (in a real app, this would come from an API)
const mockRecipes = [
  {
    id: 1,
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta dish with rich meat sauce',
    instructions: '1. Cook pasta according to package instructions.\n2. Brown ground beef in a large pan.\n3. Add tomato sauce and simmer for 30 minutes.\n4. Serve sauce over pasta with grated Parmesan cheese.',
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1008&q=80',
    ingredients: [
      { id: 1, name: 'Pasta', quantity: '500', unit: 'g', category: 'Grains' },
      { id: 2, name: 'Ground Beef', quantity: '400', unit: 'g', category: 'Meat' },
      { id: 3, name: 'Tomato Sauce', quantity: '500', unit: 'ml', category: 'Canned Goods' },
    ],
  },
  {
    id: 2,
    name: 'Chicken Stir Fry',
    description: 'Quick and healthy Asian dish with vegetables',
    instructions: '1. Slice chicken and vegetables.\n2. Heat oil in a wok or large frying pan.\n3. Stir-fry chicken until cooked through.\n4. Add vegetables and stir-fry for 3-4 minutes.\n5. Add sauce and cook for another minute.\n6. Serve with rice.',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80',
    ingredients: [
      { id: 4, name: 'Chicken Breast', quantity: '300', unit: 'g', category: 'Meat' },
      { id: 5, name: 'Bell Pepper', quantity: '1', unit: 'whole', category: 'Produce' },
      { id: 6, name: 'Broccoli', quantity: '200', unit: 'g', category: 'Produce' },
    ],
  },
  {
    id: 3,
    name: 'Vegetable Curry',
    description: 'Spicy and flavorful vegetarian option with rice',
    instructions: '1. Chop all vegetables.\n2. Heat oil in a large pot.\n3. Add curry paste and cook for 1 minute.\n4. Add vegetables and stir to coat with curry paste.\n5. Pour in coconut milk and simmer for 20 minutes.\n6. Serve with rice.',
    prepTime: 25,
    cookTime: 35,
    servings: 4,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1071&q=80',
    ingredients: [
      { id: 5, name: 'Bell Pepper', quantity: '2', unit: 'whole', category: 'Produce' },
      { id: 6, name: 'Broccoli', quantity: '300', unit: 'g', category: 'Produce' },
      { id: 7, name: 'Curry Paste', quantity: '3', unit: 'tbsp', category: 'Spices' },
      { id: 8, name: 'Coconut Milk', quantity: '400', unit: 'ml', category: 'Dairy' },
    ],
  },
  {
    id: 4,
    name: 'Grilled Salmon',
    description: 'Healthy fish with herbs and lemon',
    instructions: '1. Preheat grill to medium-high heat.\n2. Season salmon with salt, pepper, and herbs.\n3. Grill for 4-5 minutes per side.\n4. Serve with lemon wedges.',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    ingredients: [
      { id: 9, name: 'Salmon Fillet', quantity: '400', unit: 'g', category: 'Seafood' },
    ],
  },
  {
    id: 5,
    name: 'Avocado Toast',
    description: 'Simple breakfast option with whole grain bread',
    instructions: '1. Toast bread.\n2. Mash avocado and spread on toast.\n3. Season with salt and pepper.\n4. Optional: top with a poached egg.',
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
    ingredients: [
      { id: 10, name: 'Avocado', quantity: '1', unit: 'whole', category: 'Produce' },
      { id: 11, name: 'Bread', quantity: '2', unit: 'slices', category: 'Bakery' },
    ],
  },
];

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<any | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const recipeId = parseInt(id || '0');
    const foundRecipe = mockRecipes.find((r) => r.id === recipeId);
    setRecipe(foundRecipe || null);
  }, [id]);

  if (!recipe) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5">Recipe not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/recipes')}
          sx={{ mt: 2 }}
        >
          Back to Recipes
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/recipes')}
        sx={{ mb: 2 }}
      >
        Back to Recipes
      </Button>

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {recipe.name}
            </Typography>
            <Typography variant="body1" paragraph>
              {recipe.description}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`Prep: ${recipe.prepTime} min`} 
                variant="outlined" 
              />
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`Cook: ${recipe.cookTime} min`} 
                variant="outlined" 
              />
              <Chip 
                icon={<RestaurantIcon />} 
                label={`Serves: ${recipe.servings}`} 
                variant="outlined" 
              />
            </Box>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <List dense>
                {recipe.ingredients.map((ingredient: any) => (
                  <ListItem key={ingredient.id}>
                    <ListItemText 
                      primary={`${ingredient.name} - ${ingredient.quantity} ${ingredient.unit}`}
                      secondary={ingredient.category}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardMedia
                component="img"
                height="300"
                image={recipe.imageUrl}
                alt={recipe.name}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            {recipe.instructions.split('\n').map((step: string, index: number) => (
              <Typography key={index} variant="body1" paragraph>
                {step}
              </Typography>
            ))}
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={() => {
            // In a real app, this would call an API
            alert('Delete functionality would be implemented here');
          }}
        >
          Delete Recipe
        </Button>
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => {
            // In a real app, this would navigate to an edit form
            alert('Edit functionality would be implemented here');
          }}
        >
          Edit Recipe
        </Button>
      </Box>
    </Box>
  );
};

export default RecipeDetail; 