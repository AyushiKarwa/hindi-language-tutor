const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock user data (in a real app, this would be a database)
const users = [];

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('Registration attempt:', { name, email });

  try {
    // Check if user already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      console.log('Registration failed: User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      progress: {
        lessonsCompleted: [],
        exercisesCompleted: 0,
        level: 'beginner',
        achievements: []
      },
      createdAt: new Date()
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Add user to our mock database
    users.push(newUser);
    
    console.log('User registered successfully:', newUser.id);
    console.log('All users after registration:', users.map(u => ({ id: u.id, email: u.email })));

    // Create JWT token
    const payload = {
      user: {
        id: newUser.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', (req, res) => {
  // Note: In a real app, this would use middleware to validate the token
  const userId = req.header('user-id');
  
  if (!userId) {
    return res.status(401).json({ msg: 'No user ID, authorization denied' });
  }

  try {
    const user = users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Don't send password
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Export both the router and the users array
module.exports = { router, users }; 