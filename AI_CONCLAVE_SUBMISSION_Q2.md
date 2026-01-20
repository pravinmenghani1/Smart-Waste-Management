# AI Conclave Submission - AWS Services List

## Question 2: Please provide us a comma separated list all the AWS Services leveraged to build this Demo.

### Complete AWS Services List:

Amazon DynamoDB, AWS Bedrock, Amazon S3, AWS IAM, AWS SDK for JavaScript, Amazon CloudWatch

---

## Detailed Service Usage:

### 1. **Amazon DynamoDB**
- **Purpose:** NoSQL database for storing sensor data and service tickets
- **Tables:** 
  - SensorData (IoT sensor readings)
  - ServiceTickets (citizen complaints and reports)
- **Features Used:** 
  - Query and Scan operations
  - Global Secondary Indexes
  - On-demand capacity mode
  - Real-time data retrieval

### 2. **AWS Bedrock**
- **Purpose:** Foundation model access for AI capabilities
- **Model:** anthropic.claude-3-5-sonnet-20241022-v2:0
- **Features Used:**
  - Text generation for conversational AI
  - Vision analysis for waste composition detection
  - Function calling (tool use) for system integration
  - Streaming responses for real-time interaction

### 3. **Amazon S3**
- **Purpose:** Object storage for uploaded images
- **Bucket:** iotimplementation
- **Features Used:**
  - Image storage with metadata
  - Organized folder structure (ticket-images/)
  - Secure private bucket configuration
  - Integration with DynamoDB for reference linking

### 4. **AWS IAM (Identity and Access Management)**
- **Purpose:** Security and access control
- **Features Used:**
  - User credentials management
  - Service-specific permissions
  - Least privilege access policies
  - Secure API access

### 5. **AWS SDK for JavaScript (v3)**
- **Purpose:** Programmatic access to AWS services
- **Packages Used:**
  - @aws-sdk/client-dynamodb
  - @aws-sdk/lib-dynamodb
  - @aws-sdk/client-bedrock-runtime
  - @aws-sdk/client-s3
  - @aws-sdk/s3-request-presigner

### 6. **Amazon CloudWatch (Implicit)**
- **Purpose:** Monitoring and logging
- **Features Used:**
  - API call logging
  - Performance metrics
  - Error tracking
  - Service health monitoring

---

## Service Integration Architecture:

```
Frontend (React)
      ↓
Backend (Node.js + Express)
      ↓
   ┌──┴──┬──────┬────────┐
   ↓     ↓      ↓        ↓
DynamoDB Bedrock S3    IAM
   ↓     ↓      ↓        ↓
CloudWatch (Monitoring)
```

---

## Cost Optimization:

- **DynamoDB:** On-demand pricing, pay per request
- **Bedrock:** Pay per token, no infrastructure costs
- **S3:** Standard storage, lifecycle policies
- **IAM:** No additional cost
- **CloudWatch:** Free tier for basic monitoring

**Estimated Monthly Cost:** < $100 for 10,000 daily interactions

---

## Why These Services?

1. **Serverless Architecture:** No server management required
2. **Auto-Scaling:** Handles variable load automatically
3. **High Availability:** 99.9%+ uptime SLA
4. **Security:** Enterprise-grade security built-in
5. **Cost-Effective:** Pay only for what you use
6. **Easy Integration:** Services work seamlessly together
7. **Global Reach:** Available in multiple AWS regions

---

**Primary Services:** Amazon DynamoDB, AWS Bedrock, Amazon S3  
**Supporting Services:** AWS IAM, AWS SDK for JavaScript, Amazon CloudWatch  
**Total Services:** 6 AWS Services
