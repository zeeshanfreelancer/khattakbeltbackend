import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      aboutMe, 
      skills, 
      experience, 
      education, 
      interests,
      visibility 
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Normalize data
    const normalizedSkills = Array.isArray(skills) 
      ? skills 
      : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(s => s) : []);
    
    const normalizedInterests = Array.isArray(interests) 
      ? interests 
      : (typeof interests === 'string' ? interests.split(',').map(i => i.trim()).filter(i => i) : []);

    const updateData = {
      firstName,
      lastName,
      aboutMe: aboutMe || '',
      skills: normalizedSkills,
      experience: experience || '',
      education: education || '',
      interests: normalizedInterests,
      visibility: visibility || {}
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        select: '-password -__v' 
      }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error('Update profile error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Update user profile picture
// @route   PUT /users/profile-picture
// @access  Private
export const updateProfilePicture = async (req, res) => {
  try {
    const { image } = req.body; // Expecting base64 string

    if (!image) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image data is required' 
      });
    }

    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: image },
      { 
        new: true,
        select: '-password -__v'
      }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePic: user.profilePic
    });
  } catch (err) {
    console.error('Update profile picture error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Delete user account
// @route   DELETE /users
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await user.deleteOne();

    // Clear cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};