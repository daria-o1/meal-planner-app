import React from 'react';
import { styled } from '@mui/material/styles';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

const ToggleButton = styled(IconButton)(({ theme }) => ({
  position: 'relative',
  width: 40,
  height: 40,
  borderRadius: '50%',
  transition: 'all 0.3s ease',
  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main,
}));

const ThemeToggle: React.FC<ThemeToggleProps> = ({ darkMode, onToggle }) => {
  const theme = useTheme();
  
  return (
    <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      <ToggleButton
        onClick={onToggle}
        aria-label="toggle dark mode"
        color="inherit"
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.08)',
          }
        }}
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: darkMode ? 180 : 0,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut"
          }}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          {darkMode ? (
            <LightModeIcon fontSize="small" />
          ) : (
            <DarkModeIcon fontSize="small" />
          )}
        </motion.div>
      </ToggleButton>
    </Tooltip>
  );
};

export default ThemeToggle; 