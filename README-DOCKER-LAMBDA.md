# Docker Containers with AWS Lambda

This document explains how to use Docker containers with AWS Lambda for the Meal Planner application.

## Overview

The Meal Planner application uses Docker containers for both local development and AWS Lambda deployment. This approach provides several benefits:

1. **Consistent Environment**: The same container runs locally and in AWS, eliminating "works on my machine" issues
2. **Simplified Dependencies**: All dependencies are packaged in the container, including SQLite or DynamoDB local
3. **Easier Testing**: Test the exact deployment package locally before pushing to AWS
4. **Larger Package Size**: Container images can be up to 10GB vs. 250MB for zip packages
5. **Custom Runtimes**: Use any runtime or binary dependencies not natively supported by Lambda

## Local Development

### Prerequisites

- Docker and Docker Compose
- AWS CLI (for deployment)
- Terraform (for infrastructure deployment)

### Running Locally

To run the application locally using Docker Compose:

```bash
# Start the backend with DynamoDB Local
docker-compose up backend

# Or start the backend with SQLite
docker-compose up backend-sqlite

# Start the frontend
docker-compose up frontend

# Start everything
docker-compose up
```

### Development Modes

The backend container supports three modes:

1. **Lambda Mode**: Default mode for AWS Lambda deployment
2. **Local Mode**: Runs with DynamoDB Local for local development
3. **SQLite Mode**: Runs with SQLite for local development and testing

To switch between modes, set the command in docker-compose.yml:

```yaml
command: local    # For DynamoDB Local
command: sqlite   # For SQLite
command: main.handler  # For Lambda mode
```

## AWS Lambda Deployment

### Building and Deploying the Container

To build and deploy the container to AWS Lambda:

```bash
# Make the deployment script executable
chmod +x scripts/deploy_lambda.sh

# Deploy to AWS Lambda
./scripts/deploy_lambda.sh
```

This script will:

1. Build the Docker image using Dockerfile.prod
2. Push the image to Amazon ECR
3. Update the Lambda function to use the new image

### Terraform Deployment

To deploy the entire infrastructure using Terraform:

```bash
cd terraform

# Initialize Terraform
terraform init -backend-config="bucket=your-terraform-state-bucket" \
               -backend-config="key=meal-planner/terraform.tfstate" \
               -backend-config="region=us-east-1"

# Plan the deployment
terraform plan -var="environment=dev" -var="cors_origins=http://localhost:5173,http://your-frontend-url.com"

# Apply the deployment
terraform apply -var="environment=dev" -var="cors_origins=http://localhost:5173,http://your-frontend-url.com"
```

This will create:

1. DynamoDB table for the application
2. ECR repository for the container image
3. Lambda function using the container image
4. API Gateway to expose the Lambda function
5. IAM roles and policies for the Lambda function

## Container Structure

### Development Container (Dockerfile)

The development container includes:

- Python 3.9 runtime
- SQLite for database operations
- DynamoDB Local for local testing
- Development dependencies for testing

### Production Container (Dockerfile.prod)

The production container includes:

- Python 3.9 Lambda runtime
- Minimal dependencies for production
- Mangum for handling API Gateway requests

## Environment Variables

The following environment variables can be used to configure the application:

| Variable | Description | Default |
|----------|-------------|---------|
| DB_BACKEND | Database backend to use (dynamodb or sqlite) | dynamodb |
| SQLITE_DB_PATH | Path to SQLite database file | :memory: |
| DYNAMODB_TABLE | DynamoDB table name | meal-planner |
| AWS_REGION | AWS region for DynamoDB | us-east-1 |
| CORS_ORIGINS | Comma-separated list of allowed CORS origins | http://localhost:5173 |

## Testing with Containers

To run tests using the containers:

```bash
# Run backend tests with SQLite
docker-compose run backend-sqlite pytest

# Run backend tests with DynamoDB Local
docker-compose run backend pytest
```

## Troubleshooting

### Container Logs

To view container logs:

```bash
docker-compose logs backend
docker-compose logs backend-sqlite
docker-compose logs frontend
```

### Lambda Logs

To view Lambda logs in AWS:

```bash
aws logs filter-log-events --log-group-name /aws/lambda/meal-planner-api
```

### Common Issues

1. **Container Build Failures**: Check Docker build logs for missing dependencies
2. **Lambda Deployment Failures**: Ensure AWS credentials are configured correctly
3. **API Gateway Issues**: Check CORS configuration and Lambda permissions 