const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { router: authRouter, verifyToken } = require('./auth');

const app = express();
const port = process.env.PORT || 8080;

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://YOUR_EC2_PUBLIC_IP:3000', 'http://YOUR_EC2_PUBLIC_IP:3000'],
  credentials: true
}));
app.use(express.json());

// Auth routes
app.use('/api/auth', authRouter);

// Configure AWS DynamoDB
const client = new DynamoDBClient({
  region: 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

// Get latest sensor readings
app.get('/api/sensors/latest', async (req, res) => {
  try {
    // Query both devices to get latest data
    const wasteCommand = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': 'waste-sensor-001'
      },
      ScanIndexForward: false,
      Limit: 20
    });

    const weightCommand = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': 'weight-sensor-001'
      },
      ScanIndexForward: false,
      Limit: 20
    });

    const [wasteResponse, weightResponse] = await Promise.all([
      docClient.send(wasteCommand),
      docClient.send(weightCommand)
    ]);

    const readings = [
      ...(wasteResponse.Items || []),
      ...(weightResponse.Items || [])
    ];

    // Process readings into dashboard format
    const dashboardData = processDashboardData(readings);
    
    res.json({
      success: true,
      data: dashboardData,
      rawReadings: readings.slice(0, 10) // Include some raw data for debugging
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get historical data
app.get('/api/sensors/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const command = new ScanCommand({
      TableName: 'SensorData',
      FilterExpression: '#timestamp > :cutoffTime',
      ExpressionAttributeNames: {
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':cutoffTime': cutoffTime
      }
    });

    const response = await docClient.send(command);
    const readings = response.Items || [];

    // Group by time intervals
    const grouped = groupReadingsByTime(readings);
    
    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get readings for specific device
app.get('/api/sensors/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const command = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId
      },
      ScanIndexForward: false,
      Limit: limit
    });

    const response = await docClient.send(command);
    
    res.json({
      success: true,
      data: response.Items || []
    });
  } catch (error) {
    console.error(`Error fetching data for device ${req.params.deviceId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Waste Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Process readings into dashboard format
function processDashboardData(readings) {
  const latest = {
    fillLevel: 0,
    gasLevel: 0,
    fireDetected: false,
    wetWaste: 0,
    dryWaste: 0,
    metalWaste: 0,
    lastUpdated: new Date().toISOString()
  };

  // Get latest reading for each sensor type
  const latestReadings = new Map();
  
  readings.forEach(reading => {
    const key = `${reading.deviceId}-${reading.sensorType}${reading.wasteType ? `-${reading.wasteType}` : ''}`;
    if (!latestReadings.has(key) || reading.timestamp > latestReadings.get(key).timestamp) {
      latestReadings.set(key, reading);
    }
  });

  // Process each reading type
  latestReadings.forEach(reading => {
    switch (reading.sensorType) {
      case 'fill':
        latest.fillLevel = reading.value;
        break;
      case 'gas':
        latest.gasLevel = reading.value;
        break;
      case 'fire':
        latest.fireDetected = reading.value > 0;
        break;
      case 'weight':
        if (reading.wasteType === 'wet') latest.wetWaste = reading.value;
        else if (reading.wasteType === 'dry') latest.dryWaste = reading.value;
        else if (reading.wasteType === 'metal') latest.metalWaste = reading.value;
        break;
    }
  });

  return latest;
}

// Group readings by time intervals
function groupReadingsByTime(readings) {
  const grouped = new Map();
  
  readings.forEach(reading => {
    const timeKey = new Date(reading.timestamp).toISOString().slice(0, 16); // Group by hour:minute
    
    if (!grouped.has(timeKey)) {
      grouped.set(timeKey, {
        time: new Date(reading.timestamp).toLocaleTimeString(),
        fillLevel: 0,
        gasLevel: 0,
        totalWaste: 0
      });
    }

    const group = grouped.get(timeKey);
    
    if (reading.sensorType === 'fill') group.fillLevel = reading.value;
    if (reading.sensorType === 'gas') group.gasLevel = reading.value;
    if (reading.sensorType === 'weight') group.totalWaste += reading.value;
  });

  return Array.from(grouped.values()).slice(-20); // Last 20 data points
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Smart Waste Management API running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`External access: http://YOUR_EC2_PUBLIC_IP:${port}/api/health`);
});
