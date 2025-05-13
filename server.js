const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const usersModule = require('./routes/users');
const authRoutes = require('./routes/auth');
const lessonsRoutes = require('./routes/lessons');
const progressRoutes = require('./routes/progress');

// Direct endpoint to create a test user AND generate a token (bypassing normal auth)
app.get('/api/direct-login', async (req, res) => {
  try {
    // Clear existing users
    while(usersModule.users.length > 0) {
      usersModule.users.pop();
    }
    
    // Create test user with simple credentials
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userId = 'test-' + Date.now(); 
    const email = 'test@example.com';
    
    const testUser = {
      id: userId,
      name: 'Test User',
      email: email,
      password: hashedPassword,
      progress: {
        lessonsCompleted: [],
        exercisesCompleted: 0,
        level: 'beginner',
        achievements: []
      },
      createdAt: new Date()
    };
    
    // Add to users array
    usersModule.users.push(testUser);
    
    console.log('Test user created:', {id: userId, email});
    
    // Generate a token (same as the login process would)
    const payload = {
      user: {
        id: userId
      }
    };
    
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: 3600 }
    );
    
    // Detailed logging
    console.log('Direct login endpoint:');
    console.log('- User created:', { id: userId, email });
    console.log('- Token generated');
    console.log('- Total users:', usersModule.users.length);
    console.log('- User info (without password):', {...testUser, password: '[HIDDEN]'});
    console.log('- User login credentials:', {email, password});
    
    // Send back login info and token
    return res.json({
      message: 'Auto-login successful',
      credentials: {
        email,
        password
      },
      token,
      userId
    });
  } catch (err) {
    console.error('Error in direct-login route:', err);
    res.status(500).json({ error: 'Server error creating login session' });
  }
});

// Create a direct test route for adding and checking users (FOR DEBUGGING ONLY)
app.get('/api/debug/setup-test-user', async (req, res) => {
  try {
    // Clear existing users
    while(usersModule.users.length > 0) {
      usersModule.users.pop();
    }
    
    // Create test user with simple credentials
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = {
      id: 'test123',
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      progress: {
        lessonsCompleted: [],
        exercisesCompleted: 0,
        level: 'beginner',
        achievements: []
      },
      createdAt: new Date()
    };
    
    // Add to users array
    usersModule.users.push(testUser);
    
    console.log('Test user created via API route');
    console.log('Test login: email=test@example.com, password=test123');
    
    return res.json({ 
      message: 'Test user created. Try logging in with email: test@example.com and password: test123',
      usersCount: usersModule.users.length,
      users: usersModule.users.map(u => ({ id: u.id, email: u.email }))
    });
  } catch (err) {
    console.error('Error in setup-test-user route:', err);
    res.status(500).json({ error: 'Server error creating test user' });
  }
});

// Add a test user for debugging - make sure it runs BEFORE routes are defined
(async () => {
  try {
    console.log('Adding test user...');
    
    // Clear existing users for testing
    while(usersModule.users.length > 0) {
      usersModule.users.pop();
    }
    
    // Create test user
    const testUser = {
      id: 'test123',
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      progress: {
        lessonsCompleted: [],
        exercisesCompleted: 0,
        level: 'beginner',
        achievements: []
      },
      createdAt: new Date()
    };
    
    // Add test user
    usersModule.users.push(testUser);
    console.log('Test user added successfully!');
    console.log('LOGIN CREDENTIALS:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    // Log all users for debugging
    console.log('All users:', usersModule.users.map(u => ({ id: u.id, email: u.email })));
  } catch (err) {
    console.error('Error creating test user:', err);
  }
})();

// Define Routes
app.use('/api/users', usersModule.router);
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/progress', progressRoutes);

// Socket.io for real-time speech recognition
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle audio stream for speech recognition
  socket.on('audioData', (data) => {
    // Here we would process audio data with a speech recognition service
    // For demo purposes, echo back a sample response
    socket.emit('recognitionResult', {
      text: 'नमस्ते, आप कैसे हैं?',
      confidence: 0.95
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 