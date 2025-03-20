FROM public.ecr.aws/lambda/python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/var/task:${PYTHONPATH}"

# Install system dependencies
RUN yum install -y sqlite-devel gcc

# Copy requirements file
COPY requirements.txt requirements-dev.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy application code
COPY . ${LAMBDA_TASK_ROOT}

# Set up DynamoDB Local for local testing
RUN mkdir -p /opt/dynamodb
WORKDIR /opt/dynamodb
RUN curl -L https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz | tar xz
WORKDIR ${LAMBDA_TASK_ROOT}

# Create a script to start either the Lambda handler or a local server
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Command to run when container starts
ENTRYPOINT ["/entrypoint.sh"]

# Default to Lambda handler
CMD ["main.handler"] 