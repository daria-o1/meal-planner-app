import os
import json
import subprocess
import pytest

@pytest.fixture(scope="module")
def terraform_init():
    """Initialize Terraform for testing."""
    # Check if Terraform is installed
    try:
        subprocess.run(["terraform", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        pytest.skip("Terraform not installed, skipping tests")
    
    # Initialize Terraform
    result = subprocess.run(
        ["terraform", "init", "-backend=false"],
        check=True,
        capture_output=True,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    return result.returncode == 0

def test_terraform_validate(terraform_init):
    """Test that the Terraform configuration is valid."""
    if not terraform_init:
        pytest.skip("Terraform initialization failed")
    
    result = subprocess.run(
        ["terraform", "validate", "-json"],
        check=False,
        capture_output=True,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    output = json.loads(result.stdout)
    assert output["valid"], f"Terraform validation failed: {output.get('error_count', 0)} errors"

def test_terraform_plan(terraform_init):
    """Test that the Terraform plan can be generated without errors."""
    if not terraform_init:
        pytest.skip("Terraform initialization failed")
    
    # Create a temporary tfvars file for testing
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "test.tfvars"), "w") as f:
        f.write("""
aws_region = "us-east-1"
environment = "test"
frontend_bucket_name = "meal-planner-frontend-test"
backend_zip_path = "../backend-lambda.zip"
database_url = "dynamodb://meal-planner-test"
""")
    
    try:
        # Run terraform plan
        result = subprocess.run(
            ["terraform", "plan", "-var-file=test.tfvars", "-detailed-exitcode"],
            check=False,
            capture_output=True,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        # Exit code 0 means no changes, 2 means changes, anything else is an error
        assert result.returncode in [0, 2], f"Terraform plan failed with exit code {result.returncode}"
    finally:
        # Clean up the temporary tfvars file
        try:
            os.remove(os.path.join(os.path.dirname(os.path.abspath(__file__)), "test.tfvars"))
        except:
            pass

def test_required_variables():
    """Test that all required variables are defined."""
    # Read the variables.tf file
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "variables.tf"), "r") as f:
        variables_content = f.read()
    
    # Check for required variables
    required_variables = [
        "aws_region",
        "environment",
        "frontend_bucket_name",
        "backend_zip_path",
        "database_url"
    ]
    
    for var in required_variables:
        assert f'variable "{var}"' in variables_content, f"Required variable '{var}' not defined"

def test_outputs():
    """Test that all required outputs are defined."""
    # Read the main.tf file
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "main.tf"), "r") as f:
        main_content = f.read()
    
    # Check for required outputs
    required_outputs = [
        "frontend_website_endpoint",
        "api_endpoint"
    ]
    
    for output in required_outputs:
        assert f'output "{output}"' in main_content, f"Required output '{output}' not defined" 