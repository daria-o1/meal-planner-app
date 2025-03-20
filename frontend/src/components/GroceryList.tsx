import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Checkbox,
  IconButton,
  Divider,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';

// Mock grocery list data
const mockGroceryItems = [
  { id: 1, name: 'Pasta', quantity: '500', unit: 'g', category: 'Grains', checked: false },
  { id: 2, name: 'Ground Beef', quantity: '400', unit: 'g', category: 'Meat', checked: false },
  { id: 3, name: 'Tomato Sauce', quantity: '500', unit: 'ml', category: 'Canned Goods', checked: true },
  { id: 4, name: 'Chicken Breast', quantity: '300', unit: 'g', category: 'Meat', checked: false },
  { id: 5, name: 'Bell Pepper', quantity: '3', unit: 'whole', category: 'Produce', checked: false },
  { id: 6, name: 'Broccoli', quantity: '500', unit: 'g', category: 'Produce', checked: true },
  { id: 7, name: 'Curry Paste', quantity: '3', unit: 'tbsp', category: 'Spices', checked: false },
  { id: 8, name: 'Coconut Milk', quantity: '400', unit: 'ml', category: 'Dairy', checked: false },
  { id: 9, name: 'Salmon Fillet', quantity: '400', unit: 'g', category: 'Seafood', checked: false },
  { id: 10, name: 'Avocado', quantity: '1', unit: 'whole', category: 'Produce', checked: false },
  { id: 11, name: 'Bread', quantity: '2', unit: 'slices', category: 'Bakery', checked: true },
];

// Mock ingredient data for adding new items
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
  { id: 12, name: 'Milk', category: 'Dairy' },
  { id: 13, name: 'Eggs', category: 'Dairy' },
  { id: 14, name: 'Cheese', category: 'Dairy' },
  { id: 15, name: 'Rice', category: 'Grains' },
];

interface GroceryItem {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked: boolean;
}

const GroceryList: React.FC = () => {
  const [items, setItems] = useState<GroceryItem[]>(mockGroceryItems);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<number>(0);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'

  const handleToggle = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDelete = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form
    setSelectedIngredient(0);
    setQuantity('');
    setUnit('');
  };

  const handleAddItem = () => {
    if (selectedIngredient && quantity && unit) {
      const ingredient = mockIngredients.find((i) => i.id === selectedIngredient);
      if (ingredient) {
        const newItem: GroceryItem = {
          id: Math.max(...items.map((i) => i.id)) + 1,
          name: ingredient.name,
          quantity,
          unit,
          category: ingredient.category,
          checked: false,
        };
        setItems([...items, newItem]);
        handleCloseDialog();
      }
    }
  };

  const handleClearCompleted = () => {
    setItems(items.filter((item) => !item.checked));
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'pending') return !item.checked;
    if (filter === 'completed') return item.checked;
    return true;
  });

  // Group items by category
  const groupedItems: Record<string, GroceryItem[]> = {};
  filteredItems.forEach((item) => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Grocery List
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ mr: 1 }}
          >
            Add Item
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => alert('Print functionality would be implemented here')}
          >
            Print
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Chip 
            label="All" 
            onClick={() => setFilter('all')} 
            color={filter === 'all' ? 'primary' : 'default'}
            sx={{ mr: 1 }}
          />
          <Chip 
            label="Pending" 
            onClick={() => setFilter('pending')} 
            color={filter === 'pending' ? 'primary' : 'default'}
            sx={{ mr: 1 }}
          />
          <Chip 
            label="Completed" 
            onClick={() => setFilter('completed')} 
            color={filter === 'completed' ? 'primary' : 'default'}
          />
        </Box>
        {items.some((item) => item.checked) && (
          <Button 
            variant="text" 
            color="error" 
            onClick={handleClearCompleted}
          >
            Clear Completed
          </Button>
        )}
      </Box>

      <Paper elevation={2} sx={{ mb: 3 }}>
        {Object.keys(groupedItems).length > 0 ? (
          Object.entries(groupedItems).map(([category, categoryItems]) => (
            <Box key={category}>
              <Typography 
                variant="h6" 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'primary.light', 
                  color: 'primary.contrastText' 
                }}
              >
                {category}
              </Typography>
              <List>
                {categoryItems.map((item) => (
                  <ListItem
                    key={item.id}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => handleDelete(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemButton onClick={() => handleToggle(item.id)} dense>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={item.checked}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.quantity} ${item.unit}`}
                        sx={{
                          textDecoration: item.checked ? 'line-through' : 'none',
                          color: item.checked ? 'text.disabled' : 'text.primary',
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
              </List>
            </Box>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Your grocery list is empty
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add items to your grocery list to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ mt: 2 }}
            >
              Add Item
            </Button>
          </Box>
        )}
      </Paper>

      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Grocery Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="ingredient-select-label">Ingredient</InputLabel>
                <Select
                  labelId="ingredient-select-label"
                  id="ingredient-select"
                  value={selectedIngredient}
                  label="Ingredient"
                  onChange={(e) => setSelectedIngredient(e.target.value as number)}
                >
                  <MenuItem value={0} disabled>Select an ingredient</MenuItem>
                  {mockIngredients.map((ingredient) => (
                    <MenuItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.category})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., g, ml, whole"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddItem}
            variant="contained"
            disabled={!selectedIngredient || !quantity || !unit}
          >
            Add to List
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroceryList; 