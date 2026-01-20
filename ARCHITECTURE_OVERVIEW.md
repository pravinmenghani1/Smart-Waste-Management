# Smart Waste Management System - Architecture Overview

## System Summary
A complete IoT-based waste management solution using ESP32 sensors, AWS IoT Core, serverless processing, and a real-time React dashboard.

**Deployment Date:** January 2026  
**AWS Region:** us-east-1  
**Public Dashboard:** http://98.82.140.84:3000/

---

## Architecture Components

### 1. IoT Sensors (ESP32)

#### Waste Sensor (waste-sensor-001)
- **Hardware:** ESP32 with ultrasonic, MQ2 gas, and flame sensors
- **Location:** bin-001
- **Measurements:**
  - Fill Level: 0-100% (ultrasonic distance sensor)
  - Gas Level: PPM (MQ2 digital sensor)
  - Fire Detection: Boolean (flame sensor)
- **Communication:** MQTT over TLS (port 8883)
- **MQTT Topic:** `sensors/waste-sensor-001/data`
- **Publish Interval:** Every 5 seconds
- **Integration:** Blynk IoT platform for mobile alerts

#### Weight Sensor (weight-sensor-001)
- **Hardware:** ESP32 with HX711 load cell
- **Location:** bin-001
- **Measurements:**
  - Wet Waste: kg
  - Dry Waste: kg
  - Metal Waste: kg
- **Communication:** MQTT over TLS (port 8883)
- **MQTT Topic:** `sensors/weight-sensor-001/data`
- **Publish Interval:** Every 5 seconds (3 measurements per cycle)

#### Authentication
- X.509 certificates for device authentication
- AWS IoT Core device certificates and private keys
- Certificate files stored in `/home/ubuntu/waste-management-system/iot/`

---

### 2. AWS IoT Core

#### IoT Things
- `waste-sensor-001` (Type: WasteSensor)
- `weight-sensor-001` (Type: WeightSensor)
- `ESP32LoadCellSensor`
- `sensor1`

#### IoT Rules
1. **SensorDataProcessingRule**
   - Topic Pattern: `sensors/+/data`
   - SQL: `SELECT * FROM 'sensors/+/data'`
   - Action: Invoke Lambda function `WasteManagementDataIngestion`
   - Status: Active

2. **SmartWasteBinRule**
   - Topic Pattern: `home/bin/+`
   - Created: 2026-01-01
   - Status: Active

3. **SmartWasteLoadCellRule**
   - Topic Pattern: `sensors/loadcell/weight`
   - Created: 2026-01-01
   - Status: Active

#### Security
- TLS 1.2 encryption
- Certificate-based authentication
- IoT policies for device permissions

---

### 3. AWS Lambda Functions

#### WasteManagementDataIngestion
- **Runtime:** Python 3.11
- **Handler:** lambda_data_ingestion.lambda_handler
- **Memory:** 128 MB
- **Timeout:** 30 seconds
- **Role:** WasteManagementLambdaRole
- **Trigger:** IoT Core Rule (SensorDataProcessingRule)

**Functionality:**
- Receives sensor data from IoT Core
- Validates required fields (deviceId, sensorType, value)
- Converts numeric values to DynamoDB Decimal format
- Stores data in DynamoDB SensorData table
- Implements alert logic:
  - Fire detection (value > 0)
  - Gas leak (value > 1000 ppm)
  - Bin full (value > 90%)
  - Weight limit (value > 2.8 kg)

**Data Flow:**
```
ESP32 → IoT Core → Lambda → DynamoDB
```

#### Other Lambda Functions
- `SmartWasteVisionAnalysis` - Image analysis (512 MB, Python 3.9)
- `SmartWasteSensorProcessor` - Additional sensor processing
- `SmartWasteAIChat` - AI chatbot functionality

---

### 4. Amazon DynamoDB

#### SensorData Table
- **Table Name:** SensorData
- **Billing Mode:** PAY_PER_REQUEST (On-Demand)
- **Item Count:** 38,818 items
- **Table Size:** 4.2 MB
- **Created:** 2026-01-02

**Schema:**
- **Partition Key:** deviceId (String)
- **Sort Key:** timestamp (String, ISO 8601 format)

**Attributes:**
- deviceId: Device identifier
- timestamp: ISO 8601 timestamp with Z suffix
- sensorType: fill, gas, fire, weight
- value: Numeric sensor reading (Decimal)
- unit: %, ppm, boolean, kg
- location: Physical location (e.g., bin-001)
- wasteType: wet, dry, metal (for weight sensor)
- measurementSequence: Sequence number (for weight sensor)

**Performance:**
- Warm Throughput: 12,000 read units/sec, 4,000 write units/sec
- Deletion Protection: Disabled

---

### 5. EC2 Instance (Application Server)

#### Instance Details
- **Instance ID:** i-00d3c76e4d3522ec8
- **Type:** m5.large
- **Public IP:** 98.82.140.84
- **Private IP:** 172.31.76.147
- **OS:** Ubuntu Linux
- **Region:** us-east-1f
- **Security Group:** sg-02fbe86a8387d3438 (launch-wizard-11)

#### Security Group Rules
**Inbound:**
- Port 22 (SSH): 103.197.74.130/32
- Port 80 (HTTP): 103.197.74.130/32
- Port 3000-3001 (Frontend): 58.84.60.66/32, 103.197.74.130/32
- Port 8080 (Backend API): 103.197.74.130/32
- Port 1883, 8883 (MQTT): 103.197.74.130/32

**Outbound:**
- All traffic allowed

#### Running Services

**Backend API (Node.js)**
- **Port:** 8080
- **File:** `/home/ubuntu/waste-management-system/backend/api-server.js`
- **Process:** Running as background service
- **Log:** `/home/ubuntu/waste-management-system/backend/api.log`

**Frontend (React + Vite)**
- **Port:** 3000
- **Directory:** `/home/ubuntu/waste-management-system/`
- **Process:** Running as background service
- **Log:** `/home/ubuntu/waste-management-system/frontend.log`

---

### 6. Backend API (Node.js/Express)

#### Technology Stack
- Express.js web framework
- AWS SDK v3 (DynamoDB)
- CORS enabled for frontend access
- JWT authentication (auth.js)

#### API Endpoints

**GET /api/health**
- Health check endpoint
- Returns: Server status and timestamp

**GET /api/sensors/latest**
- Retrieves latest sensor readings from both devices
- Queries last 20 readings per device
- Returns: Processed dashboard data + raw readings
- Response format:
```json
{
  "success": true,
  "data": {
    "fillLevel": 0,
    "gasLevel": 100,
    "fireDetected": false,
    "wetWaste": 0.010,
    "dryWaste": 0.049,
    "metalWaste": 0.141,
    "lastUpdated": "2026-01-18T05:36:33.437Z"
  },
  "rawReadings": [...]
}
```

**GET /api/sensors/history?hours=24**
- Historical data for specified time period
- Groups readings by time intervals
- Returns: Time-series data for charts

**GET /api/sensors/device/:deviceId?limit=20**
- Device-specific readings
- Supports pagination with limit parameter
- Returns: Array of sensor readings

**POST /api/auth/***
- Authentication endpoints
- Handled by auth.js module

#### Configuration
- **CORS Origins:** localhost:3000, 127.0.0.1:3000, 98.82.140.84:3000
- **DynamoDB Region:** us-east-1
- **Table:** SensorData

---

### 7. Frontend (React Dashboard)

#### Technology Stack
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5.4.19
- **UI Library:** shadcn/ui components
- **Styling:** Tailwind CSS
- **State Management:** React hooks

#### Features
- Real-time sensor data display
- Fill level gauge
- Gas level monitoring
- Fire detection alerts
- Waste weight tracking (wet/dry/metal)
- Historical data charts
- Auto-refresh every 5 seconds

#### Configuration
**Vite Proxy Setup:**
```typescript
server: {
  host: "0.0.0.0",
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

#### Data Service
- **File:** `src/lib/realData.ts`
- **Functions:**
  - `fetchRealSensorData()` - Gets latest readings
  - `fetchHistoricalData(hours)` - Gets historical data
- **API Calls:** Relative paths via Vite proxy (`/api/sensors/latest`)

#### Directory Structure
```
/home/ubuntu/waste-management-system/
├── src/
│   ├── components/
│   ├── lib/
│   │   └── realData.ts
│   └── pages/
├── backend/
│   ├── api-server.js
│   ├── auth.js
│   └── lambda_data_ingestion.py
├── iot/
│   ├── waste_sensor_blynk_aws.ino
│   ├── weight_sensor_esp32_fixed.ino
│   ├── *.cert.pem
│   └── *.private.key
├── infrastructure/
│   ├── dynamodb-policy.json
│   └── lambda-trust-policy.json
└── package.json
```

---

## Data Flow Architecture

### Real-Time Data Pipeline

```
┌─────────────┐
│  ESP32      │
│  Sensors    │
│             │
│ - Waste     │
│ - Weight    │
└──────┬──────┘
       │ MQTT/TLS (8883)
       │ Every 5 seconds
       ▼
┌─────────────────────┐
│  AWS IoT Core       │
│                     │
│ - Device Registry   │
│ - Certificate Auth  │
│ - Topic Rules       │
└──────┬──────────────┘
       │ IoT Rule Trigger
       │ sensors/+/data
       ▼
┌─────────────────────────────┐
│  Lambda Function            │
│  WasteManagementDataIngestion│
│                             │
│ - Validate data             │
│ - Convert to Decimal        │
│ - Check alerts              │
└──────┬──────────────────────┘
       │ PutItem
       ▼
┌─────────────────┐
│  DynamoDB       │
│  SensorData     │
│                 │
│ 38,818 items    │
└──────┬──────────┘
       │ Query (last 20)
       ▼
┌─────────────────┐
│  Backend API    │
│  Node.js:8080   │
│                 │
│ - Process data  │
│ - Aggregate     │
└──────┬──────────┘
       │ HTTP/JSON
       │ Vite Proxy
       ▼
┌─────────────────┐
│  React Frontend │
│  Port 3000      │
│                 │
│ - Dashboard     │
│ - Charts        │
│ - Alerts        │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  End User       │
│  Web Browser    │
└─────────────────┘
```

### Alert Flow

```
ESP32 Sensor → IoT Core → Lambda (Alert Check) → DynamoDB
                                    │
                                    ├─→ Blynk Notification
                                    └─→ Dashboard Alert
```

---

## Network Architecture

### Public Access
- **Dashboard URL:** http://98.82.140.84:3000/
- **API URL:** http://98.82.140.84:8080/ (restricted by security group)

### Internal Communication
- Frontend → Backend: Via Vite proxy (localhost:8080)
- Backend → DynamoDB: AWS SDK with IAM role
- Lambda → DynamoDB: IAM role permissions

### Security Layers
1. **IoT Layer:** X.509 certificates, TLS 1.2
2. **Network Layer:** Security groups, IP whitelisting
3. **Application Layer:** CORS, JWT authentication
4. **Data Layer:** IAM roles, DynamoDB encryption at rest

---

## Deployment Information

### Application Startup

**Start Backend:**
```bash
cd /home/ubuntu/waste-management-system/backend
nohup node api-server.js > api.log 2>&1 &
```

**Start Frontend:**
```bash
cd /home/ubuntu/waste-management-system
nohup npm run dev -- --host 0.0.0.0 --port 3000 > frontend.log 2>&1 &
```

**Check Status:**
```bash
ss -tlnp | grep -E "3000|8080"
ps aux | grep node
```

### Environment Requirements
- Node.js (installed)
- npm packages (installed via package.json)
- AWS credentials configured (IAM instance profile)
- Network connectivity to AWS services

---

## Monitoring & Logs

### Application Logs
- Backend: `/home/ubuntu/waste-management-system/backend/api.log`
- Frontend: `/home/ubuntu/waste-management-system/frontend.log`

### AWS CloudWatch
- Lambda logs: `/aws/lambda/WasteManagementDataIngestion`
- IoT Core logs: Available via AWS Console

### Metrics
- DynamoDB: Read/Write capacity, item count
- Lambda: Invocations, duration, errors
- IoT Core: Message count, connection status

---

## Key Features

### Real-Time Monitoring
- Live sensor data updates every 5 seconds
- Instant fire and gas alerts
- Fill level tracking
- Weight measurements by waste type

### Data Storage
- 38,818+ sensor readings stored
- Historical data retention
- Query by device and time range

### Scalability
- On-demand DynamoDB billing
- Serverless Lambda processing
- Auto-scaling frontend (Vite HMR)

### Integration
- Blynk mobile app notifications
- REST API for third-party integration
- MQTT protocol support

---

## Cost Optimization

### Current Configuration
- **DynamoDB:** Pay-per-request (no idle costs)
- **Lambda:** Free tier eligible (128 MB, 30s timeout)
- **IoT Core:** Pay per message
- **EC2:** m5.large (consider downsizing for production)

### Recommendations
- Use EC2 Reserved Instance for cost savings
- Implement DynamoDB TTL for old data
- Consider API Gateway + Lambda instead of EC2 for backend
- Use CloudFront for frontend static hosting

---

## Future Enhancements

### Planned Features
- SMS/Email alerts via SNS
- Machine learning for waste prediction
- Multi-location support
- Mobile app (React Native)
- Route optimization for collection

### Technical Improvements
- Add Redis caching layer
- Implement WebSocket for real-time updates
- Add API rate limiting
- Implement comprehensive error handling
- Add unit and integration tests

---

## Contact & Support

**System Owner:** Waste Management Team  
**AWS Account:** YOUR_AWS_ACCOUNT_ID  
**Region:** us-east-1  
**Deployment Date:** January 2026

**Key Files:**
- Architecture: `/home/ubuntu/arch/`
- Application: `/home/ubuntu/waste-management-system/`
- Certificates: `/home/ubuntu/waste-management-system/iot/`

---

## Appendix

### ESP32 Sensor Pins
**Waste Sensor:**
- TRIG_PIN: 5
- ECHO_PIN: 18
- MQ2_DOUT_PIN: 32
- FLAME_PIN: 35

**Weight Sensor:**
- HX711 DOUT: GPIO pin (see code)
- HX711 SCK: GPIO pin (see code)

### WiFi Configuration
- SSID: SWTHME24
- Security: WPA2

### AWS IoT Endpoint
- `a2pegkw5yeofz9-ats.iot.us-east-1.amazonaws.com:8883`

### Blynk Configuration
- Template ID: TMPL3x45NG7El
- Template Name: GAS OR FLAME ALERT
