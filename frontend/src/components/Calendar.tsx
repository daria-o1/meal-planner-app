import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  TextField,
  Divider,
  Stack,
  Autocomplete,
} from '@mui/material';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TodayIcon from '@mui/icons-material/Today';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import CloseIcon from '@mui/icons-material/Close';

// This would come from the API in a real app
const mockRecipes = [
  { id: 1, name: 'Spaghetti Bolognese', description: 'Classic Italian pasta dish' },
  { id: 2, name: 'Chicken Stir Fry', description: 'Quick and healthy Asian dish' },
  { id: 3, name: 'Vegetable Curry', description: 'Spicy and flavorful vegetarian option' },
  { id: 4, name: 'Grilled Salmon', description: 'Healthy fish with herbs' },
  { id: 5, name: 'Avocado Toast', description: 'Simple breakfast option' },
];

// Mock meal plan data
const mockMealPlans = {
  '2023-05-01': {
    breakfast: { id: 5, name: 'Avocado Toast', description: 'Simple breakfast option' },
    lunch: { id: 2, name: 'Chicken Stir Fry', description: 'Quick and healthy Asian dish' },
    dinner: { id: 1, name: 'Spaghetti Bolognese', description: 'Classic Italian pasta dish' },
  },
  '2023-05-02': {
    breakfast: { id: 5, name: 'Avocado Toast', description: 'Simple breakfast option' },
    lunch: { id: 3, name: 'Vegetable Curry', description: 'Spicy and flavorful vegetarian option' },
    dinner: { id: 4, name: 'Grilled Salmon', description: 'Healthy fish with herbs' },
  },
};

type MealType = 'breakfast' | 'lunch' | 'dinner';

interface MealTypeInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
}

const Calendar: React.FC = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [selectedRecipe, setSelectedRecipe] = useState<number>(0);
  const [editMode, setEditMode] = useState(false);
  
  // New recipe form state
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    prepTime: '',
    cookTime: '',
    ingredients: [''],
    instructions: '',
  });

  const mealTypeInfo: Record<MealType, MealTypeInfo> = {
    breakfast: {
      label: 'Breakfast',
      icon: <FreeBreakfastIcon />,
      color: theme.palette.info.main,
    },
    lunch: {
      label: 'Lunch',
      icon: <LunchDiningIcon />,
      color: theme.palette.warning.main,
    },
    dinner: {
      label: 'Dinner',
      icon: <DinnerDiningIcon />,
      color: theme.palette.success.main,
    },
  };

  // Generate week dates
  useEffect(() => {
    try {
      setLoading(true);
      const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
      const dates = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
      setWeekDates(dates);
    } catch (error) {
      console.error("Error generating week dates:", error);
      // Set a fallback if there's an error
      const today = new Date();
      const fallbackDates = Array.from({ length: 7 }, (_, i) => addDays(today, i));
      setWeekDates(fallbackDates);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  const handlePreviousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddMeal = (day: Date, mealType: MealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    setEditMode(false);
    setOpenDialog(true);
  };

  const handleEditMeal = (day: Date, mealType: MealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    const meal = getMealForDay(day, mealType);
    setSelectedRecipe(meal?.id || 0);
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleDeleteMeal = (day: Date, mealType: MealType) => {
    // In a real app, this would delete from the API
    console.log('Deleting meal:', {
      day,
      mealType,
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecipe(0);
  };

  const handleSaveMeal = () => {
    // In a real app, this would save to the API
    console.log('Saving meal:', {
      day: selectedDay,
      mealType: selectedMealType,
      recipeId: selectedRecipe,
      editMode,
    });
    handleCloseDialog();
  };

  const handleRecipeChange = (event: SelectChangeEvent<number>) => {
    setSelectedRecipe(event.target.value as number);
  };

  const getMealForDay = (day: Date, mealType: MealType) => {
    try {
      const dateKey = format(day, 'yyyy-MM-dd');
      return mockMealPlans[dateKey as keyof typeof mockMealPlans]?.[mealType] || null;
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  const checkIsToday = (day: Date) => {
    return isToday(day);
  };

  const handleCreateRecipe = () => {
    // Open the recipe creation dialog
    setOpenRecipeDialog(true);
  };

  const handleCloseRecipeDialog = () => {
    setOpenRecipeDialog(false);
    // Reset the form
    setNewRecipe({
      name: '',
      description: '',
      prepTime: '',
      cookTime: '',
      ingredients: [''],
      instructions: '',
    });
  };

  const handleSaveNewRecipe = () => {
    // In a real app, this would save the new recipe to the API
    console.log('Saving new recipe:', newRecipe);
    
    // For demo purposes, we'll just close the dialog
    handleCloseRecipeDialog();
    
    // In a real implementation, you would add the new recipe to the list
    // and select it in the meal dialog
  };

  const handleRecipeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecipe(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index: number, value: string) => {
    setNewRecipe(prev => {
      const newIngredients = [...prev.ingredients];
      newIngredients[index] = value;
      return {
        ...prev,
        ingredients: newIngredients
      };
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 3, 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Meal Plan Calendar
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Previous week">
            <IconButton onClick={handlePreviousWeek} color="primary" size="large">
              <NavigateBeforeIcon />
            </IconButton>
          </Tooltip>
          
          <Button 
            onClick={handleToday} 
            variant="outlined" 
            startIcon={<TodayIcon />}
            size="small"
          >
            Today
          </Button>
          
          <Tooltip title="Next week">
            <IconButton onClick={handleNextWeek} color="primary" size="large">
              <NavigateNextIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {weekDates.length > 0 && (
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                textAlign: 'center',
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              {format(weekDates[0], 'MMMM d')} - {format(weekDates[6], 'MMMM d, yyyy')}
            </Typography>
          )}

          {weekDates.length > 0 && (
            <Grid container spacing={2}>
              {weekDates.map((day) => (
                <Grid item xs={12} key={day.toString()}>
                  <Paper 
                    elevation={checkIsToday(day) ? 3 : 1} 
                    sx={{ 
                      p: 2, 
                      mb: 2,
                      borderLeft: checkIsToday(day) 
                        ? `4px solid ${theme.palette.primary.main}` 
                        : 'none',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                      },
                    }}
                  >
                    <Box 
                      sx={{ 
                        mb: 2, 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: checkIsToday(day) ? 700 : 600,
                            color: checkIsToday(day) ? 'primary.main' : 'text.primary',
                          }}
                        >
                          {format(day, 'EEEE')}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            ml: 1,
                            color: 'text.secondary',
                            fontWeight: 500
                          }}
                        >
                          {format(day, 'MMMM d')}
                        </Typography>
                      </Box>
                      
                      {checkIsToday(day) && (
                        <Chip 
                          label="Today" 
                          color="primary" 
                          size="small" 
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>
                    
                    <Grid container spacing={2}>
                      {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => {
                        const meal = getMealForDay(day, mealType);
                        const { label, icon, color } = mealTypeInfo[mealType];
                        
                        return (
                          <Grid item xs={12} md={4} key={mealType}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                height: '100%',
                                borderLeft: `4px solid ${color}`,
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  boxShadow: theme.shadows[2],
                                },
                              }}
                            >
                              <CardContent>
                                <Box 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    mb: 1.5,
                                    justifyContent: 'space-between'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box 
                                      sx={{ 
                                        color,
                                        display: 'flex',
                                        mr: 1
                                      }}
                                    >
                                      {icon}
                                    </Box>
                                    <Typography 
                                      variant="subtitle1" 
                                      sx={{ 
                                        fontWeight: 600,
                                        color
                                      }}
                                    >
                                      {label}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                {meal ? (
                                  <Box>
                                    <Typography 
                                      variant="body1" 
                                      sx={{ 
                                        fontWeight: 500,
                                        mb: 0.5
                                      }}
                                    >
                                      {meal.name}
                                    </Typography>
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary"
                                      sx={{ mb: 1.5 }}
                                    >
                                      {meal.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                      <Tooltip title="Edit meal">
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleEditMeal(day, mealType)}
                                          sx={{ color: 'primary.main' }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="Remove meal">
                                        <IconButton 
                                          size="small" 
                                          onClick={() => handleDeleteMeal(day, mealType)}
                                          sx={{ color: 'error.main' }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Button 
                                    startIcon={<AddIcon />} 
                                    onClick={() => handleAddMeal(day, mealType)}
                                    sx={{ 
                                      mt: 1,
                                      backgroundColor: alpha(color, 0.1),
                                      color: color,
                                      '&:hover': {
                                        backgroundColor: alpha(color, 0.2),
                                      }
                                    }}
                                    fullWidth
                                  >
                                    Add {label}
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Add/Edit Meal Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[10],
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1, 
            pt: 2.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box 
            sx={{ 
              bgcolor: selectedMealType ? alpha(mealTypeInfo[selectedMealType].color, 0.1) : 'transparent',
              color: selectedMealType ? mealTypeInfo[selectedMealType].color : 'inherit',
              p: 1,
              borderRadius: '50%',
              display: 'flex',
            }}
          >
            {selectedMealType && mealTypeInfo[selectedMealType].icon}
          </Box>
          <Box>
            <Typography variant="h6" component="span">
              {editMode ? 'Edit' : 'Add'} {selectedMealType && mealTypeInfo[selectedMealType].label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Select a recipe for this meal:
          </Typography>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="recipe-select-label">Recipe</InputLabel>
            <Select
              labelId="recipe-select-label"
              id="recipe-select"
              value={selectedRecipe}
              label="Recipe"
              onChange={handleRecipeChange}
              MenuProps={{
                PaperProps: {
                  sx: { maxHeight: 300 }
                }
              }}
            >
              <MenuItem value={0} disabled>Select a recipe</MenuItem>
              {mockRecipes.map((recipe) => (
                <MenuItem key={recipe.id} value={recipe.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">{recipe.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {recipe.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {selectedRecipe > 0 && (
            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="subtitle2" gutterBottom color="primary.main">
                Selected Recipe
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {mockRecipes.find(r => r.id === selectedRecipe)?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {mockRecipes.find(r => r.id === selectedRecipe)?.description}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button 
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateRecipe}
              sx={{ 
                textTransform: 'none',
                borderStyle: 'dashed',
                borderWidth: 2,
                py: 1,
                px: 2,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
            >
              Create new recipe
            </Button>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3, 
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveMeal} 
            variant="contained" 
            disabled={!selectedRecipe}
            startIcon={editMode ? <EditIcon /> : <AddIcon />}
            sx={{ 
              px: 3,
              bgcolor: selectedMealType ? mealTypeInfo[selectedMealType].color : 'primary.main',
              '&:hover': {
                bgcolor: selectedMealType 
                  ? alpha(mealTypeInfo[selectedMealType].color, 0.8) 
                  : 'primary.dark',
              }
            }}
          >
            {editMode ? 'Update' : 'Add'} Meal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recipe Creation Dialog */}
      <Dialog 
        open={openRecipeDialog} 
        onClose={handleCloseRecipeDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.shadows[10],
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1, 
            pt: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box 
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                p: 1,
                borderRadius: '50%',
                display: 'flex',
              }}
            >
              <RestaurantIcon />
            </Box>
            <Typography variant="h6">Create New Recipe</Typography>
          </Box>
          <IconButton onClick={handleCloseRecipeDialog} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Basic Information
              </Typography>
              <TextField
                label="Recipe Name"
                value={newRecipe.name}
                onChange={handleRecipeInputChange}
                name="name"
                fullWidth
                variant="outlined"
                placeholder="e.g., Spaghetti Bolognese"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                value={newRecipe.description}
                onChange={handleRecipeInputChange}
                name="description"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                placeholder="Brief description of the recipe"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Preparation Time</Typography>
              </Box>
              <TextField
                label="Prep Time"
                value={newRecipe.prepTime}
                onChange={handleRecipeInputChange}
                name="prepTime"
                fullWidth
                variant="outlined"
                placeholder="e.g., 15 minutes"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Cooking Time</Typography>
              </Box>
              <TextField
                label="Cook Time"
                value={newRecipe.cookTime}
                onChange={handleRecipeInputChange}
                name="cookTime"
                fullWidth
                variant="outlined"
                placeholder="e.g., 30 minutes"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalDiningIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">Ingredients</Typography>
                </Box>
                <Button 
                  startIcon={<AddIcon />} 
                  onClick={handleAddIngredient}
                  size="small"
                  variant="outlined"
                >
                  Add Ingredient
                </Button>
              </Box>
              
              {newRecipe.ingredients.map((ingredient, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1.5,
                    gap: 1
                  }}
                >
                  <TextField
                    label={`Ingredient ${index + 1}`}
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="e.g., 2 cups flour"
                    size="small"
                  />
                  {index > 0 && (
                    <IconButton 
                      onClick={() => handleRemoveIngredient(index)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RestaurantIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Instructions</Typography>
              </Box>
              <TextField
                label="Cooking Instructions"
                value={newRecipe.instructions}
                onChange={handleRecipeInputChange}
                name="instructions"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                placeholder="Step-by-step instructions for preparing the recipe"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3, 
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button 
            onClick={handleCloseRecipeDialog} 
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveNewRecipe} 
            variant="contained" 
            startIcon={<AddIcon />}
            disabled={!newRecipe.name || newRecipe.ingredients.some(ing => !ing)}
            sx={{ px: 3 }}
          >
            Create Recipe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 