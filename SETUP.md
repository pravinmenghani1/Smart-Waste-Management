# Setup Instructions

## Complete Setup Guide for EcoSmart Waste Management System

This guide will help you set up the entire system from scratch on a new machine.

---

## Prerequisites

### System Requirements
- **OS:** Ubuntu 20.04+ / macOS / Windows with WSL2
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 10GB free space
- **Network:** Internet connection for AWS services

### Software Requirements
- **Node.js:** v18.x or higher
- **npm:** v9.x or higher
- **AWS CLI:** v2.x
- **Git:** Latest version
- **ngrok:** Latest version (for development)

---

## Step 1: Install Prerequisites

### Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node@18

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show v9.x.x
```

### Install AWS CLI
```bash
# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# macOS
brew install awscli

# Verify installation
aws --version
```

### Install ngrok
```bash
# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok

# macOS
brew install ngrok/ngrok/ngrok

# Authenticate (get token from https://dashboard.ngrok.com)
ngrok config add-authtoken YOUR_TOKEN
```

---

## Step 2: AWS Configuration

### Configure AWS Credentials
```bash
aws configure

# Enter when prompted:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json
```

### Create DynamoDB Tables

**Table 1: SensorData**
```bash
aws dynamodb create-table \
  --table-name SensorData \
  --attribute-definitions \
    AttributeName=deviceId,AttributeType=S \
    AttributeName=timestamp,AttributeType=S \
  --key-schema \
    AttributeName=deviceId,KeyType=HASH \
    AttributeName=timestamp,KeyType=RANGE \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

**Table 2: ServiceTickets**
```bash
aws dynamodb create-table \
  --table-name ServiceTickets \
  --attribute-definitions \
    AttributeName=ticketId,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema \
    AttributeName=ticketId,KeyType=HASH \
  --global-secondary-indexes \
    '[{
      "IndexName": "CreatedAtIndex",
      "KeySchema": [{"AttributeName":"createdAt","KeyType":"HASH"}],
      "Projection": {"ProjectionType":"ALL"},
      "ProvisionedThroughput": {"ReadCapacityUnits":5,"WriteCapacityUnits":5}
    }]' \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### Create S3 Bucket
```bash
aws s3 mb s3://iotimplementation --region us-east-1

# Create folder for ticket images
aws s3api put-object \
  --bucket iotimplementation \
  --key ticket-images/
```

### Enable Bedrock Access
```bash
# Request access to Claude 3.5 Sonnet in AWS Console
# Go to: AWS Console → Bedrock → Model access
# Request access to: anthropic.claude-3-5-sonnet-20241022-v2:0
```

---

## Step 3: Download Project

### Option A: From S3 Backup
```bash
# Download backup
aws s3 cp s3://iotimplementation/Final-AI-Conclave/arch.tar.gz .

# Extract
tar -xzf arch.tar.gz
cd arch
```

### Option B: From Git (if available)
```bash
git clone YOUR_REPO_URL
cd arch
```

---

## Step 4: Backend Setup

```bash
cd backend-code

# Install dependencies
npm install

# Verify installation
npm list

# Expected packages:
# - express
# - cors
# - @aws-sdk/client-dynamodb
# - @aws-sdk/lib-dynamodb
# - @aws-sdk/client-bedrock-runtime
# - @aws-sdk/client-s3
# - @aws-sdk/s3-request-presigner
```

### Backend Environment (Optional)
```bash
# No .env file needed for backend
# It uses AWS credentials from ~/.aws/credentials
```

### Test Backend
```bash
# Start server
npm start

# In another terminal, test health endpoint
curl http://localhost:8080/api/health

# Expected response:
# {"success":true,"message":"Smart Waste Management API is running","timestamp":"..."}
```

---

## Step 5: Frontend Setup

```bash
cd ../app-code

# Install dependencies
npm install

# Verify installation
npm list

# Expected packages:
# - react
# - react-dom
# - vite
# - @aws-amplify/ui-react
# - @elevenlabs/client
# - shadcn/ui components
```

### Frontend Environment
```bash
# Create .env file
cat > .env << EOF
VITE_ELEVENLABS_AGENT_ID=agent_5901kfasykgee5w8x3590fb9yhed
EOF
```

### Test Frontend
```bash
# Start dev server
npm run dev

# Should see:
# VITE v5.x.x ready in XXXms
# ➜ Local: http://localhost:3000/
```

---

## Step 6: ElevenLabs Voice Agent Setup

### Create ElevenLabs Account
1. Go to https://elevenlabs.io
2. Sign up for an account
3. Navigate to Conversational AI section

### Create Agent
1. Click "Create Agent"
2. Name: "EcoSmart Waste Assistant"
3. Voice: Choose professional voice (e.g., Rachel)

### Configure Agent Instructions
```
You are an AI voice assistant for EcoSmart, a smart waste management system. You help citizens and operators manage their waste efficiently.

CAPABILITIES:
- Provide real-time bin fill levels and status
- Share collection schedules for wet waste, dry waste, and hazardous waste
- Report active alerts (gas levels, fire detection, bin overflow)
- Answer billing and payment questions
- Guide users on proper waste segregation
- Help report issues like missed collections or damaged bins

PERSONALITY:
- Professional yet friendly and approachable
- Environmentally conscious and encouraging
- Clear and concise in responses
- Proactive about safety alerts
- Patient with elderly and non-technical users
```

### Add Custom Tools

**Tool 1: get_system_status**
- URL: `https://YOUR_NGROK_URL/api/voice/context`
- Method: GET

**Tool 2: process_query**
- URL: `https://YOUR_NGROK_URL/api/voice/query`
- Method: POST
- Body: `{"query": "{{user_query}}"}`

**Tool 3: report_issue**
- URL: `https://YOUR_NGROK_URL/api/voice/action`
- Method: POST
- Body: `{"action": "{{action_type}}", "details": "{{issue_details}}"}`

### Get Agent ID
1. After creating agent, copy the Agent ID
2. Update frontend .env file with the Agent ID

---

## Step 7: Start All Services

### Terminal 1: Backend
```bash
cd arch/backend-code
npm start

# Logs to: api.log
# Running on: http://localhost:8080
```

### Terminal 2: Frontend
```bash
cd arch/app-code
npm run dev

# Logs to: frontend.log
# Running on: http://localhost:3000
```

### Terminal 3: ngrok
```bash
ngrok http 3000

# Note the HTTPS URL (e.g., https://xxxx.ngrok-free.dev)
# Use this URL to access the application
```

---

## Step 8: Verify Installation

### Test Backend APIs
```bash
# Health check
curl http://localhost:8080/api/health

# Get sensors
curl http://localhost:8080/api/sensors/latest

# Get tickets
curl http://localhost:8080/api/tickets
```

### Test Frontend
1. Open ngrok HTTPS URL in browser
2. Navigate through all tabs:
   - Dashboard ✓
   - AI Assistant ✓
   - Vision Analysis ✓
   - Voice Agent ✓
   - Tickets ✓

### Test AI Features

**AI Assistant:**
1. Go to AI Assistant tab
2. Type: "What is my bin status?"
3. Should get real-time data

**Vision Analysis:**
1. Go to Vision Analysis tab
2. Upload an image
3. Enter ticket details
4. Click "Analyze with AI"
5. Should see waste composition analysis

**Voice Agent:**
1. Go to Voice Agent tab
2. Click "Start Voice Call"
3. Allow microphone access
4. Speak: "What's my bin status?"
5. Should hear voice response

**Tickets:**
1. Go to Tickets tab
2. Should see list of all tickets
3. Tickets with images show "Image Uploaded"

---

## Step 9: Populate Sample Data (Optional)

### Add Sample Sensor Data
```bash
aws dynamodb put-item \
  --table-name SensorData \
  --item '{
    "deviceId": {"S": "waste-sensor-001"},
    "timestamp": {"S": "2026-01-20T00:00:00Z"},
    "sensorType": {"S": "fill"},
    "value": {"N": "67"},
    "fillLevel": {"N": "67"},
    "location": {"S": "Baner, Pune"}
  }'
```

### Create Sample Ticket
```bash
# Use AI Assistant to create a ticket
# Or use API:
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"There is illegal dumping near Baner"}'
```

---

## Troubleshooting

### Backend won't start
```bash
# Check Node version
node --version  # Must be v18+

# Check if port 8080 is in use
lsof -i :8080
kill -9 PID  # If needed

# Check AWS credentials
aws sts get-caller-identity

# Check logs
tail -f backend-code/api.log
```

### Frontend won't start
```bash
# Check Node version
node --version

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check if port 3000 is in use
lsof -i :3000
```

### AWS Access Denied
```bash
# Verify credentials
aws sts get-caller-identity

# Check IAM permissions
# Ensure user has:
# - DynamoDB: Query, Scan, PutItem, GetItem
# - Bedrock: InvokeModel
# - S3: PutObject, GetObject
```

### DynamoDB Table Not Found
```bash
# List tables
aws dynamodb list-tables

# If missing, create tables (see Step 2)
```

### Bedrock Access Denied
```bash
# Check model access in AWS Console
# Go to: Bedrock → Model access
# Ensure Claude 3.5 Sonnet is enabled
```

### ngrok Connection Issues
```bash
# Check if ngrok is running
ps aux | grep ngrok

# Restart ngrok
pkill ngrok
ngrok http 3000
```

---

## Production Deployment

For production deployment, see `DEPLOYMENT.md`.

**Key differences:**
- Use PM2 or systemd for process management
- Use nginx as reverse proxy
- Use AWS ALB for load balancing
- Use AWS RDS or managed DynamoDB
- Use CloudFront for frontend
- Enable SSL/TLS certificates
- Set up monitoring and logging
- Configure auto-scaling

---

## Maintenance

### Update Dependencies
```bash
# Backend
cd backend-code
npm update
npm audit fix

# Frontend
cd app-code
npm update
npm audit fix
```

### Backup Data
```bash
# Backup DynamoDB tables
aws dynamodb create-backup \
  --table-name SensorData \
  --backup-name SensorData-backup-$(date +%Y%m%d)

aws dynamodb create-backup \
  --table-name ServiceTickets \
  --backup-name ServiceTickets-backup-$(date +%Y%m%d)

# Backup S3 bucket
aws s3 sync s3://iotimplementation s3://iotimplementation-backup
```

### Monitor Logs
```bash
# Backend logs
tail -f backend-code/api.log

# Frontend logs
tail -f app-code/frontend.log

# ngrok logs
tail -f ngrok-frontend.log
```

---

## Next Steps

1. ✅ Complete setup
2. ✅ Test all features
3. ✅ Populate sample data
4. ✅ Configure ElevenLabs agent
5. ✅ Set up monitoring
6. ✅ Review security settings
7. ✅ Plan production deployment

---

## Support

For issues:
1. Check troubleshooting section
2. Review logs
3. Verify AWS service status
4. Check documentation files

---

**Setup Complete!** 🎉

Your EcoSmart Waste Management System is now ready to use.
