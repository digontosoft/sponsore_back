const User = require('../models/User');
const Student = require('../models/Student');
const Sponsor = require('../models/Sponsor');
const Admin = require('../models/Admin');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and userType'
      });
    }

    const user = await User.findOne({ email, userType });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    let profileData = {};
    if (userType === 'student') {
      const student = await Student.findOne({ userId: user._id });
      profileData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        userType: user.userType,
        profileImage: student?.profileImage || user.profileImage,
        organization: user.organization
      };
    } else if (userType === 'sponsor') {
      const sponsor = await Sponsor.findOne({ userId: user._id });
      profileData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage,
        organization: sponsor?.organization || user.organization
      };
    } else {
      profileData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        userType: user.userType,
        profileImage: user.profileImage,
        organization: user.organization
      };
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      refreshToken: refreshToken,
      user: profileData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, userType, phone, organization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      userType,
      phone,
      organization
    });

    // Create related profile based on userType
    if (userType === 'sponsor') {
      await Sponsor.create({
        userId: user._id,
        name,
        email,
        organization
      });
    } else if (userType === 'student') {
      await Student.create({
        userId: user._id,
        name
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken(user._id),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profileData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      userType: user.userType,
      phone: user.phone,
      profileImage: user.profileImage,
      organization: user.organization,
      joinDate: user.joinDate,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      user: profileData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret');
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id),
      refreshToken: newRefreshToken,
      expiresIn: 86400
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  getMe,
  refreshToken
};

