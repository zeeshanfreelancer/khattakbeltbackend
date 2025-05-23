const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'] },
  content: { type: String, required: [true, 'Content is required'] },
  category: { 
    type: String, 
    required: true,
    enum: ['sports', 'education', 'culture', 'arts', 'travel'],
  },
  imageUrl: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('News', newsSchema);