import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  updateProfile,
  updateProfilePicture,
  deleteAccount
} from '../controllers/userController.js';

const router = express.Router();

// PUT /users/profile - Update user profile
router.route('/profile')
  .put(protect, updateProfile);

// PUT /users/profile-picture - Update profile picture  
router.route('/profile-picture')
  .put(protect, updateProfilePicture);

// DELETE /users - Delete account
router.route('/')
  .delete(protect, deleteAccount);

export default router;