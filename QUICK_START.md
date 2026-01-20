# Quick Start Guide

## System Access

**Dashboard URL:** http://98.82.140.84:3000/  
**AWS Region:** us-east-1  
**AWS Account:** YOUR_AWS_ACCOUNT_ID

---

## Starting the System

### 1. Start Backend API
```bash
cd /home/ubuntu/waste-management-system/backend
nohup node api-server.js > api.log 2>&1 &
```

### 2. Start Frontend
```bash
cd /home/ubuntu/waste-management-system
nohup npm run dev -- --host 0.0.0.0 --port 3000 > frontend.log 2>&1 &
```

### 3. Verify Services
```bash
# Check if services are running
ss -tlnp | grep -E "3000|8080"

# Check processes
ps aux | grep node

# View logs
tail -f /home/ubuntu/waste-management-system/backend/api.log
tail -f /home/ubuntu/waste-management-system/frontend.log
```

---

## Stopping the System

```bash
# Stop all Node processes
pkill -f "node"

# Or stop individually
pkill -f "api-server"
pkill -f "vite"
```

---

## ESP32 Sensors

### Upload Code to ESP32

1. **Install Arduino IDE**
2. **Add ESP32 Board Support**
   - File → Preferences → Additional Board Manager URLs
   - Add: `https://dl.espressif.com/dl/package_esp32_index.json`
3. **Install Libraries**
   - WiFi (built-in)
   - WiFiClientSecure (built-in)
   - PubSubClient
   - ArduinoJson
   - BlynkSimpleEsp32
   - HX711 (for weight sensor)
4. **Configure WiFi and Certificates**
   - Update SSID and password
   - Paste AWS certificates
5. **Upload to ESP32**
   - Select board: ESP32 Dev Module
   - Select port
   - Click Upload

### Monitor ESP32
```bash
# Open Serial Monitor in Arduino IDE
# Baud rate: 115200
```

---

## Checking Data Flow

### 1. Check ESP32 is Publishing
```bash
# View IoT Core MQTT test client in AWS Console
# Subscribe to: sensors/+/data
```

### 2. Check Lambda is Processing
```bash
aws logs tail /aws/lambda/WasteManagementDataIngestion --follow --region us-east-1
```

### 3. Check DynamoDB has Data
```bash
aws dynamodb scan --table-name SensorData --limit 5 --region us-east-1
```

### 4. Check Backend API
```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/sensors/latest
```

### 5. Check Frontend
Open browser: http://98.82.140.84:3000/

---

## Common Issues

### Frontend Not Loading
```bash
# Check if service is running
ss -tlnp | grep 3000

# Check logs
tail -50 /home/ubuntu/waste-management-system/frontend.log

# Restart
pkill -f vite
cd /home/ubuntu/waste-management-system
nohup npm run dev -- --host 0.0.0.0 --port 3000 > frontend.log 2>&1 &
```

### Backend API Not Responding
```bash
# Check if service is running
ss -tlnp | grep 8080

# Check logs
tail -50 /home/ubuntu/waste-management-system/backend/api.log

# Restart
pkill -f api-server
cd /home/ubuntu/waste-management-system/backend
nohup node api-server.js > api.log 2>&1 &
```

### No Data from Sensors
```bash
# Check IoT Core metrics in AWS Console
# Check Lambda invocations
aws lambda get-function --function-name WasteManagementDataIngestion --region us-east-1

# Check IoT rule
aws iot get-topic-rule --rule-name SensorDataProcessingRule --region us-east-1

# Test Lambda manually
aws lambda invoke --function-name WasteManagementDataIngestion \
  --payload '{"deviceId":"test","sensorType":"fill","value":50,"unit":"%","location":"bin-001"}' \
  --region us-east-1 response.json
```

### ESP32 Not Connecting to WiFi
- Verify SSID and password
- Check 2.4GHz network (ESP32 doesn't support 5GHz)
- Check signal strength
- Restart ESP32

### ESP32 Not Connecting to AWS IoT
- Verify certificates are correct
- Check IoT endpoint URL
- Verify device policy allows connect/publish
- Check system time (NTP sync)

---

## Useful Commands

### AWS CLI

**List IoT Things:**
```bash
aws iot list-things --region us-east-1
```

**List IoT Rules:**
```bash
aws iot list-topic-rules --region us-east-1
```

**Get Lambda Function:**
```bash
aws lambda get-function --function-name WasteManagementDataIngestion --region us-east-1
```

**Query DynamoDB:**
```bash
aws dynamodb query \
  --table-name SensorData \
  --key-condition-expression "deviceId = :id" \
  --expression-attribute-values '{":id":{"S":"waste-sensor-001"}}' \
  --scan-index-forward false \
  --limit 10 \
  --region us-east-1
```

**View Lambda Logs:**
```bash
aws logs tail /aws/lambda/WasteManagementDataIngestion --follow --region us-east-1
```

### System Monitoring

**Check Disk Space:**
```bash
df -h
```

**Check Memory:**
```bash
free -h
```

**Check CPU:**
```bash
top
```

**Check Network:**
```bash
netstat -tuln
ss -tuln
```

---

## Backup & Restore

### Create Backup
```bash
# Backup application
cd /home/ubuntu
tar -czf waste-management-backup-$(date +%Y%m%d-%H%M%S).tar.gz waste-management-system/

# Backup DynamoDB
aws dynamodb create-backup \
  --table-name SensorData \
  --backup-name SensorData-backup-$(date +%Y%m%d) \
  --region us-east-1
```

### Restore from Backup
```bash
# Restore application
cd /home/ubuntu
tar -xzf waste-management-backup-YYYYMMDD-HHMMSS.tar.gz

# Restore DynamoDB
aws dynamodb restore-table-from-backup \
  --target-table-name SensorData \
  --backup-arn arn:aws:dynamodb:us-east-1:YOUR_AWS_ACCOUNT_ID:table/SensorData/backup/BACKUP_ARN \
  --region us-east-1
```

---

## Updating the System

### Update Frontend Code
```bash
cd /home/ubuntu/waste-management-system
pkill -f vite
# Make code changes
npm run dev -- --host 0.0.0.0 --port 3000
```

### Update Backend Code
```bash
cd /home/ubuntu/waste-management-system/backend
pkill -f api-server
# Make code changes
node api-server.js
```

### Update Lambda Function
```bash
cd /home/ubuntu/waste-management-system/backend
zip lambda_function.zip lambda_data_ingestion.py
aws lambda update-function-code \
  --function-name WasteManagementDataIngestion \
  --zip-file fileb://lambda_function.zip \
  --region us-east-1
```

### Update ESP32 Code
1. Make changes in Arduino IDE
2. Connect ESP32 via USB
3. Upload new code
4. Monitor serial output

---

## Performance Tuning

### Optimize DynamoDB Queries
- Use Query instead of Scan
- Add GSI for common query patterns
- Implement pagination for large result sets

### Optimize Lambda
- Increase memory if needed (more memory = more CPU)
- Reduce cold starts with provisioned concurrency
- Optimize code for faster execution

### Optimize Frontend
- Enable production build: `npm run build`
- Use CDN for static assets
- Implement lazy loading

### Optimize Backend
- Add Redis caching layer
- Implement connection pooling
- Use PM2 for process management

---

## Security Checklist

- [ ] Rotate IoT certificates annually
- [ ] Review IAM permissions quarterly
- [ ] Update security group rules as needed
- [ ] Enable CloudTrail for audit logging
- [ ] Implement API rate limiting
- [ ] Use HTTPS for frontend (add SSL certificate)
- [ ] Store secrets in AWS Secrets Manager
- [ ] Enable DynamoDB encryption at rest
- [ ] Implement JWT authentication for API
- [ ] Regular security updates for EC2 instance

---

## Monitoring Dashboard

### Key Metrics to Monitor

**IoT Core:**
- Message count
- Connection status
- Rule execution count

**Lambda:**
- Invocation count
- Error rate
- Duration
- Throttles

**DynamoDB:**
- Read/Write capacity
- Throttled requests
- Item count
- Table size

**EC2:**
- CPU utilization
- Memory usage
- Disk space
- Network traffic

**Application:**
- API response time
- Error rate
- Active users
- Data freshness

---

## Support & Troubleshooting

### Log Locations
- Backend: `/home/ubuntu/waste-management-system/backend/api.log`
- Frontend: `/home/ubuntu/waste-management-system/frontend.log`
- Lambda: CloudWatch Logs `/aws/lambda/WasteManagementDataIngestion`

### Debug Mode

**Enable Backend Debug:**
```bash
DEBUG=* node api-server.js
```

**Enable Frontend Debug:**
```bash
npm run dev -- --debug
```

**Enable Lambda Debug:**
Add to Lambda code:
```python
logger.setLevel(logging.DEBUG)
```

### Contact Information
- AWS Account: YOUR_AWS_ACCOUNT_ID
- Region: us-east-1
- Documentation: `/home/ubuntu/arch/`

---

## Quick Reference

### URLs
- Dashboard: http://98.82.140.84:3000/
- Backend API: http://localhost:8080/
- AWS Console: https://console.aws.amazon.com/

### Ports
- Frontend: 3000
- Backend: 8080
- MQTT: 8883

### File Paths
- Application: `/home/ubuntu/waste-management-system/`
- Backend: `/home/ubuntu/waste-management-system/backend/`
- IoT Code: `/home/ubuntu/waste-management-system/iot/`
- Documentation: `/home/ubuntu/arch/`

### AWS Resources
- DynamoDB Table: SensorData
- Lambda Function: WasteManagementDataIngestion
- IoT Rule: SensorDataProcessingRule
- EC2 Instance: i-00d3c76e4d3522ec8
- Security Group: sg-02fbe86a8387d3438
