# AI Assistant System Prompt & Tools

## Overview
The AI Assistant in the EcoSmart Waste Management System is powered by Claude 3.5 Sonnet via AWS Bedrock. It provides intelligent responses to user queries and can **create service tickets directly** for PMC/PCMC Pune.

## System Prompt

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

## Tools Available to AI Assistant

### Tool 1: create_service_ticket

**Purpose:** Creates service tickets for waste management issues reported by citizens

**When to Use:** 
- User reports missed collections
- User reports damaged bins
- User reports illegal dumping/landfills
- User reports overflowing bins
- Any waste management complaints

**Parameters:**
```json
{
  "issue_type": "missed_collection | damaged_bin | illegal_dumping | overflowing_bin | other",
  "description": "Detailed description including location and relevant details",
  "location": "Where the issue is occurring",
  "priority": "low | medium | high (optional, defaults to medium)"
}
```

**Example Usage:**
User: "There's illegal dumping near Mata Mandir Temple in Baner"

AI Response: "I'll create a service ticket for you right away."

Tool Call:
```json
{
  "issue_type": "illegal_dumping",
  "description": "Illegal dumping/landfill reported near Mata Mandir Temple in Baner",
  "location": "Mata Mandir Temple, Baner",
  "priority": "high"
}
```

Tool Result:
```json
{
  "success": true,
  "ticketId": "WM-2026-123456",
  "status": "created",
  "estimatedResponse": "4 hours"
}
```

Final Response: "I've created service ticket WM-2026-123456 for the illegal dumping near Mata Mandir Temple in Baner. A PMC team will respond within 4 hours. You'll receive updates via SMS."

## Capabilities

### 1. Waste Reduction & Recycling Tips
- Provides practical advice on reducing waste
- Explains recycling best practices
- Offers tips for composting and organic waste management
- Suggests eco-friendly alternatives

### 2. Bin Collection Schedules
- Answers questions about collection days
- Explains different waste stream schedules (wet, dry, hazardous)
- Provides information about holiday schedule changes

### 3. Issue Reporting
- Guides users on how to report missed collections
- Helps with damaged bin reports
- Assists with service request submissions

### 4. Waste Segregation
- Explains proper waste categorization
- Provides guidance on what goes in which bin
- Clarifies rules for special items (batteries, electronics, etc.)

### 5. Environmental Best Practices
- Shares sustainability tips
- Educates on environmental impact
- Promotes circular economy principles

## Technical Implementation

**Model:** `us.anthropic.claude-3-5-sonnet-20241022-v2:0` (AWS Bedrock)

**Endpoint:** `POST /api/ai/chat`

**Request Format:**
```json
{
  "message": "User's question",
  "conversationHistory": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ]
}
```

**Response Format:**
```json
{
  "success": true,
  "response": "AI assistant's response text"
}
```

**Parameters:**
- `max_tokens`: 1024
- `anthropic_version`: "bedrock-2023-05-31"
- Maintains conversation history for context

## Example Interactions

### Example 1: Recycling Tips
**User:** "How to reduce waste?"

**Assistant:** Provides comprehensive tips on:
- Reducing single-use items
- Buying in bulk
- Composting organic waste
- Reusing containers
- Choosing products with minimal packaging

### Example 2: Collection Schedule
**User:** "Bin collection schedule"

**Assistant:** Explains:
- Wet waste: Monday, Wednesday, Friday
- Dry waste: Tuesday, Saturday
- Hazardous waste: First Sunday of month
- Bulk waste: On-demand pickup

### Example 3: Waste Segregation
**User:** "What goes in the dry waste bin?"

**Assistant:** Lists items like:
- Paper and cardboard
- Plastic bottles and containers
- Metal cans
- Glass bottles
- Clean packaging materials

### Example 4: Issue Reporting
**User:** "Report an issue"

**Assistant:** Guides through:
- Types of issues that can be reported
- Information needed for the report
- Expected response time
- How to track the issue

## Conversation Context

The assistant maintains conversation history to provide contextual responses:
- Remembers previous questions in the session
- Can reference earlier parts of the conversation
- Provides follow-up information naturally

## Response Style

- **Helpful:** Provides actionable information
- **Concise:** Gets to the point quickly
- **Environmentally Conscious:** Promotes sustainable practices
- **User-Friendly:** Uses simple, clear language
- **Structured:** Uses bullet points and lists for clarity

## Integration Points

The AI Assistant integrates with:
1. **Frontend Chat Interface** - Real-time messaging UI
2. **AWS Bedrock** - Claude 3.5 Sonnet model
3. **Backend API** - Handles requests and responses
4. **Conversation History** - Maintains context across messages

## Error Handling

If the AI service encounters an error:
- Returns a friendly error message
- Suggests trying again
- Logs error details for debugging
- Maintains conversation state

## Future Enhancements

Potential improvements:
- Integration with real-time bin data
- Personalized recommendations based on user history
- Multi-language support
- Voice input/output capabilities
- Proactive alerts and reminders
