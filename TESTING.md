# Testing Guide for Meal Planner Application

This document provides information about the testing setup for the Meal Planner application, including how to run tests and what types of tests are included.

## Backend Tests

The backend tests use pytest with two different approaches for database testing:

1. **Moto for AWS service mocking**: This approach uses the moto library to mock DynamoDB.
2. **SQLite for database integration**: This approach uses SQLite as a lightweight alternative to DynamoDB for faster and more reliable tests.

### Running Backend Tests

```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

For coverage report:

```bash
pytest --cov=app --cov-report=term-missing
```

To run only the SQLite-based tests:

```bash
pytest tests/test_sqlite_integration.py
```

### Backend Test Structure

- `tests/conftest.py`: Contains pytest fixtures for setting up test data and mocking AWS services.
- `tests/test_dynamodb.py`: Unit tests for DynamoDB functions.
- `tests/test_recipes.py`: Tests for recipe API endpoints.
- `tests/test_main.py`: Tests for the main FastAPI application.
- `tests/test_integration.py`: Integration tests for the backend API.
- `tests/test_sqlite_integration.py`: Tests that demonstrate using SQLite for DynamoDB integration testing.

### SQLite vs. Moto for DynamoDB Testing

We've implemented two approaches for testing the database layer:

#### Moto Approach
- Uses the moto library to mock AWS services
- Tests the actual boto3 client code
- Closely mimics the behavior of DynamoDB
- Useful for testing DynamoDB-specific features

#### SQLite Approach
- Uses SQLite as a lightweight alternative to DynamoDB
- Significantly faster test execution (typically 5-10x faster)
- More reliable and consistent test results
- Easier to debug with standard SQL tools
- Supports transactions for better test isolation
- No need for AWS credentials or configuration

The SQLite approach uses a database adapter that provides a unified interface for both DynamoDB and SQLite, allowing us to switch between the two backends during testing.

## Frontend Tests

The frontend tests use Jest with React Testing Library. The tests cover unit tests for API services and component tests.

### Running Frontend Tests

```bash
cd frontend
npm install
npm test
```

For coverage report:

```bash
npm test -- --coverage
```

### Frontend Test Structure

- `src/services/__tests__/api.test.ts`: Tests for the API service.
- `src/components/__tests__/Calendar.test.tsx`: Tests for the Calendar component.

## Terraform Tests

The Terraform tests validate the infrastructure configuration.

### Running Terraform Tests

```bash
cd terraform
pip install pytest
pytest test_terraform.py
```

### Terraform Test Structure

- `terraform/test_terraform.py`: Tests for validating the Terraform configuration.

## Continuous Integration

GitHub Actions workflows are set up to run tests automatically on push and pull requests:

- `.github/workflows/test.yml`: Runs backend, frontend, and Terraform tests.
- `.github/workflows/deploy.yml`: Deploys the application after tests pass.

## Test Coverage

We aim for high test coverage to ensure the application is reliable. Coverage reports are generated during test runs and can be viewed in the GitHub Actions workflow outputs.

## Adding New Tests

When adding new features, please also add corresponding tests:

1. For backend features, add tests in the `backend/tests` directory.
2. For frontend features, add tests in the `frontend/src/components/__tests__` or `frontend/src/services/__tests__` directories.
3. For infrastructure changes, update the Terraform tests as needed.

### Adding SQLite Tests

When adding new database functionality, consider adding tests using both the moto and SQLite approaches:

1. Use the `client` fixture for moto-based tests.
2. Use the `sqlite_client` fixture for SQLite-based tests.
3. For performance-critical tests, prefer the SQLite approach.

## Manual Testing

In addition to automated tests, manual testing should be performed before deployment:

1. Test the application locally by running both the backend and frontend.
2. Verify that all features work as expected.
3. Test the deployment process in a staging environment if possible. 