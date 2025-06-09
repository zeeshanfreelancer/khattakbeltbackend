import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updateProfilePic
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';
import {
  registerValidator,
  loginValidator
} from '../validators/authValidators.js';

const router = express.Router();

// @route   POST /auth/register
// @desc    Register user
router.post('/register', registerValidator, register);

// @route   POST /auth/login
// @desc    Login user
router.post('/login', loginValidator, login);

// @route   GET /auth/me
// @desc    Get current logged-in user
router.get('/me', protect, getMe);

// @route   POST /auth/logout
// @desc    Logout user
router.post('/logout', protect, logout);

// @route   PUT /auth/updatedetails
// @desc    Update user profile data (e.g., name, email)
router.put('/updatedetails', protect, updateDetails);

// @route   PUT /auth/updateprofilepic
// @desc    Update user profile picture
router.put('/updateprofilepic', protect, updateProfilePic);

export default router;
