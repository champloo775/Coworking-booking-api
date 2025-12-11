const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Create room (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, capacity, type } = req.body;

    if (!name || !capacity || !type) {
      return res.status(400).json({ message: 'Name, capacity, and type are required' });
    }

    if (!['workspace', 'conference'].includes(type)) {
      return res.status(400).json({ message: 'Type must be workspace or conference' });
    }

    const room = new Room({
      name,
      capacity,
      type
    });

    await room.save();

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating room', error: error.message });
  }
});

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({
      message: 'Rooms retrieved successfully',
      rooms
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rooms', error: error.message });
  }
});

// Update room (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, type } = req.body;

    if (type && !['workspace', 'conference'].includes(type)) {
      return res.status(400).json({ message: 'Type must be workspace or conference' });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (type !== undefined) updateData.type = type;

    const room = await Room.findByIdAndUpdate(id, updateData, { new: true });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating room', error: error.message });
  }
});

// Delete room (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({
      message: 'Room deleted successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting room', error: error.message });
  }
});

module.exports = router;
