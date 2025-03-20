#!/bin/bash
set -e

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
ECR_REPOSITORY=${ECR_REPOSITORY:-"meal-planner-api"}
LAMBDA_FUNCTION=${LAMBDA_FUNCTION:-"meal-planner-api"}
ENVIRONMENT=${ENVIRONMENT:-"dev"}

# Build the Docker image
echo "Building Docker image for Lambda..."
cd backend
docker build -t ${ECR_REPOSITORY}:${ENVIRONMENT} -f Dockerfile.prod .
cd ..

# Get the AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Login to ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Create the ECR repository if it doesn't exist
echo "Creating ECR repository if it doesn't exist..."
aws ecr describe-repositories --repository-names ${ECR_REPOSITORY} --region ${AWS_REGION} || \
    aws ecr create-repository --repository-name ${ECR_REPOSITORY} --region ${AWS_REGION}

# Tag and push the image
echo "Tagging and pushing image to ECR..."
docker tag ${ECR_REPOSITORY}:${ENVIRONMENT} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${ENVIRONMENT}
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${ENVIRONMENT}

# Update the Lambda function
echo "Updating Lambda function..."
aws lambda update-function-code \
    --function-name ${LAMBDA_FUNCTION} \
    --image-uri ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${ENVIRONMENT} \
    --region ${AWS_REGION}

echo "Deployment completed successfully!" 