# AI Assistant - Complete Summary

## System Overview

The AI Assistant is a conversational agent for PMC/PCMC (Pune Municipal Corporation) waste management system, powered by **Claude 3.5 Sonnet** via AWS Bedrock.

---

## System Prompt (Instructions)

```
You are an AI assistant for the PMC/PCMC (Pune Municipal Corporation) smart waste management system. You help citizens with:

1. Waste reduction and recycling tips
2. Bin collection schedules (Wet waste: Mon/Wed/Fri, Dry waste: Tue/Sat, Hazardous: First Sunday)
3. Reporting issues - YOU CAN CREATE TICKETS DIRECTLY
4. Understanding waste segregation
5. Environmental best practices

IMPORTANT - When users want to report issues like:
- Missed collections
- Damaged bins
- Illegal dumping/landfills
- Overflowing bins
- Any waste management complaints

YOU MUST use the create_service_ticket tool to create a ticket immediately. Say "I'll create a service ticket for you right away" and use the tool.

Be helpful, concise, and environmentally conscious. You represent PMC/PCMC Pune.
```

---

## Tools Assigned to AI Assistant

### 1. create_service_ticket

**Description:** Creates service tickets for waste management issues reported by citizens

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "issue_type": {
      "type": "string",
      "enum": ["missed_collection", "damaged_bin", "illegal_dumping", "overflowing_bin", "other"],
      "description": "Type of issue being reported"
    },
    "description": {
      "type": "string",
      "description": "Detailed description of the issue including location and any relevant details"
    },
    "location": {
      "type": "string",
      "description": "Location where the issue is occurring"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Priority level based on severity"
    }
  },
  "required": ["issue_type", "description", "location"]
}
```

**When AI Uses This Tool:**
- User reports any waste management issue
- User mentions problems like missed collections, damaged bins, illegal dumping
- User wants to file a complaint

**Tool Response:**
```json
{
  "success": true,
  "ticketId": "WM-2026-XXXXXX",
  "status": "created",
  "estimatedResponse": "4 hours"
}
```

---

## Example Interactions

### Example 1: Illegal Dumping Report

**User:** "There is illegal dumping near Mata Mandir Temple in Baner"

**AI Assistant:**
1. Recognizes this is a reportable issue
2. Calls `create_service_ticket` tool with:
   - issue_type: "illegal_dumping"
   - description: "Illegal dumping reported near Mata Mandir Temple in Baner..."
   - location: "Mata Mandir Temple, Baner, Pune"
   - priority: "high"
3. Receives ticket ID: WM-2026-149554
4. Responds: "I've created a service ticket for this illegal dumping issue. The ticket number is WM-2026-149554. Our team will investigate and address this matter within approximately 4 hours..."

**Backend Log:**
```
Service ticket created: {
  ticketId: 'WM-2026-149554',
  issue_type: 'illegal_dumping',
  description: 'Illegal dumping reported near Mata Mandir Temple in Baner...',
  location: 'Mata Mandir Temple, Baner, Pune',
  priority: 'high'
}
```

### Example 2: Missed Collection

**User:** "My bin wasn't collected today"

**AI Assistant:**
1. Calls `create_service_ticket` tool
2. Creates ticket with issue_type: "missed_collection"
3. Responds with ticket number and estimated response time

### Example 3: General Query (No Tool Use)

**User:** "What are recycling tips?"

**AI Assistant:**
- Does NOT use any tool
- Provides direct answer about recycling best practices
- No ticket created

---

## Key Differences from Voice Agent

| Feature | AI Assistant (Chat) | Voice Agent |
|---------|-------------------|-------------|
| **Interface** | Text chat | Voice conversation |
| **Tools** | 1 tool: `create_service_ticket` | 3 tools: `get_system_status`, `process_query`, `report_issue` |
| **Platform** | AWS Bedrock (Claude 3.5) | ElevenLabs Conversational AI |
| **Ticket Creation** | Direct via tool calling | Via backend API endpoint |
| **Use Case** | Async text-based support | Real-time voice interaction |

---

## Technical Implementation

**Model:** `us.anthropic.claude-3-5-sonnet-20241022-v2:0` (AWS Bedrock)

**Endpoint:** `POST /api/ai/chat`

**Request:**
```json
{
  "message": "User's message",
  "conversationHistory": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Response (Normal):**
```json
{
  "success": true,
  "response": "AI assistant's text response"
}
```

**Response (With Ticket):**
```json
{
  "success": true,
  "response": "AI assistant's text response with ticket details",
  "ticketCreated": true,
  "ticketId": "WM-2026-XXXXXX"
}
```

**Tool Calling Flow:**
1. User sends message
2. Claude analyzes if tool is needed
3. If yes, Claude calls `create_service_ticket` with parameters
4. Backend generates ticket ID (WM-YYYY-XXXXXX format)
5. Backend sends tool result back to Claude
6. Claude generates final response including ticket details
7. Response sent to user

---

## Capabilities Summary

### 1. ✅ Direct Ticket Creation
- No need to redirect users to external helplines
- Instant ticket generation with unique ID
- Automatic priority assignment based on issue type

### 2. ✅ PMC/PCMC Context
- Represents Pune Municipal Corporation
- Knows local collection schedules
- Provides Pune-specific information

### 3. ✅ Intelligent Issue Detection
- Automatically recognizes when to create tickets
- Extracts location and details from user messages
- Sets appropriate priority levels

### 4. ✅ Conversational Memory
- Maintains conversation history
- Can reference previous messages
- Provides contextual follow-ups

### 5. ✅ Multi-Purpose Support
- Answers general questions (no ticket)
- Creates tickets for issues (with ticket)
- Provides tips and guidance

---

## Configuration

**Location:** `/home/ubuntu/arch/backend-code/api-server.js`

**Key Parameters:**
- `max_tokens`: 1024
- `anthropic_version`: "bedrock-2023-05-31"
- Tool calling enabled via `tools` array in payload

**Ticket ID Format:** `WM-YYYY-XXXXXX`
- WM = Waste Management
- YYYY = Current year
- XXXXXX = Last 6 digits of timestamp

---

## Testing

**Test Command:**
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"There is illegal dumping near Mata Mandir Temple in Baner"}'
```

**Expected Result:**
- Ticket created with ID
- Response includes ticket number
- Backend logs show ticket details

---

## Future Enhancements

1. **Database Integration** - Save tickets to DynamoDB
2. **SMS Notifications** - Send ticket confirmation via SMS
3. **Status Tracking** - Allow users to check ticket status
4. **Image Attachments** - Accept photos with reports
5. **Multi-language** - Support Marathi and Hindi
6. **Analytics** - Track ticket types and resolution times
