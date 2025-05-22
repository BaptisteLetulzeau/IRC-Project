const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const memberSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  isJoined: {
    type: Boolean,
    default: true
  }
});

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  messages: [messageSchema],
  members: [memberSchema]
});
const PublicChannel = mongoose.model('Channel', channelSchema);
module.exports = PublicChannel;
