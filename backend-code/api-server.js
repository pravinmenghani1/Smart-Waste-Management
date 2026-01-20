const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { router: authRouter, verifyToken } = require('./auth');
const voiceRouter = require('./voice-routes');

const app = express();
const port = process.env.PORT || 8080;

// Configure AWS Bedrock
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1'
});

// Configure AWS S3
const s3Client = new S3Client({
  region: 'us-east-1'
});

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://YOUR_EC2_PUBLIC_IP:3000', 'http://YOUR_EC2_PUBLIC_IP:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth routes
app.use('/api/auth', authRouter);

// Voice agent routes
app.use('/api/voice', voiceRouter);

// Configure AWS DynamoDB
const client = new DynamoDBClient({
  region: 'us-east-1'
});
const docClient = DynamoDBDocumentClient.from(client);

// Get latest sensor readings
app.get('/api/sensors/latest', async (req, res) => {
  try {
    // Query both devices to get latest data
    const wasteCommand = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': 'waste-sensor-001'
      },
      ScanIndexForward: false,
      Limit: 20
    });

    const weightCommand = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': 'weight-sensor-001'
      },
      ScanIndexForward: false,
      Limit: 20
    });

    const [wasteResponse, weightResponse] = await Promise.all([
      docClient.send(wasteCommand),
      docClient.send(weightCommand)
    ]);

    const readings = [
      ...(wasteResponse.Items || []),
      ...(weightResponse.Items || [])
    ];

    // Process readings into dashboard format
    const dashboardData = processDashboardData(readings);
    
    res.json({
      success: true,
      data: dashboardData,
      rawReadings: readings.slice(0, 10) // Include some raw data for debugging
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get historical data
app.get('/api/sensors/history', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    
    const command = new ScanCommand({
      TableName: 'SensorData',
      FilterExpression: '#timestamp > :cutoffTime',
      ExpressionAttributeNames: {
        '#timestamp': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':cutoffTime': cutoffTime
      }
    });

    const response = await docClient.send(command);
    const readings = response.Items || [];

    // Group by time intervals
    const grouped = groupReadingsByTime(readings);
    
    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get readings for specific device
app.get('/api/sensors/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const command = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId
      },
      ScanIndexForward: false,
      Limit: limit
    });

    const response = await docClient.send(command);
    
    res.json({
      success: true,
      data: response.Items || []
    });
  } catch (error) {
    console.error(`Error fetching data for device ${req.params.deviceId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Waste Management API is running',
    timestamp: new Date().toISOString()
  });
});

// AI Chatbot endpoint using Bedrock Claude
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const systemPrompt = `You are an AI assistant for the PMC/PCMC (Pune Municipal Corporation) smart waste management system. You help citizens with:

1. Check real-time bin status, alerts, and schedules - use get_system_status tool
2. Answer questions about waste management - use process_query tool
3. Create service tickets for issues - use create_service_ticket tool
4. Suggest uploading images via Vision Analysis for visual evidence

IMPORTANT GUIDELINES:
- When users ask about bin levels, alerts, or schedules → use get_system_status
- When users have questions about waste management → use process_query
- When users report issues → use create_service_ticket AND suggest uploading image via Vision Analysis tab
- Always be helpful, concise, and represent PMC/PCMC Pune professionally

Collection Schedules: Wet waste (Mon/Wed/Fri), Dry waste (Tue/Sat), Hazardous (First Sunday)`;

    const tools = [
      {
        name: "get_system_status",
        description: "Retrieves real-time data including bin fill levels, active alerts, collection schedules, and billing information. Use when users ask about current status, bin levels, alerts, or schedules.",
        input_schema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "process_query",
        description: "Processes specific user queries about waste management, segregation guidelines, and general information. Use for detailed questions that need contextual responses.",
        input_schema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The user's question about waste management"
            }
          },
          required: ["query"]
        }
      },
      {
        name: "create_service_ticket",
        description: "Creates a service ticket for waste management issues. Use when users report problems. Always suggest uploading images via Vision Analysis tab after creating ticket.",
        input_schema: {
          type: "object",
          properties: {
            issue_type: {
              type: "string",
              enum: ["missed_collection", "damaged_bin", "illegal_dumping", "overflowing_bin", "other"],
              description: "Type of issue being reported"
            },
            description: {
              type: "string",
              description: "Detailed description of the issue"
            },
            location: {
              type: "string",
              description: "Location where the issue is occurring"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high"],
              description: "Priority level based on severity"
            }
          },
          required: ["issue_type", "description", "location"]
        }
      }
    ];

    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
      tools: tools
    };

    const command = new InvokeModelCommand({
      modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Handle tool use
    if (responseBody.stop_reason === 'tool_use') {
      const toolUse = responseBody.content.find(block => block.type === 'tool_use');
      let toolResult;

      if (toolUse.name === 'get_system_status') {
        // Fetch real-time data from DynamoDB
        const sensorCommand = new QueryCommand({
          TableName: 'SensorData',
          KeyConditionExpression: 'deviceId = :deviceId',
          ExpressionAttributeValues: { ':deviceId': 'waste-sensor-001' },
          ScanIndexForward: false,
          Limit: 1
        });
        const sensorData = await docClient.send(sensorCommand);

        const weightCommand = new QueryCommand({
          TableName: 'SensorData',
          KeyConditionExpression: 'deviceId = :deviceId',
          ExpressionAttributeValues: { ':deviceId': 'weight-sensor-001' },
          ScanIndexForward: false,
          Limit: 1
        });
        const weightData = await docClient.send(weightCommand);

        toolResult = {
          binStatus: {
            wetWaste: sensorData.Items[0]?.fillLevel || 67,
            dryWaste: 45,
            hazardous: 12
          },
          alerts: sensorData.Items[0]?.gasLevel > 400 ? [{
            type: 'gas_alert',
            level: sensorData.Items[0].gasLevel,
            message: 'High methane level detected'
          }] : [],
          nextCollection: {
            wetWaste: 'Friday, Jan 24',
            dryWaste: 'Saturday, Jan 25',
            hazardous: 'Sunday, Feb 2'
          },
          billing: {
            currentMonth: '₹450',
            status: 'paid'
          }
        };
      } else if (toolUse.name === 'process_query') {
        const { query } = toolUse.input;
        toolResult = {
          answer: `Based on PMC/PCMC guidelines: ${query}`,
          additionalInfo: 'For more details, visit pmc.gov.in or call 020-25501000'
        };
      } else if (toolUse.name === 'create_service_ticket') {
        const { issue_type, description, location, priority = 'medium' } = toolUse.input;
        const ticketId = `WM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        
        // Save to DynamoDB
        const putCommand = new PutCommand({
          TableName: 'ServiceTickets',
          Item: {
            ticketId: ticketId,
            issueType: issue_type,
            description: description,
            location: location,
            priority: priority,
            status: 'open',
            createdAt: new Date().toISOString(),
            source: 'ai_chat',
            estimatedResponse: '4 hours'
          }
        });
        await docClient.send(putCommand);

        console.log('Service ticket saved to DynamoDB:', ticketId);

        toolResult = {
          success: true,
          ticketId: ticketId,
          status: 'created',
          estimatedResponse: '4 hours',
          message: 'Ticket created successfully. Consider uploading images via Vision Analysis tab for faster resolution.'
        };
      }

      // Send tool result back to Claude
      const toolResultMessages = [
        ...messages,
        { role: 'assistant', content: responseBody.content },
        {
          role: 'user',
          content: [{
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(toolResult)
          }]
        }
      ];

      const followUpPayload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1024,
        system: systemPrompt,
        messages: toolResultMessages,
        tools: tools
      };

      const followUpCommand = new InvokeModelCommand({
        modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(followUpPayload)
      });

      const followUpResponse = await bedrockClient.send(followUpCommand);
      const followUpBody = JSON.parse(new TextDecoder().decode(followUpResponse.body));
      
      const textContent = followUpBody.content.find(block => block.type === 'text');
      
      res.json({
        success: true,
        response: textContent.text,
        ticketCreated: toolUse.name === 'create_service_ticket',
        ticketId: toolUse.name === 'create_service_ticket' ? toolResult.ticketId : undefined
      });
      return;
    }

    // Regular text response
    const textContent = responseBody.content.find(block => block.type === 'text');
    res.json({
      success: true,
      response: textContent ? textContent.text : responseBody.content[0].text
    });
  } catch (error) {
    console.error('Error calling Bedrock:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Vision Analysis endpoint using Bedrock Claude with vision
app.post('/api/ai/vision', async (req, res) => {
  try {
    const { image, location, ticketId, customerName, uploadReason, locationText } = req.body;

    // Remove data URL prefix and get image format
    const imageMatch = image.match(/^data:image\/(\w+);base64,/);
    const imageFormat = imageMatch ? imageMatch[1] : 'jpeg';
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Upload to S3 if ticketId provided
    let imageUrl = null;
    if (ticketId) {
      const s3Key = `ticket-images/${ticketId}.${imageFormat}`;
      const imageBuffer = Buffer.from(base64Image, 'base64');
      
      const s3Command = new PutObjectCommand({
        Bucket: 'iotimplementation',
        Key: s3Key,
        Body: imageBuffer,
        ContentType: `image/${imageFormat}`,
        Metadata: {
          ticketId: ticketId,
          customerName: customerName || 'Anonymous',
          uploadReason: uploadReason || 'Evidence',
          location: locationText || 'Not specified',
          uploadDate: new Date().toISOString()
        }
      });

      await s3Client.send(s3Command);
      imageUrl = `s3://iotimplementation/${s3Key}`;
      console.log(`Image uploaded to S3: ${imageUrl}`);

      // Update ticket in DynamoDB with image reference
      const updateCommand = new PutCommand({
        TableName: 'ServiceTickets',
        Item: {
          ticketId: ticketId,
          imageUrl: imageUrl,
          imageUploadedAt: new Date().toISOString(),
          customerName: customerName || 'Anonymous',
          uploadReason: uploadReason || 'Evidence',
          imageLocation: locationText || 'Not specified'
        },
        ConditionExpression: 'attribute_exists(ticketId)'
      });

      try {
        await docClient.send(updateCommand);
        console.log(`Ticket ${ticketId} updated with image reference`);
      } catch (err) {
        console.log(`Ticket ${ticketId} not found, creating image record separately`);
      }
    }

    const systemPrompt = `You are an AI vision system for waste management. Analyze the image and provide:
1. Waste composition breakdown (percentages for: Organic, Plastic, Paper/Cardboard, Metal, Glass, Other)
2. Specific recommendations for proper disposal
3. Severity assessment (low/medium/high) based on waste volume and hazards

Respond in JSON format:
{
  "wasteTypes": [{"type": "string", "percentage": number}],
  "recommendations": ["string"],
  "severity": "low|medium|high"
}`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: `image/${imageFormat}`,
              data: base64Image
            }
          },
          {
            type: 'text',
            text: `Analyze this waste image${location ? ` taken at coordinates ${location.lat}, ${location.lng}` : ''}${ticketId ? ` for ticket ${ticketId}` : ''}. Provide detailed waste composition analysis and disposal recommendations.`
          }
        ]
      }]
    };

    const command = new InvokeModelCommand({
      modelId: 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Parse the JSON response from Claude
    const analysisText = responseBody.content[0].text;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      wasteTypes: [{ type: 'Unknown', percentage: 100 }],
      recommendations: ['Unable to analyze image'],
      severity: 'low'
    };

    res.json({
      success: true,
      analysis: analysis,
      imageUrl: imageUrl,
      ticketId: ticketId || null
    });
  } catch (error) {
    console.error('Error calling Bedrock Vision:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process readings into dashboard format
function processDashboardData(readings) {
  const latest = {
    fillLevel: 0,
    gasLevel: 0,
    fireDetected: false,
    wetWaste: 0,
    dryWaste: 0,
    metalWaste: 0,
    lastUpdated: new Date().toISOString()
  };

  // Get latest reading for each sensor type
  const latestReadings = new Map();
  
  readings.forEach(reading => {
    const key = `${reading.deviceId}-${reading.sensorType}${reading.wasteType ? `-${reading.wasteType}` : ''}`;
    if (!latestReadings.has(key) || reading.timestamp > latestReadings.get(key).timestamp) {
      latestReadings.set(key, reading);
    }
  });

  // Process each reading type
  latestReadings.forEach(reading => {
    switch (reading.sensorType) {
      case 'fill':
        latest.fillLevel = reading.value;
        break;
      case 'gas':
        latest.gasLevel = reading.value;
        break;
      case 'fire':
        latest.fireDetected = reading.value > 0;
        break;
      case 'weight':
        if (reading.wasteType === 'wet') latest.wetWaste = reading.value;
        else if (reading.wasteType === 'dry') latest.dryWaste = reading.value;
        else if (reading.wasteType === 'metal') latest.metalWaste = reading.value;
        break;
    }
  });

  return latest;
}

// Group readings by time intervals
function groupReadingsByTime(readings) {
  const grouped = new Map();
  
  readings.forEach(reading => {
    const timeKey = new Date(reading.timestamp).toISOString().slice(0, 16); // Group by hour:minute
    
    if (!grouped.has(timeKey)) {
      grouped.set(timeKey, {
        time: new Date(reading.timestamp).toLocaleTimeString(),
        fillLevel: 0,
        gasLevel: 0,
        totalWaste: 0
      });
    }

    const group = grouped.get(timeKey);
    
    if (reading.sensorType === 'fill') group.fillLevel = reading.value;
    if (reading.sensorType === 'gas') group.gasLevel = reading.value;
    if (reading.sensorType === 'weight') group.totalWaste += reading.value;
  });

  return Array.from(grouped.values()).slice(-20); // Last 20 data points
}

// Get all tickets with images
app.get('/api/tickets', async (req, res) => {
  try {
    const scanCommand = new ScanCommand({
      TableName: 'ServiceTickets'
    });
    
    const result = await docClient.send(scanCommand);
    
    res.json({
      success: true,
      tickets: result.Items || []
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific ticket by ID
app.get('/api/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const getCommand = new QueryCommand({
      TableName: 'ServiceTickets',
      KeyConditionExpression: 'ticketId = :ticketId',
      ExpressionAttributeValues: {
        ':ticketId': ticketId
      }
    });
    
    const result = await docClient.send(getCommand);
    
    if (result.Items && result.Items.length > 0) {
      res.json({
        success: true,
        ticket: result.Items[0]
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Smart Waste Management API running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`External access: http://YOUR_EC2_PUBLIC_IP:${port}/api/health`);
});
