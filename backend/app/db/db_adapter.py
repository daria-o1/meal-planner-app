import os
import json
import boto3
import sqlite3
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from uuid import uuid4

class DatabaseAdapter:
    """
    Adapter class that provides a unified interface for both DynamoDB and SQLite.
    This allows for easy switching between the two for testing purposes.
    """
    
    def __init__(self):
        """Initialize the database adapter based on environment variables."""
        self.backend = os.environ.get("DB_BACKEND", "dynamodb")
        
        if self.backend == "dynamodb":
            # Initialize DynamoDB
            self.dynamodb = boto3.resource("dynamodb")
            self.table_name = os.environ.get("DYNAMODB_TABLE", "meal-planner")
            self.table = self.dynamodb.Table(self.table_name)
        elif self.backend == "sqlite":
            # Initialize SQLite
            db_path = os.environ.get("SQLITE_DB_PATH", ":memory:")
            self.conn = sqlite3.connect(db_path)
            self.conn.row_factory = sqlite3.Row
    
    def generate_id(self) -> str:
        """Generate a unique ID for database items."""
        return str(uuid4())
    
    def format_date(self, date: Union[str, datetime]) -> str:
        """Format a date as a string in YYYY-MM-DD format."""
        if isinstance(date, datetime):
            return date.strftime("%Y-%m-%d")
        return date
    
    def put_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Put an item into the database.
        
        Args:
            item: Dictionary containing the item data
            
        Returns:
            The item that was put into the database
        """
        if self.backend == "dynamodb":
            self.table.put_item(Item=item)
            return item
        elif self.backend == "sqlite":
            # Extract primary key fields
            pk = item["PK"]
            sk = item["SK"]
            
            # Extract GSI fields if they exist
            gsi1pk = item.get("GSI1PK", None)
            gsi1sk = item.get("GSI1SK", None)
            
            # Store the rest as JSON in the data column
            data_fields = {k: v for k, v in item.items() 
                          if k not in ["PK", "SK", "GSI1PK", "GSI1SK"]}
            data_json = json.dumps(data_fields)
            
            cursor = self.conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO items (PK, SK, GSI1PK, GSI1SK, data)
                VALUES (?, ?, ?, ?, ?)
                """,
                (pk, sk, gsi1pk, gsi1sk, data_json)
            )
            self.conn.commit()
            return item
    
    def get_item(self, pk: str, sk: str) -> Optional[Dict[str, Any]]:
        """
        Get an item from the database by primary key.
        
        Args:
            pk: Partition key
            sk: Sort key
            
        Returns:
            The item if found, None otherwise
        """
        if self.backend == "dynamodb":
            response = self.table.get_item(
                Key={
                    "PK": pk,
                    "SK": sk
                }
            )
            return response.get("Item")
        elif self.backend == "sqlite":
            cursor = self.conn.cursor()
            cursor.execute(
                "SELECT * FROM items WHERE PK = ? AND SK = ?",
                (pk, sk)
            )
            row = cursor.fetchone()
            
            if not row:
                return None
                
            # Reconstruct the item
            item = {
                "PK": row["PK"],
                "SK": row["SK"]
            }
            
            if row["GSI1PK"]:
                item["GSI1PK"] = row["GSI1PK"]
            
            if row["GSI1SK"]:
                item["GSI1SK"] = row["GSI1SK"]
            
            # Add the data fields
            if row["data"]:
                data_fields = json.loads(row["data"])
                item.update(data_fields)
                
            return item
    
    def query(self, key_condition: Dict[str, Any], index_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Query items from the database.
        
        Args:
            key_condition: Key condition expression
            index_name: Optional index name to query
            
        Returns:
            List of items matching the query
        """
        if self.backend == "dynamodb":
            params = {
                "KeyConditionExpression": key_condition["expression"],
                "ExpressionAttributeValues": key_condition["values"]
            }
            
            if index_name:
                params["IndexName"] = index_name
                
            response = self.table.query(**params)
            return response.get("Items", [])
        elif self.backend == "sqlite":
            cursor = self.conn.cursor()
            
            # Parse the key condition
            if "PK = :pk" in key_condition["expression"]:
                pk_value = key_condition["values"][":pk"]
                
                if index_name == "GSI1":
                    # Query using GSI1
                    cursor.execute(
                        "SELECT * FROM items WHERE GSI1PK = ?",
                        (pk_value,)
                    )
                else:
                    # Query using primary key
                    cursor.execute(
                        "SELECT * FROM items WHERE PK = ?",
                        (pk_value,)
                    )
            else:
                # More complex queries would need to be implemented here
                raise NotImplementedError("Complex queries not implemented for SQLite")
                
            rows = cursor.fetchall()
            items = []
            
            for row in rows:
                # Reconstruct the item
                item = {
                    "PK": row["PK"],
                    "SK": row["SK"]
                }
                
                if row["GSI1PK"]:
                    item["GSI1PK"] = row["GSI1PK"]
                
                if row["GSI1SK"]:
                    item["GSI1SK"] = row["GSI1SK"]
                
                # Add the data fields
                if row["data"]:
                    data_fields = json.loads(row["data"])
                    item.update(data_fields)
                    
                items.append(item)
                
            return items
    
    def delete_item(self, pk: str, sk: str) -> Dict[str, str]:
        """
        Delete an item from the database.
        
        Args:
            pk: Partition key
            sk: Sort key
            
        Returns:
            Dictionary with success message
        """
        if self.backend == "dynamodb":
            self.table.delete_item(
                Key={
                    "PK": pk,
                    "SK": sk
                }
            )
        elif self.backend == "sqlite":
            cursor = self.conn.cursor()
            cursor.execute(
                "DELETE FROM items WHERE PK = ? AND SK = ?",
                (pk, sk)
            )
            self.conn.commit()
            
        return {"message": "Item deleted successfully"}

# Create a singleton instance
db = DatabaseAdapter() 