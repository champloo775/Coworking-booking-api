const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { verifyToken } = require('../middleware/authMiddleware');

// Create booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const { roomId, startTime, endTime } = req.body;

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ message: 'roomId, startTime, and endTime are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      roomId,
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({ 
        message: 'Room is not available for the selected time period',
        conflictingBooking
      });
    }

    const booking = new Booking({
      roomId,
      userId: req.userId,
      startTime: start,
      endTime: end
    });

    await booking.save();

    // Emit Socket.io event
    if (req.app.get('io')) {
      req.app.get('io').emit('bookingCreated', {
        bookingId: booking._id,
        roomId: booking.roomId,
        userId: booking.userId,
        startTime: booking.startTime,
        endTime: booking.endTime
      });
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
});

// Get bookings
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = {};
    
    // Users see only their own bookings, Admins see all
    if (req.userRole !== 'Admin') {
      query.userId = req.userId;
    }

    const bookings = await Booking.find(query)
      .populate('roomId', 'name capacity type')
      .populate('userId', 'username role');

    res.json({
      message: 'Bookings retrieved successfully',
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Cancel booking
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Users can only cancel their own bookings, Admins can cancel any
    if (req.userRole !== 'Admin' && booking.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only cancel your own bookings' });
    }

    await Booking.findByIdAndDelete(id);

    // Emit Socket.io event
    if (req.app.get('io')) {
      req.app.get('io').emit('bookingCancelled', {
        bookingId: id,
        roomId: booking.roomId,
        userId: booking.userId
      });
    }

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
});

module.exports = router;
