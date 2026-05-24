import express from 'express';
import jwt from 'jsonwebtoken';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'golden_hour_bistro_secret_key_123');
      req.user = decoded.user; // Extract the user object from payload: { user: { id, username } }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// GET /api/orders
// Get all orders for the logged in user
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching orders' });
  }
});

// POST /api/orders
// Create a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, totalPrice, shippingDetails, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const orderName = items.map(i => i.name).join(', ');

    const order = new Order({
      user: req.user.id,
      orderName: orderName.length > 50 ? orderName.substring(0, 47) + '...' : orderName,
      totalPrice,
      items,
      shippingDetails,
      paymentMethod: paymentMethod || 'cod',
      status: 'Processing'
    });

    await order.save();
    
    // Clear the cart after successful order
    await Cart.findOneAndDelete({ user: req.user.id });

    // --- SIMULATED AUTO-STATUS PROGRESSION ---
    // Update to 'Out for Delivery' after 1 minute
    setTimeout(async () => {
      try {
        await Order.findByIdAndUpdate(order._id, { status: 'Out for Delivery' });
        console.log(`\n🚚 [AUTO-UPDATE] Order GHB-${order._id.toString().substring(0,6).toUpperCase()} is now Out for Delivery`);
      } catch (err) { console.error("Auto-status update error:", err); }
    }, 60000); // 1 minute

    // Update to 'Completed' after 3 minutes
    setTimeout(async () => {
      try {
        await Order.findByIdAndUpdate(order._id, { status: 'Completed' });
        console.log(`\n✅ [AUTO-UPDATE] Order GHB-${order._id.toString().substring(0,6).toUpperCase()} is now Completed`);
      } catch (err) { console.error("Auto-status update error:", err); }
    }, 180000); // 3 minutes
    // ------------------------------------------

    // Simulate Email Notification
    console.log(`\n📧 [GOLDEN HOUR NOTIFICATION] CONFIRMATION SENT`);
    console.log(`To: ${shippingDetails?.email || 'Customer'}`);
    console.log(`Order Number: GHB-${order._id.toString().substring(0,6).toUpperCase()}`);
    console.log(`Status: Order Received & Receipt Dispatched\n`);

    res.status(201).json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: 'Server Error creating order' });
  }
});

export default router;
