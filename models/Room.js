const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['workspace', 'conference'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
