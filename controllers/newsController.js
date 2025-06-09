import News from '../models/News.js';
import User from '../models/User.js';

// Helper to convert image buffer to base64 data URI
const formatImage = (news) => {
  const obj = news.toObject();
  if (news.image?.data) {
    obj.imageUrl = `data:${news.image.contentType};base64,${news.image.data.toString('base64')}`;
  }
  return obj;
};

// Helper for multer image
const processImage = (file) => {
  if (!file) return null;
  return {
    data: file.buffer,
    contentType: file.mimetype
  };
};

// @desc    Get all news
// @route   GET /news
// @access  Public
export const getNews = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category && category !== 'all' ? { category } : {};

    const newsList = await News.find(query)
      .sort({ createdAt: -1 })
      .populate('author', 'username firstName lastName profilePic');

    const formattedNews = newsList.map(formatImage);

    res.status(200).json({
      success: true,
      count: formattedNews.length,
      data: formattedNews
    });
  } catch (err) {
    console.error('❌ Get News Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get single news by ID
// @route   GET /news/:id
// @access  Public
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'username firstName lastName profilePic');

    if (!news) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    res.status(200).json({
      success: true,
      data: formatImage(news)
    });
  } catch (err) {
    console.error('❌ Get News By ID Error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid news ID' });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Create new news article
// @route   POST /news
// @access  Private
export const createNews = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { title, excerpt, content, category, isFeatured } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const news = await News.create({
      title,
      excerpt,
      content,
      category,
      image: processImage(req.file),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      author: req.user.id
    });

    await news.populate('author', 'username firstName lastName profilePic');

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      data: formatImage(news)
    });
  } catch (err) {
    console.error('❌ Create News Error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Update news
// @route   PUT /news/:id
// @access  Private
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ success: false, message: 'News article not found' });
    }

    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this article' });
    }

    const { title, excerpt, content, category, isFeatured } = req.body;
    const updateFields = {
      title,
      excerpt,
      content,
      category,
      isFeatured: isFeatured === 'true' || isFeatured === true
    };

    if (req.file) {
      updateFields.image = processImage(req.file);
    }

    const updatedNews = await News.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('author', 'username firstName lastName profilePic');

    res.status(200).json({
      success: true,
      message: 'News article updated successfully',
      data: formatImage(updatedNews)
    });
  } catch (err) {
    console.error('❌ Update News Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Delete news
// @route   DELETE /news/:id
// @access  Private
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    if (news.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article'
      });
    }

    await news.deleteOne();

    res.status(200).json({ success: true, message: 'News article removed' });
  } catch (err) {
    console.error('❌ Delete News Error:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
