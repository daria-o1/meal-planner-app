import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Mock recipe data
const mockRecipes = [
  {
    id: 1,
    name: 'Spaghetti Bolognese',
    description: 'Classic Italian pasta dish with rich meat sauce',
    prepTime: 15,
    cookTime: 45,
    servings: 4,
    imageUrl: 'https://images.unsplash.com/photo-1598866594230-a7c12756260f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1008&q=80',
  },
  {
    id: 2,
    name: 'Chicken Stir Fry',
    description: 'Quick and healthy Asian dish with vegetables',
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1025&q=80',
  },
  {
    id: 3,
    name: 'Vegetable Curry',
    description: 'Spicy and flavorful vegetarian option with rice',
    prepTime: 25,
    cookTime: 35,
    servings: 4,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1071&q=80',
  },
  {
    id: 4,
    name: 'Grilled Salmon',
    description: 'Healthy fish with herbs and lemon',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
  },
  {
    id: 5,
    name: 'Avocado Toast',
    description: 'Simple breakfast option with whole grain bread',
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    imageUrl: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
  },
];

// Mock ingredient data
const mockIngredients = [
  { id: 1, name: 'Pasta', category: 'Grains' },
  { id: 2, name: 'Ground Beef', category: 'Meat' },
  { id: 3, name: 'Tomato Sauce', category: 'Canned Goods' },
  { id: 4, name: 'Chicken Breast', category: 'Meat' },
  { id: 5, name: 'Bell Pepper', category: 'Produce' },
  { id: 6, name: 'Broccoli', category: 'Produce' },
  { id: 7, name: 'Curry Paste', category: 'Spices' },
  { id: 8, name: 'Coconut Milk', category: 'Dairy' },
  { id: 9, name: 'Salmon Fillet', category: 'Seafood' },
  { id: 10, name: 'Avocado', category: 'Produce' },
  { id: 11, name: 'Bread', category: 'Bakery' },
];

interface RecipeFormData {
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  imageUrl: string;
  ingredients: Array<{
    id: number;
    quantity: string;
    unit: string;
  }>;
}

const RecipeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    description: '',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    imageUrl: '',
    ingredients: [],
  });
  const [selectedIngredient, setSelectedIngredient] = useState<number>(0);
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setFormData({
      name: '',
      description: '',
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      imageUrl: '',
      ingredients: [],
    });
  };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: parseInt(value) || 0,
    });
  };

  const handleAddIngredient = () => {
    if (selectedIngredient && ingredientQuantity && ingredientUnit) {
      setFormData({
        ...formData,
        ingredients: [
          ...formData.ingredients,
          {
            id: selectedIngredient,
            quantity: ingredientQuantity,
            unit: ingredientUnit,
          },
        ],
      });
      // Reset ingredient form
      setSelectedIngredient(0);
      setIngredientQuantity('');
      setIngredientUnit('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: updatedIngredients,
    });
  };

  const handleSaveRecipe = () => {
    // In a real app, this would save to the API
    console.log('Saving recipe:', formData);
    handleCloseDialog();
  };

  // Filter recipes based on search term
  const filteredRecipes = mockRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get ingredient name by ID
  const getIngredientName = (id: number) => {
    return mockIngredients.find((ingredient) => ingredient.id === id)?.name || '';
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Recipes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Recipe
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search recipes..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea component={Link} to={`/recipes/${recipe.id}`}>
                <CardMedia
                  component="img"
                  height="160"
                  image={recipe.imageUrl}
                  alt={recipe.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {recipe.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {recipe.description}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2">
                      Prep: {recipe.prepTime} min
                    </Typography>
                    <Typography variant="body2">
                      Cook: {recipe.cookTime} min
                    </Typography>
                    <Typography variant="body2">
                      Serves: {recipe.servings}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Recipe Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Recipe</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Recipe Info Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" sx={{ mb: 1 }}>
                Basic Information
              </Typography>
              <TextField
                fullWidth
                required
                label="Recipe Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                helperText="Give your recipe a descriptive name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={2}
                helperText="Briefly describe your recipe"
              />
            </Grid>
            {/* Time and Servings Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" sx={{ mt: 2, mb: 1 }}>
                Time & Servings
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Prep Time"
                name="prepTime"
                type="number"
                value={formData.prepTime}
                onChange={handleNumberChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
                helperText="Preparation time in minutes"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Cook Time"
                name="cookTime"
                type="number"
                value={formData.cookTime}
                onChange={handleNumberChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">min</InputAdornment>,
                }}
                helperText="Cooking time in minutes"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                label="Servings"
                name="servings"
                type="number"
                value={formData.servings}
                onChange={handleNumberChange}
                helperText="Number of servings"
              />
            </Grid>

            {/* Image URL Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" color="primary" sx={{ mt: 2, mb: 1 }}>
                Recipe Image
              </Typography>
              <TextField
                fullWidth
                required
                label="Image URL"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleFormChange}
                helperText="Paste a URL to an image of your recipe"
              />
            </Grid>

            {/* Ingredients Section */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Ingredients
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="ingredient-select-label">Select Ingredient</InputLabel>
                      <Select
                        labelId="ingredient-select-label"
                        id="ingredient-select"
                        value={selectedIngredient}
                        label="Select Ingredient"
                        onChange={(e) => setSelectedIngredient(e.target.value as number)}
                      >
                        <MenuItem value={0} disabled>Choose an ingredient</MenuItem>
                        {mockIngredients.map((ingredient) => (
                          <MenuItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Amount"
                      value={ingredientQuantity}
                      onChange={(e) => setIngredientQuantity(e.target.value)}
                      placeholder="e.g., 2, 0.5"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Unit"
                      value={ingredientUnit}
                      onChange={(e) => setIngredientUnit(e.target.value)}
                      placeholder="e.g., cups, tbsp, g"
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleAddIngredient}
                      disabled={!selectedIngredient || !ingredientQuantity || !ingredientUnit}
                      startIcon={<AddIcon />}
                      sx={{ height: '56px' }}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>

                {formData.ingredients.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Added Ingredients:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {formData.ingredients.map((ingredient, index) => (
                          <Chip
                            key={index}
                            label={`${getIngredientName(ingredient.id)} (${ingredient.quantity} ${ingredient.unit})`}
                            onDelete={() => handleRemoveIngredient(index)}
                            deleteIcon={<DeleteIcon />}
                            sx={{ mb: 1 }}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Paper>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          <Button
            onClick={handleSaveRecipe}
            variant="contained"
            disabled={!formData.name || !formData.description || formData.ingredients.length === 0}
            startIcon={<SaveIcon />}
          >
            Save Recipe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecipeList; 