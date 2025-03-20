import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onDrawerToggle,
  activeView,
  onViewChange,
}) => {
  const location = useLocation();
  const theme = useTheme();
  
  const mainMenuItems = [
    { text: 'Calendar', icon: <CalendarMonthIcon />, path: '/', view: 'calendar' },
    { text: 'Recipes', icon: <MenuBookIcon />, path: '/recipes', view: 'recipes' },
    { text: 'Grocery List', icon: <ShoppingCartIcon />, path: '/groceries', view: 'groceries' },
  ];

  const secondaryMenuItems = [
    { text: 'Meal Ideas', icon: <RestaurantIcon />, path: '/meal-ideas', view: 'meal-ideas' },
    { text: 'Favorites', icon: <FavoriteIcon />, path: '/favorites', view: 'favorites' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', view: 'settings' },
  ];

  const drawer = (
    <div>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 1.5
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            letterSpacing: '-0.02em',
          }}
        >
          Meal Planner
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            pl: 1
          }}
        >
          Main Menu
        </Typography>
      </Box>
      <List>
        {mainMenuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isSelected}
                onClick={() => onViewChange(item.view)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'primary.main' : 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontWeight: 500,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            pl: 1
          }}
        >
          More Options
        </Typography>
      </Box>
      <List>
        {secondaryMenuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isSelected}
                onClick={() => onViewChange(item.view)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    minWidth: 40
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'primary.main' : 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 