# ElevenLabs Agent Setup Guide

## Agent Configuration

### 1. Agent Instructions (System Prompt)

Copy this into your ElevenLabs agent's "Instructions" field:

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

CONVERSATION GUIDELINES:
1. Always greet users warmly
2. When asked about status, call get_system_status to fetch real-time data
3. For specific queries, use process_query function
4. When users want to report issues, confirm details before calling report_issue
5. Provide actionable next steps
6. End calls politely and ask if there's anything else

EXAMPLE RESPONSES:
- "Your wet waste bin is at 67% capacity. Based on current trends, it will be full by Thursday. Your next collection is Friday, so you're right on track."
- "I've detected a high gas level alert. The methane level is at 420 ppm, above the safe threshold. Please ensure the area is well-ventilated."
- "I've created service ticket WM-2026-0119 for your missed collection. A crew will be dispatched within 4 hours. You'll receive an SMS confirmation shortly."

SAFETY FIRST:
- Always prioritize fire and gas alerts
- Escalate emergencies immediately
- Provide clear safety instructions
```

---

## 2. Custom Tools/Functions

Add these 3 custom functions to your ElevenLabs agent:

### Tool 1: Get System Status

**Name:** `get_system_status`

**Description:** 
```
Retrieves current real-time data including bin fill levels, active alerts, collection schedules, and billing information. Use this when users ask about status, levels, alerts, or schedules.
```

**Configuration:**
```json
{
  "type": "custom",
  "url": "https://viki-nonbacterial-chelsie.ngrok-free.dev/api/voice/context",
  "method": "GET",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

**When to use:**
- "What's my bin fill level?"
- "Are there any alerts?"
- "When is my next collection?"
- "What's the current status?"

---

### Tool 2: Process Query

**Name:** `process_query`

**Description:**
```
Processes specific user queries about waste management, segregation guidelines, and general information. Use this for detailed questions that need contextual responses.
```

**Configuration:**
```json
{
  "type": "custom",
  "url": "https://viki-nonbacterial-chelsie.ngrok-free.dev/api/voice/query",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "query": "{{user_query}}",
    "conversationId": "{{conversation_id}}"
  }
}
```

**Parameters:**
- `user_query` (string, required): The user's question
- `conversationId` (string, optional): Current conversation ID

**When to use:**
- "How do I dispose of batteries?"
- "What goes in the dry waste bin?"
- "Tell me about my billing"

---

### Tool 3: Report Issue

**Name:** `report_issue`

**Description:**
```
Creates service tickets for waste management issues. Use this when users want to report problems like missed collections, damaged bins, or request callbacks.
```

**Configuration:**
```json
{
  "type": "custom",
  "url": "https://viki-nonbacterial-chelsie.ngrok-free.dev/api/voice/action",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "action": "{{action_type}}",
    "details": "{{issue_details}}",
    "userId": "{{user_id}}"
  }
}
```

**Parameters:**
- `action_type` (string, required): One of:
  - `report_missed_collection`
  - `report_damaged_bin`
  - `request_callback`
- `issue_details` (string, required): Description of the issue
- `user_id` (string, optional): User identifier

**When to use:**
- "My collection was missed"
- "My bin is damaged"
- "I need someone to call me back"

---

## 3. Agent Settings

### Basic Settings:
- **Agent Name:** EcoSmart Waste Assistant
- **Language:** English (US)
- **Voice:** Choose a professional, friendly voice (recommend: "Rachel" or "Adam")
- **Response Latency:** Low (for real-time feel)

### Advanced Settings:
- **Max Call Duration:** 10 minutes
- **Silence Timeout:** 5 seconds
- **Enable Interruptions:** Yes (users can interrupt)
- **Background Noise Handling:** Enabled

### First Message:
```
Hello! I'm your EcoSmart waste management assistant. I can help you check bin levels, collection schedules, alerts, and answer any waste management questions. How can I assist you today?
```

### Webhook URL:
```
https://viki-nonbacterial-chelsie.ngrok-free.dev/api/voice/webhook
```

Enable these webhook events:
- ✅ conversation.started
- ✅ conversation.ended
- ✅ user.message
- ✅ agent.response

---

## 4. Sample Conversation Flows

### Flow 1: Status Check
```
User: "What's the status of my bins?"
Agent: [Calls get_system_status()]
Agent: "Your wet waste bin is at 67% capacity with collection scheduled for Wednesday. Your dry waste bin is at 45% and metal waste is at 23%. All systems are functioning normally."
```

### Flow 2: Alert Check
```
User: "Are there any alerts?"
Agent: [Calls get_system_status()]
Agent: "Yes, there's one active alert. Your wet waste bin is critically full at 95% capacity. Your scheduled collection is tomorrow morning. Please ensure the bin is accessible for pickup."
```

### Flow 3: Report Issue
```
User: "I need to report a missed collection"
Agent: "I can help with that. Which type of waste collection was missed?"
User: "Wet waste"
Agent: "Got it. Can you confirm your address?"
User: "123 Main Street"
Agent: [Calls report_issue(action="report_missed_collection", details="Wet waste at 123 Main Street")]
Agent: "I've created service ticket WM-2026-0119 for missed wet waste collection at 123 Main Street. A collection crew will be dispatched within 4 hours. You'll receive an SMS confirmation shortly."
```

### Flow 4: Billing Query
```
User: "What's my current bill?"
Agent: [Calls get_system_status()]
Agent: "Your current bill is $45.50, due by January 31st. This includes $30 for regular collection, $10 for recycling services, and $5.50 in environmental fees. Would you like me to send you a payment link?"
```

---

## 5. Testing Checklist

After setup, test these scenarios:

- [ ] "What's my bin fill level?" - Should call get_system_status
- [ ] "Are there any alerts?" - Should report active alerts
- [ ] "When is my next collection?" - Should provide schedule
- [ ] "What's my bill?" - Should provide billing info
- [ ] "Report a missed collection" - Should create ticket
- [ ] "How do I dispose of batteries?" - Should provide guidance
- [ ] Interrupt the agent mid-sentence - Should handle gracefully
- [ ] Stay silent for 5 seconds - Should prompt user
- [ ] End call naturally - Should say goodbye

---

## 6. Quick Setup Steps

1. **Go to ElevenLabs Dashboard** → Conversational AI
2. **Create New Agent** → Name it "EcoSmart Waste Assistant"
3. **Paste System Prompt** from section 1 above
4. **Add 3 Custom Tools** from section 2 above
5. **Configure Settings** from section 3 above
6. **Set Webhook URL** to your backend
7. **Test in Playground** before going live
8. **Copy Agent ID and API Key**
9. **Add to backend .env file**

---

## 7. Important Notes

✅ **ngrok HTTPS URL:** Currently using `https://viki-nonbacterial-chelsie.ngrok-free.dev` which tunnels to your backend on port 8080

⚠️ **ngrok URL Changes:** Free ngrok URLs change on restart. Update all tool URLs and webhook if ngrok restarts. Check current URL: `curl -s http://localhost:4040/api/tunnels`

⚠️ **Production:** For production, use a static domain with ngrok paid plan or deploy with proper SSL certificate

⚠️ **Rate Limiting:** Consider adding rate limiting to prevent abuse

⚠️ **Authentication:** Add user authentication for production use

---

## Need Help?

- ElevenLabs Docs: https://elevenlabs.io/docs/conversational-ai
- Tool Configuration: https://elevenlabs.io/docs/conversational-ai/customization/custom-tools
- Webhook Guide: https://elevenlabs.io/docs/conversational-ai/customization/webhooks

**Ready to create your agent!** 🎙️
