const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createNews, getNews } = require('../controllers/newsController');
const { upload } = require('../config/cloudinary');

router.route('/')
  .get(getNews)
  .post(protect, upload.single('image'), createNews);

module.exports = router;