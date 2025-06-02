import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Username is required'],
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    unique: true,
    index: true,
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true,
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profilePic: {
    type: String,
    default: ''
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  aboutMe: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  experience: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  interests: {
    type: [String],
    default: []
  },
  visibility: {
    aboutMe: { type: String, enum: ['public', 'private'], default: 'private' },
    personalia: { type: String, enum: ['public', 'private'], default: 'private' },
    contact: { type: String, enum: ['public', 'private'], default: 'private' },
    skills: { type: String, enum: ['public', 'private'], default: 'private' },
    experience: { type: String, enum: ['public', 'private'], default: 'private' },
    education: { type: String, enum: ['public', 'private'], default: 'private' },
    certificates: { type: String, enum: ['public', 'private'], default: 'private' },
    interests: { type: String, enum: ['public', 'private'], default: 'private' }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
},
{
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// 🔐 Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Match password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
