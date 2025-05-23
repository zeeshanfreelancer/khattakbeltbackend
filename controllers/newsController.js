const News = require('../models/news');
const { cloudinary } = require('../config/cloudinary');

// Create news (with image upload)
exports.createNews = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    let imageUrl = '';

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const news = await News.create({
      title,
      content,
      category,
      imageUrl,
      author: req.user.id,
    });

    res.status(201).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

// Get all news
exports.getNews = async (req, res, next) => {
  try {
    const news = await News.find().populate('author', 'username');
    res.status(200).json({ success: true, count: news.length, data: news });
  } catch (err) {
    next(err);
  }
};