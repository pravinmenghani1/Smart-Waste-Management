const express = require('express');
const router = express.Router();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

// Get current system context for voice agent
router.get('/context', async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user';
    
    // Fetch latest sensor data
    const wasteCommand = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: { ':deviceId': 'waste-sensor-001' },
      ScanIndexForward: false,
      Limit: 1
    });

    const weightCommand = new QueryCommand({
      TableName: 'SensorData',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: { ':deviceId': 'weight-sensor-001' },
      ScanIndexForward: false,
      Limit: 1
    });

    const [wasteData, weightData] = await Promise.all([
      docClient.send(wasteCommand),
      docClient.send(weightCommand)
    ]);

    const latestWaste = wasteData.Items?.[0] || {};
    const latestWeight = weightData.Items?.[0] || {};

    // Build context object
    const context = {
      timestamp: new Date().toISOString(),
      bins: {
        wetWaste: {
          fillLevel: latestWaste.value || 0,
          status: latestWaste.value > 80 ? 'critical' : latestWaste.value > 60 ? 'warning' : 'normal',
          nextCollection: 'Wednesday, January 20, 2026'
        },
        dryWaste: {
          fillLevel: 45,
          status: 'normal',
          nextCollection: 'Saturday, January 23, 2026'
        },
        metalWaste: {
          fillLevel: 23,
          status: 'normal',
          nextCollection: 'Sunday, February 7, 2026'
        }
      },
      alerts: {
        active: [],
        gasLevel: latestWaste.gasLevel || 0,
        fireDetected: false
      },
      schedule: {
        wetWaste: 'Monday, Wednesday, Friday',
        dryWaste: 'Tuesday, Saturday',
        hazardous: 'First Sunday of each month'
      },
      billing: {
        currentBill: 45.50,
        dueDate: 'January 31, 2026',
        breakdown: {
          collection: 30.00,
          recycling: 10.00,
          environmental: 5.50
        }
      }
    };

    // Add active alerts
    if (context.alerts.gasLevel > 400) {
      context.alerts.active.push({
        type: 'gas',
        severity: 'medium',
        message: `Gas level at ${context.alerts.gasLevel} ppm, above safe threshold`
      });
    }

    if (context.bins.wetWaste.fillLevel > 80) {
      context.alerts.active.push({
        type: 'bin_full',
        severity: 'high',
        message: 'Wet waste bin is critically full'
      });
    }

    res.json({
      success: true,
      context: context
    });
  } catch (error) {
    console.error('Error fetching context:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ElevenLabs webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log('Voice webhook received:', { type, data });

    // Handle different webhook events
    switch (type) {
      case 'conversation.started':
        console.log('Conversation started:', data.conversationId);
        break;
      
      case 'conversation.ended':
        console.log('Conversation ended:', data.conversationId);
        // Log conversation for analytics
        break;
      
      case 'user.message':
        console.log('User message:', data.message);
        break;
      
      case 'agent.response':
        console.log('Agent response:', data.response);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process voice query and return structured response
router.post('/query', async (req, res) => {
  try {
    const { query, conversationId } = req.body;
    
    // Get current context
    const contextResponse = await fetch('http://localhost:8080/api/voice/context');
    const { context } = await contextResponse.json();

    // Simple query routing
    let response = '';
    const queryLower = query.toLowerCase();

    if (queryLower.includes('fill level') || queryLower.includes('how full')) {
      response = `Your wet waste bin is currently at ${context.bins.wetWaste.fillLevel}% capacity. ` +
                 `Your dry waste bin is at ${context.bins.dryWaste.fillLevel}%, and metal waste is at ${context.bins.metalWaste.fillLevel}%.`;
    } 
    else if (queryLower.includes('alert') || queryLower.includes('warning')) {
      if (context.alerts.active.length === 0) {
        response = 'There are no active alerts. All systems are functioning normally.';
      } else {
        response = `You have ${context.alerts.active.length} active alert${context.alerts.active.length > 1 ? 's' : ''}. ` +
                   context.alerts.active.map(a => a.message).join('. ');
      }
    }
    else if (queryLower.includes('collection') || queryLower.includes('pickup')) {
      response = `Your next wet waste collection is ${context.bins.wetWaste.nextCollection}. ` +
                 `Dry waste collection is ${context.bins.dryWaste.nextCollection}.`;
    }
    else if (queryLower.includes('bill') || queryLower.includes('payment')) {
      response = `Your current bill is $${context.billing.currentBill}, due by ${context.billing.dueDate}. ` +
                 `This includes $${context.billing.breakdown.collection} for collection, ` +
                 `$${context.billing.breakdown.recycling} for recycling, and ` +
                 `$${context.billing.breakdown.environmental} in environmental fees.`;
    }
    else {
      response = 'I can help you with bin fill levels, collection schedules, alerts, and billing information. What would you like to know?';
    }

    res.json({
      success: true,
      response: response,
      context: context
    });
  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Report issue via voice
router.post('/action', async (req, res) => {
  try {
    const { action, details, userId } = req.body;

    let response = '';
    let ticketId = '';

    switch (action) {
      case 'report_missed_collection':
        ticketId = `WM-${Date.now()}`;
        response = `I've created a service ticket for missed collection. Your ticket number is ${ticketId}. ` +
                   `A collection crew will be dispatched within 4 hours.`;
        break;
      
      case 'report_damaged_bin':
        ticketId = `WM-${Date.now()}`;
        response = `I've created a service ticket for bin replacement. Your ticket number is ${ticketId}. ` +
                   `A technician will contact you within 24 hours.`;
        break;
      
      case 'request_callback':
        response = 'I\'ve scheduled a callback from our support team. They will contact you within 2 hours.';
        break;
      
      default:
        response = 'I\'ve recorded your request. Our team will follow up shortly.';
    }

    // Log action to database (implement later)
    console.log('Voice action:', { action, details, userId, ticketId });

    res.json({
      success: true,
      response: response,
      ticketId: ticketId
    });
  } catch (error) {
    console.error('Action processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
