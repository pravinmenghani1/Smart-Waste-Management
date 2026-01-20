# Vision Analysis - Ticket Image Linking Feature

## ✅ Implementation Complete

Vision Analysis now supports linking images to service tickets with full metadata capture and S3 storage.

---

## Features Implemented

### 1. Ticket Information Form
Users can now provide:
- **Ticket ID** - Links image to existing service ticket (e.g., WM-2026-082984)
- **Customer Name** - Identifies who uploaded the image
- **Location** - Text description of location (e.g., "Baner, Pune")
- **Upload Reason** - Purpose of upload (e.g., "Evidence for illegal dumping complaint")

### 2. Image Storage in S3
- **Bucket:** `iotimplementation`
- **Path:** `ticket-images/{ticketId}.{format}`
- **Formats Supported:** JPEG, PNG, WebP
- **Metadata Stored:**
  - ticketId
  - customerName
  - uploadReason
  - location
  - uploadDate

### 3. DynamoDB Integration
When image is uploaded with ticket ID:
- Updates ServiceTickets table with image reference
- Stores: imageUrl, imageUploadedAt, customerName, uploadReason, imageLocation

### 4. API Endpoints

#### POST /api/ai/vision
**Enhanced Request:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "location": {"lat": 18.5204, "lng": 73.8567},
  "ticketId": "WM-2026-082984",
  "customerName": "John Doe",
  "uploadReason": "Evidence for illegal dumping",
  "locationText": "Baner, Pune"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "wasteTypes": [...],
    "recommendations": [...],
    "severity": "high"
  },
  "imageUrl": "s3://iotimplementation/ticket-images/WM-2026-082984.jpeg",
  "ticketId": "WM-2026-082984"
}
```

#### GET /api/tickets
**Purpose:** Get all tickets with images

**Response:**
```json
{
  "success": true,
  "tickets": [
    {
      "ticketId": "WM-2026-082984",
      "issueType": "illegal_dumping",
      "description": "...",
      "location": "Baner",
      "priority": "high",
      "status": "open",
      "createdAt": "2026-01-20T04:24:42.984Z",
      "imageUrl": "s3://iotimplementation/ticket-images/WM-2026-082984.jpeg",
      "imageUploadedAt": "2026-01-20T04:50:00.000Z",
      "customerName": "John Doe",
      "uploadReason": "Evidence for illegal dumping",
      "imageLocation": "Baner, Pune"
    }
  ]
}
```

#### GET /api/tickets/:ticketId
**Purpose:** Get specific ticket by ID

**Example:** `GET /api/tickets/WM-2026-082984`

**Response:**
```json
{
  "success": true,
  "ticket": {
    "ticketId": "WM-2026-082984",
    "imageUrl": "s3://iotimplementation/ticket-images/WM-2026-082984.jpeg",
    ...
  }
}
```

---

## User Workflow

### Step 1: Create Ticket via AI Assistant
```
User: "There is illegal dumping near Baner"
AI: "I've created service ticket WM-2026-082984. 
     Please use Vision Analysis tab to upload photos."
```

### Step 2: Upload Image in Vision Analysis
1. Navigate to Vision Analysis tab
2. Upload image of the issue
3. Fill in ticket information:
   - Ticket ID: WM-2026-082984
   - Your Name: John Doe
   - Location: Baner, Pune
   - Reason: Evidence for illegal dumping complaint
4. Click "Analyze with AI"

### Step 3: Image Processing
- Image uploaded to S3 as `WM-2026-082984.jpeg`
- AI analyzes waste composition
- Ticket updated with image reference
- Metadata stored in DynamoDB

### Step 4: View Tickets
- Access `/api/tickets` to see all tickets
- Access `/api/tickets/WM-2026-082984` for specific ticket
- View image URL and metadata

---

## S3 Storage Structure

```
s3://iotimplementation/
└── ticket-images/
    ├── WM-2026-082984.jpeg
    │   Metadata:
    │   - ticketId: WM-2026-082984
    │   - customerName: John Doe
    │   - uploadReason: Evidence for illegal dumping
    │   - location: Baner, Pune
    │   - uploadDate: 2026-01-20T04:50:00.000Z
    │
    ├── WM-2026-123456.png
    └── WM-2026-789012.jpeg
```

---

## DynamoDB Schema Update

### ServiceTickets Table
```json
{
  "ticketId": "WM-2026-082984",
  "issueType": "illegal_dumping",
  "description": "Illegal dumping reported in Baner area",
  "location": "Baner",
  "priority": "high",
  "status": "open",
  "createdAt": "2026-01-20T04:24:42.984Z",
  "source": "ai_chat",
  "estimatedResponse": "4 hours",
  
  // NEW FIELDS - Added when image uploaded
  "imageUrl": "s3://iotimplementation/ticket-images/WM-2026-082984.jpeg",
  "imageUploadedAt": "2026-01-20T04:50:00.000Z",
  "customerName": "John Doe",
  "uploadReason": "Evidence for illegal dumping",
  "imageLocation": "Baner, Pune"
}
```

---

## Frontend UI Changes

### Vision Analysis Component
**New Section:** "Link to Service Ticket (Optional)"

**Fields:**
1. **Ticket ID** - Input field for ticket number
2. **Your Name** - Customer identification
3. **Location** - Text location description
4. **Reason for Upload** - Purpose of image submission

**Visual Design:**
- Grouped in a bordered section with ticket icon
- Optional fields (can analyze without ticket)
- Clear labels and placeholders
- Responsive 2-column grid layout

---

## Backend Changes

### New Dependencies
```json
{
  "@aws-sdk/client-s3": "^3.x.x"
}
```

### New Imports
```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
```

### S3 Client Configuration
```javascript
const s3Client = new S3Client({
  region: 'us-east-1'
});
```

### Enhanced Vision Endpoint
- Accepts ticket metadata
- Uploads image to S3 with metadata
- Updates DynamoDB ticket record
- Returns image URL in response

### New Ticket Endpoints
- `GET /api/tickets` - List all tickets
- `GET /api/tickets/:ticketId` - Get specific ticket

---

## Testing

### Test 1: Upload Image with Ticket
```bash
# Create ticket first
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"There is illegal dumping near Baner"}'

# Response: ticketId: WM-2026-082984

# Upload image via Vision Analysis UI
# - Upload image
# - Enter ticket ID: WM-2026-082984
# - Enter name: John Doe
# - Enter location: Baner, Pune
# - Enter reason: Evidence
# - Click Analyze

# Verify S3 upload
aws s3 ls s3://iotimplementation/ticket-images/

# Verify ticket update
curl http://localhost:8080/api/tickets/WM-2026-082984
```

### Test 2: View All Tickets
```bash
curl http://localhost:8080/api/tickets
```

### Test 3: Upload Without Ticket
```bash
# Upload image without entering ticket ID
# Should still analyze but not save to S3
```

---

## Benefits

### For Citizens
✅ Easy evidence submission
✅ Link images to existing complaints
✅ Track submissions with ticket ID
✅ Provide context with metadata

### For Authorities
✅ Visual evidence for faster resolution
✅ Organized storage by ticket ID
✅ Complete metadata for each image
✅ Easy retrieval via API
✅ Audit trail with timestamps

### For System
✅ Centralized image storage in S3
✅ Scalable architecture
✅ Metadata-rich records
✅ Integration with existing ticket system

---

## Access URLs

**Frontend:** https://viki-nonbacterial-chelsie.ngrok-free.dev

**Test Workflow:**
1. Go to AI Assistant tab
2. Report an issue: "There is illegal dumping near Baner"
3. Note the ticket ID from response
4. Go to Vision Analysis tab
5. Upload image and enter ticket ID
6. View analysis results with S3 URL

**API Endpoints:**
- Vision Analysis: `POST /api/ai/vision`
- List Tickets: `GET /api/tickets`
- Get Ticket: `GET /api/tickets/:ticketId`

---

## Files Modified

1. `/home/ubuntu/arch/app-code/src/components/dashboard/VisionAnalysis.tsx`
   - Added ticket information form
   - Added state for ticket metadata
   - Updated API call to include metadata

2. `/home/ubuntu/arch/backend-code/api-server.js`
   - Added S3 client import and configuration
   - Enhanced `/api/ai/vision` endpoint
   - Added `/api/tickets` endpoint
   - Added `/api/tickets/:ticketId` endpoint
   - Implemented S3 upload with metadata
   - Implemented DynamoDB ticket update

3. `/home/ubuntu/arch/backend-code/package.json`
   - Added `@aws-sdk/client-s3` dependency

---

## Next Steps

### Immediate Enhancements
1. **Image Gallery** - Create UI to view all ticket images
2. **Image Preview** - Show uploaded images in ticket list
3. **Download Images** - Generate presigned URLs for image download
4. **Multiple Images** - Support multiple images per ticket
5. **Image Compression** - Optimize images before upload

### Future Features
1. **Image Annotations** - Allow marking areas in images
2. **Before/After** - Support before and after images
3. **Mobile Upload** - Optimize for mobile camera
4. **Geotag Verification** - Verify location matches ticket
5. **Auto-linking** - Suggest tickets based on location

---

## Success Metrics

✅ Image upload to S3 working
✅ Ticket linking functional
✅ Metadata capture complete
✅ DynamoDB integration successful
✅ API endpoints operational
✅ Frontend form implemented
✅ End-to-end workflow tested

**Status: FULLY OPERATIONAL** 🎉
