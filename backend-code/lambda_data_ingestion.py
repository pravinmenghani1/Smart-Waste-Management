import json
import boto3
from datetime import datetime
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SensorData')

def lambda_handler(event, context):
    """
    Process IoT sensor data and store in DynamoDB
    No mock data - only real sensor readings
    """
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Parse the IoT message
        device_id = event.get('deviceId')
        sensor_type = event.get('sensorType')
        value = event.get('value')
        unit = event.get('unit', '')
        location = event.get('location', '')
        
        if not all([device_id, sensor_type, value is not None]):
            logger.error(f"Missing required fields: {event}")
            return {
                'statusCode': 400,
                'body': json.dumps('Missing required fields')
            }
        
        # Create timestamp
        timestamp = datetime.utcnow().isoformat() + 'Z'
        
        # Store in DynamoDB - Convert all numeric values to Decimal for DynamoDB
        from decimal import Decimal
        
        # Handle different numeric types
        if isinstance(value, (int, float)):
            decimal_value = Decimal(str(value))
        else:
            # Try to convert string numbers to Decimal
            try:
                decimal_value = Decimal(str(value))
            except:
                # If conversion fails, store as string
                decimal_value = str(value)
        
        item = {
            'deviceId': device_id,
            'timestamp': timestamp,
            'sensorType': sensor_type,
            'value': decimal_value,  # Use the properly converted value
            'unit': unit,
            'location': location
        }
        
        # Add wasteType if present (for weight sensor)
        if 'wasteType' in event:
            item['wasteType'] = event['wasteType']
        if 'measurementSequence' in event:
            item['measurementSequence'] = event['measurementSequence']
        
        table.put_item(Item=item)
        
        logger.info(f"Stored sensor data: {item}")
        
        # Check for alerts
        alerts = check_alerts(sensor_type, float(value), device_id)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Data stored successfully',
                'alerts': alerts
            })
        }
        
    except Exception as e:
        logger.error(f"Error processing sensor data: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }

def check_alerts(sensor_type, value, device_id):
    """Check for alert conditions based on sensor readings"""
    alerts = []
    
    if sensor_type == 'fire' and value > 0:
        alerts.append({
            'type': 'FIRE_DETECTED',
            'message': f'Fire detected by {device_id}',
            'severity': 'CRITICAL'
        })
    
    elif sensor_type == 'gas' and value > 1000:  # ppm threshold
        alerts.append({
            'type': 'GAS_LEAK',
            'message': f'High gas levels detected: {value} ppm',
            'severity': 'HIGH'
        })
    
    elif sensor_type == 'fill' and value > 90:  # percentage threshold
        alerts.append({
            'type': 'BIN_FULL',
            'message': f'Bin nearly full: {value}%',
            'severity': 'MEDIUM'
        })
    
    elif sensor_type == 'weight' and value > 2.8:  # kg threshold
        alerts.append({
            'type': 'WEIGHT_LIMIT',
            'message': f'Weight limit approaching: {value} kg',
            'severity': 'MEDIUM'
        })
    
    return alerts
