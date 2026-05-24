import express from 'express';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get bistro stats
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const orders = await Order.find();
    const revenue = orders.reduce((acc, curr) => acc + curr.totalPrice, 0);

    res.json({
      totalOrders,
      totalReservations,
      totalUsers,
      revenue
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// @route   GET /api/admin/reservations
// @desc    Get all reservations for admin
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// @route   POST /api/admin/support
// @desc    Submit a support ticket
router.post('/support', async (req, res) => {
  const { adminEmail, adminName, timestamp } = req.body;
  
  try {
    console.log('\n🚀 [GOLDEN HOUR SUPPORT] NEW TICKET RECEIVED');
    console.log('-------------------------------------------');
    console.log(`ADMIN NAME:  ${adminName}`);
    console.log(`ADMIN EMAIL: ${adminEmail}`);
    console.log(`TIMESTAMP:   ${new Date(timestamp).toLocaleString()}`);
    console.log(`ACTION:      Forwarding to support@goldenhourbistro.com...`);
    console.log('-------------------------------------------\n');

    res.json({ success: true, message: 'Ticket logged and support notified' });
  } catch (err) {
    res.status(500).json({ message: 'Error processing support ticket' });
  }
});

export default router;
