const express = require('express');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configure AWS Cognito
const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1'
});

const USER_POOL_ID = 'us-east-1_DAQ8siApb';
const CLIENT_ID = '39pjnu43u04ju374bekro15e0d';
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key-here';

// Helper function to create secret hash
function createSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'citizen' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const params = {
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'custom:role',
          Value: role
        }
      ]
    };

    const result = await cognito.signUp(params).promise();
    
    res.json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      userId: result.UserSub
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      error: error.message || 'Registration failed' 
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };

    const authResult = await cognito.initiateAuth(params).promise();
    
    if (authResult.AuthenticationResult) {
      // Get user attributes
      const userParams = {
        AccessToken: authResult.AuthenticationResult.AccessToken
      };
      
      const userInfo = await cognito.getUser(userParams).promise();
      
      // Extract user data
      const userData = {
        email: email,
        role: userInfo.UserAttributes.find(attr => attr.Name === 'custom:role')?.Value || 'citizen',
        userId: userInfo.Username
      };

      // Create JWT token
      const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

      res.json({
        success: true,
        token: token,
        user: userData,
        cognitoTokens: {
          accessToken: authResult.AuthenticationResult.AccessToken,
          refreshToken: authResult.AuthenticationResult.RefreshToken,
          idToken: authResult.AuthenticationResult.IdToken
        }
      });
    } else {
      res.status(401).json({ error: 'Authentication failed' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      error: error.message || 'Login failed' 
    });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = { router, verifyToken };
