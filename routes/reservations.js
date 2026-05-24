import express from 'express';
import Reservation from '../models/Reservation.js';

const router = express.Router();

// POST /api/reservations
router.post('/', async (req, res) => {
  try {
    const { name, email, date, time, guests, specialRequests, userId } = req.body;
    
    const newReservation = new Reservation({
      name,
      email,
      date,
      time,
      guests,
      specialRequests,
      user: userId || null
    });

    await newReservation.save();
    res.status(201).json({ message: 'Reservation confirmed', reservation: newReservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
