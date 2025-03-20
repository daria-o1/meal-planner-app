from mangum import Mangum
from main import app

# Create a handler for AWS Lambda
handler = Mangum(app, lifespan="off")

# This is the entry point for AWS Lambda
# The handler will convert API Gateway events to ASGI requests
# and then pass them to the FastAPI application 