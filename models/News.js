import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [200, 'Excerpt cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'politics', 'business', 'health', 'technology',
      'entertainment', 'science', 'history', 'sports',
      'education', 'culture', 'arts', 'travel'
    ],
    default: 'politics'
  },
  image: {
    data: {
      type: Buffer,
      required: [true, 'Image data is required']
    },
    contentType: {
      type: String,
      required: [true, 'Image content type is required']
    }
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments (assuming you have a Comment model with `news` as foreign key)
newsSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'news',
  justOne: false
});

const News = mongoose.model('News', newsSchema);

export default News;
