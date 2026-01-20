# Deployment Diagram

## System Topology

```
                                    INTERNET
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    │                  │                  │
              ┌─────▼─────┐      ┌────▼────┐      ┌─────▼─────┐
              │  ESP32    │      │  ESP32  │      │   USER    │
              │  Waste    │      │  Weight │      │  BROWSER  │
              │  Sensor   │      │  Sensor │      │           │
              └─────┬─────┘      └────┬────┘      └─────┬─────┘
                    │                 │                  │
                    │ MQTT/TLS        │ MQTT/TLS         │ HTTPS
                    │ Port 8883       │ Port 8883        │ Port 3000
                    │                 │                  │
                    └────────┬────────┘                  │
                             │                           │
                    ┌────────▼────────┐                  │
                    │                 │                  │
                    │  AWS IoT Core   │                  │
                    │                 │                  │
                    │  Endpoint:      │                  │
                    │  a2pegkw5...    │                  │
                    │  Port: 8883     │                  │
                    │                 │                  │
                    └────────┬────────┘                  │
                             │                           │
                             │ IoT Rule                  │
                             │ Trigger                   │
                             │                           │
                    ┌────────▼────────┐                  │
                    │                 │                  │
                    │  AWS Lambda     │                  │
                    │                 │                  │
                    │  Function:      │                  │
                    │  WasteMgmt...   │                  │
                    │  Python 3.11    │                  │
                    │  128 MB         │                  │
                    │                 │                  │
                    └────────┬────────┘                  │
                             │                           │
                             │ PutItem                   │
                             │                           │
                    ┌────────▼────────┐                  │
                    │                 │                  │
                    │  DynamoDB       │                  │
                    │                 │                  │
                    │  Table:         │                  │
                    │  SensorData     │                  │
                    │  38,818 items   │                  │
                    │  On-Demand      │                  │
                    │                 │                  │
                    └────────┬────────┘                  │
                             │                           │
                             │ Query                     │
                             │                           │
        ┌────────────────────▼────────────────────┐     │
        │                                         │     │
        │  EC2 Instance (m5.large)                │     │
        │  IP: YOUR_EC2_PUBLIC_IP                       │     │
        │  Ubuntu Linux                           │     │
        │                                         │     │
        │  ┌───────────────────────────────────┐  │     │
        │  │                                   │  │     │
        │  │  Backend API (Node.js)            │  │     │
        │  │  Port: 8080                       │  │     │
        │  │                                   │  │     │
        │  │  • Express.js                     │  │     │
        │  │  • AWS SDK v3                     │  │     │
        │  │  • DynamoDB Client                │  │     │
        │  │  • CORS Enabled                   │  │     │
        │  │                                   │  │     │
        │  │  Endpoints:                       │  │     │
        │  │  GET /api/health                  │  │     │
        │  │  GET /api/sensors/latest          │  │     │
        │  │  GET /api/sensors/history         │  │     │
        │  │  GET /api/sensors/device/:id      │  │     │
        │  │                                   │  │     │
        │  └───────────────┬───────────────────┘  │     │
        │                  │                       │     │
        │                  │ Vite Proxy            │     │
        │                  │ /api → :8080          │     │
        │                  │                       │     │
        │  ┌───────────────▼───────────────────┐  │     │
        │  │                                   │  │     │
        │  │  Frontend (React)                 │  │     │
        │  │  Port: 3000                       │  │     │
        │  │                                   │  │     │
        │  │  • Vite + TypeScript              │  │     │
        │  │  • React 18                       │  │     │
        │  │  • shadcn/ui                      │  │     │
        │  │  • Tailwind CSS                   │  │     │
        │  │  • Real-time Dashboard            │  │     │
        │  │                                   │  │     │
        │  │  Features:                        │  │     │
        │  │  • Fill Level Gauge               │  │     │
        │  │  • Gas Level Monitor              │  │     │
        │  │  • Fire Alerts                    │  │     │
        │  │  • Weight Tracking                │  │     │
        │  │  • Historical Charts              │  │     │
        │  │  • Auto-refresh (5s)              │  │     │
        │  │                                   │  │     │
        │  └───────────────────────────────────┘  │     │
        │                                         │     │
        └─────────────────────────────────────────┘     │
                             │                           │
                             └───────────────────────────┘
                                   HTTP Response


═══════════════════════════════════════════════════════════════════

## Network Diagram

┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                               │
│                      Region: us-east-1                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    VPC: vpc-0ca3fe52a844cbae1             │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  Subnet: subnet-029108428b7076448                   │ │ │
│  │  │  AZ: us-east-1f                                     │ │ │
│  │  │                                                     │ │ │
│  │  │  ┌───────────────────────────────────────────────┐ │ │ │
│  │  │  │  EC2 Instance                                 │ │ │ │
│  │  │  │  i-00d3c76e4d3522ec8                          │ │ │ │
│  │  │  │                                               │ │ │ │
│  │  │  │  Private IP: YOUR_EC2_PRIVATE_IP                    │ │ │ │
│  │  │  │  Public IP: YOUR_EC2_PUBLIC_IP                      │ │ │ │
│  │  │  │                                               │ │ │ │
│  │  │  │  Security Group: sg-02fbe86a8387d3438         │ │ │ │
│  │  │  │  ┌─────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │ Inbound Rules:                          │ │ │ │ │
│  │  │  │  │ • 22 (SSH)    ← YOUR_ALLOWED_IP/32       │ │ │ │ │
│  │  │  │  │ • 3000-3001   ← YOUR_ALLOWED_IP/32          │ │ │ │ │
│  │  │  │  │               ← YOUR_ALLOWED_IP/32       │ │ │ │ │
│  │  │  │  │ • 8080        ← YOUR_ALLOWED_IP/32       │ │ │ │ │
│  │  │  │  │                                         │ │ │ │ │
│  │  │  │  │ Outbound Rules:                         │ │ │ │ │
│  │  │  │  │ • All traffic → 0.0.0.0/0               │ │ │ │ │
│  │  │  │  └─────────────────────────────────────────┘ │ │ │ │
│  │  │  │                                               │ │ │ │
│  │  │  │  IAM Role: AmazonSSMRoleForInstances...      │ │ │ │
│  │  │  │  • DynamoDB access                            │ │ │ │
│  │  │  │  • Systems Manager access                     │ │ │ │
│  │  │  │                                               │ │ │ │
│  │  │  └───────────────────────────────────────────────┘ │ │ │
│  │  │                                                     │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  AWS IoT Core                                             │ │
│  │  Endpoint: a2pegkw5yeofz9-ats.iot.us-east-1.amazonaws... │ │
│  │                                                           │ │
│  │  Things:                                                  │ │
│  │  • waste-sensor-001                                       │ │
│  │  • weight-sensor-001                                      │ │
│  │                                                           │ │
│  │  Rules:                                                   │ │
│  │  • SensorDataProcessingRule                               │ │
│  │  • SmartWasteBinRule                                      │ │
│  │  • SmartWasteLoadCellRule                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  AWS Lambda                                               │ │
│  │                                                           │ │
│  │  Function: WasteManagementDataIngestion                   │ │
│  │  Runtime: Python 3.11                                     │ │
│  │  Memory: 128 MB                                           │ │
│  │  Timeout: 30s                                             │ │
│  │                                                           │ │
│  │  IAM Role: WasteManagementLambdaRole                      │ │
│  │  • DynamoDB PutItem/Query                                 │ │
│  │  • CloudWatch Logs                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Amazon DynamoDB                                          │ │
│  │                                                           │ │
│  │  Table: SensorData                                        │ │
│  │  Billing: PAY_PER_REQUEST                                 │ │
│  │  Items: 38,818                                            │ │
│  │  Size: 4.2 MB                                             │ │
│  │                                                           │ │
│  │  Keys:                                                    │ │
│  │  • Partition: deviceId (String)                           │ │
│  │  • Sort: timestamp (String)                               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  CloudWatch Logs                                          │ │
│  │                                                           │ │
│  │  Log Groups:                                              │ │
│  │  • /aws/lambda/WasteManagementDataIngestion               │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

## Data Flow Sequence

1. ESP32 Sensor Reading
   ├─ Read physical sensors (ultrasonic, gas, flame, weight)
   ├─ Create JSON payload
   └─ Publish to MQTT topic

2. MQTT Transport
   ├─ TLS 1.2 encryption
   ├─ X.509 certificate authentication
   └─ Connect to AWS IoT Core endpoint

3. AWS IoT Core Processing
   ├─ Authenticate device certificate
   ├─ Receive message on topic
   ├─ Match IoT Rule pattern
   └─ Trigger Lambda function

4. Lambda Processing
   ├─ Receive event from IoT Core
   ├─ Validate required fields
   ├─ Convert to DynamoDB format
   ├─ Check alert conditions
   └─ Store in DynamoDB

5. DynamoDB Storage
   ├─ PutItem operation
   ├─ Store with deviceId + timestamp key
   └─ Data available for queries

6. Backend API Query
   ├─ Query DynamoDB for latest readings
   ├─ Process and aggregate data
   ├─ Format for frontend consumption
   └─ Return JSON response

7. Frontend Display
   ├─ Fetch data via API proxy
   ├─ Update dashboard components
   ├─ Display charts and gauges
   └─ Auto-refresh every 5 seconds

8. User Interaction
   ├─ View real-time data
   ├─ See historical trends
   └─ Receive alert notifications

═══════════════════════════════════════════════════════════════════

## Port Mapping

External Access:
┌──────────────────────────────────────────────────────────┐
│ Port │ Service        │ Access                          │
├──────┼────────────────┼─────────────────────────────────┤
│ 22   │ SSH            │ YOUR_ALLOWED_IP/32               │
│ 3000 │ Frontend       │ YOUR_ALLOWED_IP/32, YOUR_ALLOWED_IP  │
│ 8080 │ Backend API    │ YOUR_ALLOWED_IP/32 (restricted)  │
│ 8883 │ MQTT (IoT)     │ ESP32 devices                   │
└──────────────────────────────────────────────────────────┘

Internal Communication:
┌──────────────────────────────────────────────────────────┐
│ Source         │ Destination    │ Port  │ Protocol      │
├────────────────┼────────────────┼───────┼───────────────┤
│ Frontend       │ Backend        │ 8080  │ HTTP (proxy)  │
│ Backend        │ DynamoDB       │ 443   │ HTTPS         │
│ Lambda         │ DynamoDB       │ 443   │ HTTPS         │
│ IoT Core       │ Lambda         │ -     │ Event trigger │
│ ESP32          │ IoT Core       │ 8883  │ MQTT/TLS      │
└──────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

## Security Architecture

┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Device Security
├─ X.509 certificates for each ESP32
├─ Private keys stored on device
├─ TLS 1.2 encryption
└─ Device-specific IoT policies

Layer 2: Network Security
├─ VPC isolation
├─ Security groups with IP whitelisting
├─ Private subnets for internal communication
└─ Public subnet for internet-facing services

Layer 3: Application Security
├─ CORS configuration
├─ JWT authentication (auth.js)
├─ Input validation
└─ API rate limiting (recommended)

Layer 4: Data Security
├─ IAM roles with least privilege
├─ DynamoDB encryption at rest (recommended)
├─ CloudWatch logging
└─ Audit trails via CloudTrail (recommended)

Layer 5: Access Control
├─ SSH key-based authentication
├─ IAM user/role separation
├─ MFA for AWS Console (recommended)
└─ Secrets Manager for credentials (recommended)

═══════════════════════════════════════════════════════════════════

## Scalability Architecture

Current Capacity:
├─ IoT Core: Unlimited devices
├─ Lambda: 1000 concurrent executions
├─ DynamoDB: On-demand (auto-scaling)
└─ EC2: Single m5.large instance

Scaling Options:

Horizontal Scaling:
├─ Add more ESP32 sensors
├─ Deploy multiple EC2 instances with load balancer
├─ Use Lambda for backend (serverless)
└─ Add DynamoDB Global Tables for multi-region

Vertical Scaling:
├─ Increase EC2 instance size
├─ Increase Lambda memory allocation
└─ Add DynamoDB provisioned capacity

Performance Optimization:
├─ Add ElastiCache (Redis) for caching
├─ Use CloudFront CDN for frontend
├─ Implement API Gateway for rate limiting
└─ Add read replicas for DynamoDB

═══════════════════════════════════════════════════════════════════

## Disaster Recovery

Backup Strategy:
├─ DynamoDB: Point-in-Time Recovery (PITR)
├─ EC2: AMI snapshots
├─ Code: Git repository
└─ Certificates: Encrypted S3 backup

Recovery Time Objective (RTO): 1 hour
Recovery Point Objective (RPO): 5 minutes

Failover Plan:
1. Launch new EC2 from AMI
2. Restore DynamoDB from backup
3. Update DNS/IP addresses
4. Verify sensor connectivity
5. Test dashboard functionality

═══════════════════════════════════════════════════════════════════
