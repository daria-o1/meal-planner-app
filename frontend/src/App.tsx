import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Calendar from './components/Calendar';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import GroceryList from './components/GroceryList';
// Placeholder components for new routes
const MealIdeas = () => <Box sx={{ p: 2 }}><Typography variant="h4">Meal Ideas</Typography><Typography variant="body1">Coming soon...</Typography></Box>;
const Favorites = () => <Box sx={{ p: 2 }}><Typography variant="h4">Favorites</Typography><Typography variant="body1">Coming soon...</Typography></Box>;
const Settings = () => <Box sx={{ p: 2 }}><Typography variant="h4">Settings</Typography><Typography variant="body1">Coming soon...</Typography></Box>;

// Animated page wrapper
const AnimatedPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// Routes with animations
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <AnimatedPage>
            <Calendar />
          </AnimatedPage>
        } />
        <Route path="/recipes" element={
          <AnimatedPage>
            <RecipeList />
          </AnimatedPage>
        } />
        <Route path="/recipes/:id" element={
          <AnimatedPage>
            <RecipeDetail />
          </AnimatedPage>
        } />
        <Route path="/groceries" element={
          <AnimatedPage>
            <GroceryList />
          </AnimatedPage>
        } />
        <Route path="/meal-ideas" element={
          <AnimatedPage>
            <MealIdeas />
          </AnimatedPage>
        } />
        <Route path="/favorites" element={
          <AnimatedPage>
            <Favorites />
          </AnimatedPage>
        } />
        <Route path="/settings" element={
          <AnimatedPage>
            <Settings />
          </AnimatedPage>
        } />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState('calendar');
  const [darkMode, setDarkMode] = useState(false);

  // Create a theme instance based on the dark mode preference
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: darkMode ? '#81C784' : '#2E7D32', // Lighter green in dark mode
            light: darkMode ? '#A5D6A7' : '#4CAF50',
            dark: darkMode ? '#66BB6A' : '#1B5E20',
          },
          secondary: {
            main: darkMode ? '#FFB74D' : '#F57C00', // Lighter orange in dark mode
            light: darkMode ? '#FFCC80' : '#FFB74D',
            dark: darkMode ? '#FFA726' : '#E65100',
          },
          background: {
            default: darkMode ? '#121212' : '#F9F9F9',
            paper: darkMode ? '#1E1E1E' : '#FFFFFF',
          },
          text: {
            primary: darkMode ? '#FFFFFF' : '#263238',
            secondary: darkMode ? '#B0BEC5' : '#546E7A',
          },
          error: {
            main: darkMode ? '#EF5350' : '#D32F2F',
          },
          success: {
            main: darkMode ? '#66BB6A' : '#388E3C',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontSize: '2.2rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h2: {
            fontSize: '1.8rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h4: {
            fontSize: '1.3rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h5: {
            fontSize: '1.1rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h6: {
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: darkMode 
                    ? '0px 2px 4px rgba(0, 0, 0, 0.3)' 
                    : '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              },
              contained: {
                padding: '8px 16px',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: darkMode 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.2)' 
                  : '0px 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: darkMode 
                    ? '0px 4px 12px rgba(0, 0, 0, 0.3)' 
                    : '0px 4px 12px rgba(0, 0, 0, 0.08)',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: darkMode 
                  ? '0px 2px 8px rgba(0, 0, 0, 0.2)' 
                  : '0px 2px 8px rgba(0, 0, 0, 0.05)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [darkMode]
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    // Save preference to localStorage
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Load dark mode preference from localStorage on initial render
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Header 
            onDrawerToggle={handleDrawerToggle} 
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
          <Sidebar 
            mobileOpen={mobileOpen} 
            onDrawerToggle={handleDrawerToggle} 
            activeView={activeView}
            onViewChange={handleViewChange}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - 240px)` },
              mt: 8,
              overflow: 'auto',
              backgroundColor: 'background.default',
            }}
          >
            <AnimatedRoutes />
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
