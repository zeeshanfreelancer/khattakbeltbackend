// models/News.js
import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  excerpt: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Admin' },
  category: { type: String, default: 'Infrastructure' },
  imageBase64: { type: String, default: '' },
  date: {
    type: String,
    default: () => new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

const News = mongoose.model('News', newsSchema);
export default News;
