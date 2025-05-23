import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import fs from 'fs';

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user exists by email or username
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.trim() }
      ]
    });
    
    if (existingUser) {
      const field = existingUser.email === email.toLowerCase().trim() ? 'email' : 'username';
      return res.status(400).json({ 
        success: false, 
        message: `${field === 'email' ? 'Email' : 'Username'} already in use`,
        field
      });
    }

    // Create user with trimmed data
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    // Prepare user data for response
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userData
    });

  } catch (err) {
    console.error('Registration error:', err);
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Username'} already in use`,
        field
      });
    }
    
    // Handle other errors
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};


export const updateProfilePic = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const base64 = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;
  const dataUri = `data:${mimeType};base64,${base64}`;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic: dataUri },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile picture', error });
  }
};


export const updateDetails = async (req, res) => {
  const updates = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    // Add any other fields you want to allow updating
  };

  try {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update user details', error });
  }
};


// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};