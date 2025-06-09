import express from 'express';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} from '../controllers/newsController.js';

import { protect } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();

// Multer setup for image uploads (max 1MB, JPEG/PNG only)
const upload = multer({
  limits: { fileSize: 1024 * 1024 }, // 1MB
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'), false);
    }
  }
});

// @route   GET /news
// @desc    Get all news
// @access  Public
router.get('/', getNews);

// @route   POST /news
// @desc    Create news post
// @access  Private (auth required)
router.post('/', protect, upload.single('image'), createNews);

// @route   GET /news/:id
// @desc    Get a single news post
// @access  Public
router.get('/:id', getNewsById);

// @route   PUT /news/:id
// @desc    Update a news post
// @access  Private (auth required)
router.put('/:id', protect, upload.single('image'), updateNews);

// @route   DELETE /news/:id
// @desc    Delete a news post
// @access  Private (auth required)
router.delete('/:id', protect, deleteNews);

export default router;
