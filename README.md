# EcoSmart Waste Management System

A comprehensive IoT-powered smart waste management system featuring real-time monitoring, AI-powered assistance, computer vision analysis, and voice-enabled interactions.

## 🎯 Features

- **Real-time IoT Dashboard** - Live waste bin monitoring with DynamoDB
- **AI Assistant** - Conversational AI powered by AWS Bedrock (Claude 3.5 Sonnet)
- **Vision Analysis** - Waste composition detection using computer vision
- **Voice Agent** - Hands-free interaction via ElevenLabs
- **Service Tickets** - Complete ticket management with image linking

## 🏗️ Architecture

- **Frontend:** React 18 + TypeScript + Vite + shadcn/ui
- **Backend:** Node.js 18 + Express
- **Database:** AWS DynamoDB
- **AI/ML:** AWS Bedrock (Claude 3.5 Sonnet)
- **Storage:** AWS S3
- **Voice:** ElevenLabs Conversational AI

## 🚀 Quick Start

See [SETUP.md](SETUP.md) for detailed instructions.

```bash
# Install dependencies
cd backend-code && npm install
cd ../app-code && npm install

# Configure environment
cd app-code
echo "VITE_ELEVENLABS_AGENT_ID=your_agent_id" > .env

# Start services
cd backend-code && npm start
cd ../app-code && npm run dev
```

## 📚 Documentation

- [README.md](README.md) - This file
- [SETUP.md](SETUP.md) - Complete setup guide
- [MANIFEST.md](MANIFEST.md) - System architecture
- [AI_ASSISTANT_FINAL.md](AI_ASSISTANT_FINAL.md) - AI features
- [VISION_TICKET_LINKING.md](VISION_TICKET_LINKING.md) - Vision analysis
- [ELEVENLABS_AGENT_SETUP.md](ELEVENLABS_AGENT_SETUP.md) - Voice setup

## 🔐 Security

- No secrets or credentials in repository
- AWS credentials via `~/.aws/credentials`
- Environment variables for API keys
- Private S3 buckets
- IAM-based access control

## 👥 Authors

See [Team Members](team/README.md) for photos and details.

- **Pravinkumar Menghani** - pmenghan@amazon.com
- **Qais Poonawala** - qppoonaw@amazon.com

## 📄 License

NA

## 🎓 AWS Services Used

Amazon DynamoDB, AWS Bedrock, Amazon S3, AWS IAM, AWS SDK for JavaScript, Amazon CloudWatch

---

**Built for AI Conclave 2026**
