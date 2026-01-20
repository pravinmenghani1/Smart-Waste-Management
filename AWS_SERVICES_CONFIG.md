# AWS Services Configuration

## AWS IoT Core

### Things (Devices)

#### waste-sensor-001
```json
{
  "thingName": "waste-sensor-001",
  "thingTypeName": "WasteSensor",
  "thingArn": "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:thing/waste-sensor-001",
  "attributes": {
    "location": "bin-001",
    "sensorTypes": "fill,gas,fire"
  }
}
```

#### weight-sensor-001
```json
{
  "thingName": "weight-sensor-001",
  "thingTypeName": "WeightSensor",
  "thingArn": "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:thing/weight-sensor-001",
  "attributes": {
    "location": "bin-001",
    "maxCapacity": "3kg",
    "sensorTypes": "weight"
  }
}
```

### IoT Rules

#### SensorDataProcessingRule
```json
{
  "ruleName": "SensorDataProcessingRule",
  "sql": "SELECT * FROM 'sensors/+/data'",
  "description": "Route all sensor data to Lambda for processing",
  "actions": [
    {
      "lambda": {
        "functionArn": "arn:aws:lambda:us-east-1:YOUR_AWS_ACCOUNT_ID:function:WasteManagementDataIngestion"
      }
    }
  ],
  "ruleDisabled": false,
  "awsIotSqlVersion": "2015-10-08"
}
```

**How it works:**
- Listens to topic pattern: `sensors/+/data`
- Wildcard `+` matches any device ID
- Forwards entire message to Lambda function
- No transformation applied

#### SmartWasteBinRule
```json
{
  "ruleName": "SmartWasteBinRule",
  "topicPattern": "home/bin/+",
  "ruleDisabled": false
}
```

#### SmartWasteLoadCellRule
```json
{
  "ruleName": "SmartWasteLoadCellRule",
  "topicPattern": "sensors/loadcell/weight",
  "ruleDisabled": false
}
```

### Device Policies

#### Waste Sensor Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:client/waste-sensor-001"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish"
      ],
      "Resource": [
        "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:topic/sensors/waste-sensor-001/data",
        "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:topic/alerts/fire",
        "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:topic/alerts/gas"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Subscribe",
        "iot:Receive"
      ],
      "Resource": "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:topicfilter/sensors/waste-sensor-001/commands"
    }
  ]
}
```

#### Weight Sensor Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect"
      ],
      "Resource": "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:client/weight-sensor-001"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iot:Publish"
      ],
      "Resource": "arn:aws:iot:us-east-1:YOUR_AWS_ACCOUNT_ID:topic/sensors/weight-sensor-001/data"
    }
  ]
}
```

---

## AWS Lambda

### WasteManagementDataIngestion Function

**Configuration:**
```json
{
  "FunctionName": "WasteManagementDataIngestion",
  "FunctionArn": "arn:aws:lambda:us-east-1:YOUR_AWS_ACCOUNT_ID:function:WasteManagementDataIngestion",
  "Runtime": "python3.11",
  "Role": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:role/WasteManagementLambdaRole",
  "Handler": "lambda_data_ingestion.lambda_handler",
  "Timeout": 30,
  "MemorySize": 128
}
```

**IAM Role: WasteManagementLambdaRole**

Trust Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Permissions Policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:YOUR_AWS_ACCOUNT_ID:table/SensorData"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:us-east-1:YOUR_AWS_ACCOUNT_ID:log-group:/aws/lambda/WasteManagementDataIngestion:*"
    }
  ]
}
```

**Function Code:** See `/home/ubuntu/waste-management-system/backend/lambda_data_ingestion.py`

**Key Features:**
- Validates incoming IoT messages
- Converts numeric values to DynamoDB Decimal
- Adds ISO 8601 timestamp
- Implements alert logic
- Returns alert array in response

**Input Event Example:**
```json
{
  "deviceId": "waste-sensor-001",
  "sensorType": "gas",
  "value": 2000,
  "unit": "ppm",
  "location": "bin-001"
}
```

**Output Example:**
```json
{
  "statusCode": 200,
  "body": {
    "message": "Data stored successfully",
    "alerts": [
      {
        "type": "GAS_LEAK",
        "message": "High gas levels detected: 2000 ppm",
        "severity": "HIGH"
      }
    ]
  }
}
```

---

## Amazon DynamoDB

### SensorData Table

**Table Configuration:**
```json
{
  "TableName": "SensorData",
  "BillingMode": "PAY_PER_REQUEST",
  "AttributeDefinitions": [
    {
      "AttributeName": "deviceId",
      "AttributeType": "S"
    },
    {
      "AttributeName": "timestamp",
      "AttributeType": "S"
    }
  ],
  "KeySchema": [
    {
      "AttributeName": "deviceId",
      "KeyType": "HASH"
    },
    {
      "AttributeName": "timestamp",
      "KeyType": "RANGE"
    }
  ]
}
```

**Item Example:**
```json
{
  "deviceId": "waste-sensor-001",
  "timestamp": "2026-01-18T05:36:30.146636Z",
  "sensorType": "gas",
  "value": 2000,
  "unit": "ppm",
  "location": "bin-001"
}
```

**Weight Sensor Item Example:**
```json
{
  "deviceId": "weight-sensor-001",
  "timestamp": "2026-01-18T05:36:34.404569Z",
  "sensorType": "weight",
  "value": 0.010487,
  "unit": "kg",
  "location": "bin-001",
  "wasteType": "wet",
  "measurementSequence": 1
}
```

**Query Patterns:**

1. Get latest readings for a device:
```javascript
{
  TableName: 'SensorData',
  KeyConditionExpression: 'deviceId = :deviceId',
  ExpressionAttributeValues: {
    ':deviceId': 'waste-sensor-001'
  },
  ScanIndexForward: false,
  Limit: 20
}
```

2. Get readings within time range:
```javascript
{
  TableName: 'SensorData',
  KeyConditionExpression: 'deviceId = :deviceId AND #timestamp > :cutoffTime',
  ExpressionAttributeNames: {
    '#timestamp': 'timestamp'
  },
  ExpressionAttributeValues: {
    ':deviceId': 'waste-sensor-001',
    ':cutoffTime': '2026-01-18T00:00:00Z'
  }
}
```

**Performance:**
- Read capacity: 12,000 units/sec (warm throughput)
- Write capacity: 4,000 units/sec (warm throughput)
- On-demand billing: No provisioned capacity needed

**Cost Optimization:**
- Consider implementing TTL for old data
- Archive historical data to S3
- Use DynamoDB Streams for real-time processing

---

## Amazon EC2

### Instance Configuration

**Instance Details:**
```json
{
  "InstanceId": "i-00d3c76e4d3522ec8",
  "InstanceType": "m5.large",
  "ImageId": "ami-09c5d660bc51c5b3c",
  "State": "running",
  "PublicIpAddress": "98.82.140.84",
  "PrivateIpAddress": "172.31.76.147",
  "SubnetId": "subnet-029108428b7076448",
  "VpcId": "vpc-0ca3fe52a844cbae1",
  "SecurityGroups": ["sg-02fbe86a8387d3438"],
  "IamInstanceProfile": {
    "Arn": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:instance-profile/AmazonSSMRoleForInstancesQuickSetup"
  }
}
```

**Security Group: sg-02fbe86a8387d3438**

Inbound Rules:
```json
[
  {
    "IpProtocol": "tcp",
    "FromPort": 22,
    "ToPort": 22,
    "IpRanges": [{"CidrIp": "103.197.74.130/32"}]
  },
  {
    "IpProtocol": "tcp",
    "FromPort": 3000,
    "ToPort": 3001,
    "IpRanges": [
      {"CidrIp": "58.84.60.66/32"},
      {"CidrIp": "103.197.74.130/32"}
    ]
  },
  {
    "IpProtocol": "tcp",
    "FromPort": 8080,
    "ToPort": 8080,
    "IpRanges": [{"CidrIp": "103.197.74.130/32"}]
  }
]
```

Outbound Rules:
```json
[
  {
    "IpProtocol": "-1",
    "IpRanges": [{"CidrIp": "0.0.0.0/0"}]
  }
]
```

**IAM Instance Profile:**
- Role: AmazonSSMRoleForInstancesQuickSetup
- Allows: Systems Manager access
- Allows: DynamoDB access (for backend API)

---

## IAM Roles Summary

### WasteManagementLambdaRole
- **Used by:** Lambda function
- **Permissions:** DynamoDB PutItem/Query, CloudWatch Logs
- **Trust:** lambda.amazonaws.com

### SmartBinLambdaRole
- **Used by:** Other Lambda functions (Vision, Chat, Sensor Processor)
- **Permissions:** Various AWS services
- **Trust:** lambda.amazonaws.com

### AmazonSSMRoleForInstancesQuickSetup
- **Used by:** EC2 instance
- **Permissions:** Systems Manager, DynamoDB
- **Trust:** ec2.amazonaws.com

---

## CloudWatch Logs

### Log Groups
- `/aws/lambda/WasteManagementDataIngestion`
- `/aws/lambda/SmartWasteVisionAnalysis`
- `/aws/lambda/SmartWasteSensorProcessor`
- `/aws/lambda/SmartWasteAIChat`

### Retention
- Default: Never expire
- Recommendation: Set to 30 days for cost optimization

---

## Cost Breakdown (Estimated Monthly)

### IoT Core
- Messages: ~130,000/month (48 msg/min × 43,200 min)
- Cost: $0.08 per 100,000 messages = **$0.10/month**

### Lambda
- Invocations: ~130,000/month
- Duration: 30s × 128 MB
- Free tier: 1M requests, 400,000 GB-seconds
- Cost: **$0.00/month** (within free tier)

### DynamoDB
- On-demand pricing
- Write requests: ~130,000/month
- Read requests: ~50,000/month (estimated)
- Storage: 4.2 MB
- Cost: **$0.40/month**

### EC2
- m5.large: $0.096/hour
- 730 hours/month
- Cost: **$70.08/month**

### Data Transfer
- Minimal (mostly within AWS)
- Cost: **$1-2/month**

**Total Estimated Cost: ~$72/month**

**Optimization Recommendations:**
1. Downsize EC2 to t3.small: Save ~$50/month
2. Use Lambda + API Gateway instead of EC2: Save ~$65/month
3. Host frontend on S3 + CloudFront: Save ~$70/month
4. **Potential savings: $65-70/month**

---

## Backup & Disaster Recovery

### Current State
- No automated backups configured
- Manual backup: `/home/ubuntu/waste-management-system-WORKING-BACKUP-20260102-113522.tar.gz`

### Recommendations

**DynamoDB:**
- Enable Point-in-Time Recovery (PITR)
- Set up on-demand backups
- Export to S3 for long-term storage

**EC2:**
- Create AMI snapshots weekly
- Use AWS Backup service
- Store application code in Git repository

**IoT Certificates:**
- Store securely in AWS Secrets Manager
- Backup to encrypted S3 bucket

---

## Security Best Practices

### Implemented
✅ TLS 1.2 for IoT communication
✅ X.509 certificate authentication
✅ IAM roles with least privilege
✅ Security groups with IP restrictions
✅ CORS configuration

### Recommended
⚠️ Enable DynamoDB encryption at rest
⚠️ Rotate IoT certificates regularly
⚠️ Implement API authentication (JWT)
⚠️ Enable CloudTrail for audit logging
⚠️ Use AWS WAF for API protection
⚠️ Store secrets in Secrets Manager
⚠️ Enable VPC Flow Logs
⚠️ Implement rate limiting on API

---

## Monitoring & Alerts

### CloudWatch Alarms (Recommended)

**Lambda Errors:**
```json
{
  "AlarmName": "WasteManagement-Lambda-Errors",
  "MetricName": "Errors",
  "Namespace": "AWS/Lambda",
  "Statistic": "Sum",
  "Period": 300,
  "EvaluationPeriods": 1,
  "Threshold": 5,
  "ComparisonOperator": "GreaterThanThreshold"
}
```

**DynamoDB Throttling:**
```json
{
  "AlarmName": "SensorData-Throttling",
  "MetricName": "UserErrors",
  "Namespace": "AWS/DynamoDB",
  "Statistic": "Sum",
  "Period": 300,
  "Threshold": 10
}
```

**EC2 CPU:**
```json
{
  "AlarmName": "EC2-High-CPU",
  "MetricName": "CPUUtilization",
  "Namespace": "AWS/EC2",
  "Statistic": "Average",
  "Period": 300,
  "Threshold": 80
}
```

---

## Deployment Checklist

### Initial Setup
- [x] Create IoT Things
- [x] Generate device certificates
- [x] Create IoT policies
- [x] Attach policies to certificates
- [x] Create IoT rules
- [x] Create DynamoDB table
- [x] Create Lambda function
- [x] Configure IAM roles
- [x] Launch EC2 instance
- [x] Configure security groups
- [x] Deploy backend API
- [x] Deploy frontend application

### Ongoing Maintenance
- [ ] Monitor CloudWatch metrics
- [ ] Review CloudWatch logs weekly
- [ ] Update Lambda function code
- [ ] Rotate IoT certificates (annually)
- [ ] Review IAM permissions quarterly
- [ ] Update security group rules as needed
- [ ] Backup DynamoDB data monthly
- [ ] Update ESP32 firmware as needed
