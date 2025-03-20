import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  InputBase, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Badge,
  alpha,
  styled,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ThemeToggle from './ThemeToggle';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface HeaderProps {
  onDrawerToggle: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onDrawerToggle, 
  darkMode = false, 
  onToggleDarkMode = () => {} 
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Searching for:', searchQuery);
    // Implement search functionality here
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 10px rgba(0, 0, 0, 0.3)'
          : '0 2px 10px rgba(0, 0, 0, 0.05)',
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.background.paper
          : theme.palette.primary.main,
        transition: 'all 0.3s ease',
      }}
      color={theme.palette.mode === 'dark' ? 'default' : 'primary'}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <RestaurantMenuIcon sx={{ display: { xs: 'none', sm: 'block' }, mr: 1 }} />
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            display: { xs: 'none', sm: 'block' },
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          Meal Planner
        </Typography>

        <form onSubmit={handleSearchSubmit}>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search recipes..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Search>
        </form>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
          
          <Tooltip title="Notifications">
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Account settings">
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>U</Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>My account</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 