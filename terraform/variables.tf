variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "meal-planner"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "cors_origins" {
  description = "Comma-separated list of allowed CORS origins"
  type        = string
  default     = "http://localhost:5173,http://localhost:5174"
}

variable "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend assets"
  type        = string
  default     = "meal-planner-frontend"  # Must be globally unique, consider adding a suffix
}

variable "backend_zip_path" {
  description = "Path to the zipped backend code"
  type        = string
  default     = "../backend-lambda.zip"
}

variable "database_url" {
  description = "DynamoDB connection string or endpoint"
  type        = string
  default     = "dynamodb://meal-planner-prod"
  sensitive   = true  # Mark as sensitive to avoid showing in logs
} 