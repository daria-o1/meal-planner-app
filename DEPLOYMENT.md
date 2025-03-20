# Meal Planner App Deployment Guide

This guide explains how to deploy the Meal Planner application to AWS using Terraform and GitHub Actions.

## Architecture

The application is deployed using a serverless architecture to minimize costs:

- **Frontend**: Static files hosted in an S3 bucket configured for website hosting
- **Backend**: Python FastAPI application running on AWS Lambda
- **API Gateway**: HTTP API to route requests to the Lambda function
- **Database**: DynamoDB with on-demand capacity for cost optimization

This architecture is ideal for applications with low traffic (1-2 users per day) as you only pay for what you use.

## Prerequisites

1. AWS Account
2. GitHub repository with the application code
3. Terraform installed locally (for manual deployment)

## Deployment Options

### Option 1: Automated Deployment with GitHub Actions

1. **Set up GitHub Secrets**

   Add the following secrets to your GitHub repository:

   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_REGION`: The AWS region to deploy to (e.g., `us-east-1`)
   - `FRONTEND_BUCKET_NAME`: A globally unique name for your S3 bucket (e.g., `meal-planner-frontend-yourusername`)

2. **Push to Main Branch**

   The GitHub Actions workflow will automatically deploy the application when you push to the main branch.

3. **Check Deployment Status**

   Go to the "Actions" tab in your GitHub repository to monitor the deployment progress.

### Option 2: Manual Deployment

1. **Prepare the Backend**

   ```bash
   cd backend
   chmod +x prepare_deployment.sh
   ./prepare_deployment.sh
   ```

2. **Prepare the Frontend**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Deploy with Terraform**

   ```bash
   cd terraform
   terraform init
   terraform apply
   ```

4. **Update Frontend API URL**

   After deployment, update the `.env.production` file with the actual API URL:

   ```
   VITE_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api
   ```

5. **Deploy Frontend to S3**

   ```bash
   aws s3 sync frontend/dist/ s3://your-bucket-name --delete
   ```

## Estimated Costs

With 1-2 users per day, the monthly cost should be minimal:

- **S3**: ~$0.03/month for storage + minimal data transfer costs
- **Lambda**: Free tier includes 1M requests/month and 400,000 GB-seconds of compute time
- **API Gateway**: $1.00/million API calls (first 1M calls/month are free)
- **DynamoDB**: On-demand capacity with minimal usage should be under $1/month

Total estimated cost: **Less than $2/month** with typical usage patterns.

## Monitoring and Maintenance

- Check AWS CloudWatch for logs and metrics
- Set up AWS Budgets to alert you if costs exceed expectations
- Periodically check for security updates to dependencies

## Scaling Considerations

This deployment is optimized for minimal cost with low traffic. If your user base grows:

1. Consider adding CloudFront for better content delivery
2. Implement caching strategies
3. Monitor DynamoDB performance and adjust if needed

## Troubleshooting

- **Frontend not loading**: Check S3 bucket configuration and permissions
- **API errors**: Check Lambda logs in CloudWatch
- **Database issues**: Verify DynamoDB table structure and access permissions 