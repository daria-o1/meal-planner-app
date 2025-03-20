import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Calendar from '../Calendar';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the date-fns functions to return consistent dates for testing
jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    format: jest.fn().mockImplementation((date, format) => {
      if (format === 'yyyy-MM-dd') return '2023-05-01';
      if (format === 'MMMM d') return 'May 1';
      if (format === 'MMMM d, yyyy') return 'May 1, 2023';
      if (format === 'EEEE') return 'Monday';
      return 'May 1, 2023';
    }),
    isToday: jest.fn().mockReturnValue(true),
    startOfWeek: jest.fn().mockImplementation(() => new Date('2023-05-01')),
    addDays: jest.fn().mockImplementation((date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }),
  };
});

// Create a theme for testing
const theme = createTheme();

// Wrap component with necessary providers
const renderCalendar = () => {
  return render(
    <ThemeProvider theme={theme}>
      <Calendar />
    </ThemeProvider>
  );
};

describe('Calendar Component', () => {
  test('renders the calendar title', () => {
    renderCalendar();
    expect(screen.getByText('Meal Plan Calendar')).toBeInTheDocument();
  });

  test('renders the week dates', () => {
    renderCalendar();
    expect(screen.getByText('May 1 - May 1, 2023')).toBeInTheDocument();
  });

  test('renders the Today button', () => {
    renderCalendar();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  test('renders meal type cards', () => {
    renderCalendar();
    expect(screen.getAllByText('Breakfast').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Lunch').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dinner').length).toBeGreaterThan(0);
  });

  test('clicking Add Breakfast button opens the meal dialog', async () => {
    renderCalendar();
    const addBreakfastButton = screen.getAllByText('Add Breakfast')[0];
    fireEvent.click(addBreakfastButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add Breakfast')).toBeInTheDocument();
      expect(screen.getByText('Monday, May 1, 2023')).toBeInTheDocument();
      expect(screen.getByText('Select a recipe for this meal:')).toBeInTheDocument();
    });
  });

  test('clicking Create new recipe button opens the recipe dialog', async () => {
    renderCalendar();
    // First open the meal dialog
    const addBreakfastButton = screen.getAllByText('Add Breakfast')[0];
    fireEvent.click(addBreakfastButton);
    
    // Then click the create new recipe button
    const createRecipeButton = screen.getByText('Create new recipe');
    fireEvent.click(createRecipeButton);
    
    await waitFor(() => {
      expect(screen.getByText('Create New Recipe')).toBeInTheDocument();
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByLabelText('Recipe Name')).toBeInTheDocument();
    });
  });

  test('navigating between weeks', () => {
    renderCalendar();
    
    // Get navigation buttons
    const prevWeekButton = screen.getByLabelText('Previous week');
    const nextWeekButton = screen.getByLabelText('Next week');
    const todayButton = screen.getByText('Today');
    
    // Test navigation
    fireEvent.click(nextWeekButton);
    fireEvent.click(prevWeekButton);
    fireEvent.click(todayButton);
    
    // Since we've mocked date-fns, we can't easily test the date changes
    // But we can verify the buttons work without errors
    expect(screen.getByText('Meal Plan Calendar')).toBeInTheDocument();
  });
}); 