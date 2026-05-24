import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Order from '../models/Order.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { username, email, password, phone } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const userCount = await User.countDocuments();
    user = new User({
      username,
      email,
      password,
      phone,
      role: userCount === 0 ? 'admin' : 'user'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'golden_hour_bistro_secret_key_123',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error. Check your connection or database.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Special check for hardcoded Admin Credentials provided by user
    const isAdminEmail = username === 'cafeAdmin@gmail.com';
    const isAdminPass = password === 'AdminP@ss123';
    
    let user = await User.findOne({ $or: [{ email: username }, { username: username }] });
    
    // Auto-create admin if it doesn't exist but credentials match
    if (!user && isAdminEmail && isAdminPass) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({
        username: 'CafeAdmin',
        email: 'cafeAdmin@gmail.com',
        password: hashedPassword,
        phone: '0000000000',
        role: 'admin'
      });
      await user.save();
    }

    if (!user) {
      return res.status(400).json({ message: 'Account not found. Please register first.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    const isAdminOverride = isAdminEmail && isAdminPass;
    
    if (!isMatch && !isAdminOverride) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Force admin role if using admin credentials
    if (isAdminOverride && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'golden_hour_bistro_secret_key_123',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset user password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: 'Password reset successfully. You can now Sign In.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

export default router;
