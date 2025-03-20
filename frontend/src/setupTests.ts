// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the import.meta.env
jest.mock('./services/api', () => {
  const originalModule = jest.requireActual('./services/api');
  return {
    ...originalModule,
    API_URL: 'http://localhost:8000/api',
  };
}); 