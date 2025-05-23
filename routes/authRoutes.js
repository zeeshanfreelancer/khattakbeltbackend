// src/server/routes/authRoutes.js
import express from 'express';
import { register, login, getMe, updateDetails, updateProfilePic } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import {protect} from '../helpers/protect.js';

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes example
router.get('/me', protect, getMe);
router.put('/update-profile-pic', protect, upload.single('profilePic'), updateProfilePic);
router.put('/updatedetails', protect, updateDetails);
// router.put('/updatepassword', protect, updatePassword);

export default router;