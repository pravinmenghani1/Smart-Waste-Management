# Backend Code

## Location
- **S3:** s3://iotimplementation/final/backend-code/
- **Local:** /home/ubuntu/arch/backend-code/

## Contents

### Main Files
1. **api-server.js** (6.3 KB)
   - Express.js REST API server
   - DynamoDB integration
   - CORS configuration
   - Endpoints for sensor data

2. **auth.js** (3.9 KB)
   - JWT authentication module
   - User authentication logic

3. **lambda_data_ingestion.py** (3.7 KB)
   - Lambda function for IoT data processing
   - DynamoDB storage
   - Alert checking logic

### Lambda Deployment Packages
- lambda_data_ingestion.zip
- lambda_data_ingestion_final.zip
- lambda_data_ingestion_fixed.zip
- lambda_data_ingestion_debug.zip

### Configuration
- **package.json** - Node.js dependencies
- **package-lock.json** - Dependency lock file

## API Endpoints

### GET /api/health
Health check endpoint

### GET /api/sensors/latest
Get latest sensor readings from all devices

### GET /api/sensors/history?hours=24
Get historical sensor data

### GET /api/sensors/device/:deviceId?limit=20
Get readings for specific device

### POST /api/auth/*
Authentication endpoints

## Running the Backend

```bash
cd /home/ubuntu/waste-management-system/backend
npm install
node api-server.js
```

Server runs on port 8080

## Dependencies
- express
- cors
- @aws-sdk/client-dynamodb
- @aws-sdk/lib-dynamodb
- jsonwebtoken (for auth)

## Environment
- AWS Region: us-east-1
- DynamoDB Table: SensorData
- Port: 8080
- CORS: Enabled for frontend origins
