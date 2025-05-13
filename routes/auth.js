const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('./users');

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  console.log('LOGIN ATTEMPT:', { email, passwordProvided: !!password });
  console.log('USERS DATABASE:', users);
  console.log('Available users:', users.map(u => ({ id: u.id, email: u.email })));

  try {
    // Check if user exists
    const user = users.find(user => user.email === email);
    if (!user) {
      console.log('Login failed: User not found. Email does not exist in database');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log('User found:', { id: user.id, email: user.email });

    // Validate password
    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password incorrect');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log('Login successful for user:', user.id);

    // User matched, create token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        console.log('Token generated successfully');
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', (req, res) => {
  // Get token from header
  const token = req.header('x-auth-token');
  
  console.log('GET /api/auth - Token provided:', !!token);
  
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Token verified, user id:', decoded.user.id);
    
    // Get user from decoded token
    const user = users.find(user => user.id === decoded.user.id);
    
    if (!user) {
      console.log('User not found with id:', decoded.user.id);
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('User authenticated:', { id: user.id, email: user.email });
    
    // Don't send password
    const { password, ...userInfo } = user;
    res.json(userInfo);
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router; 