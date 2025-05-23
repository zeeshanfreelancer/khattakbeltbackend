// controllers/newsController.js
import News from '../models/News.js';

// @desc    Create a news post
export const createNews = async (req, res) => {
  try {
    const news = new News(req.body);
    const savedNews = await news.save();
    res.status(201).json(savedNews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all news posts with pagination
export const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;       // Current page number
    const limit = parseInt(req.query.limit) || 10;    // Items per page
    const skip = (page - 1) * limit;

    const total = await News.countDocuments();        // Total number of news entries
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      news,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc    Get a single news post by ID
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update a news post
export const updateNews = async (req, res) => {
  try {
    const updatedNews = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedNews) return res.status(404).json({ error: 'News not found' });
    res.json(updatedNews);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete a news post
export const deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) return res.status(404).json({ error: 'News not found' });
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
