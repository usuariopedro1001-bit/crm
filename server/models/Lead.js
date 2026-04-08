const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  whatsapp: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Lead', 'Contato', 'Reunião', 'Proposta', 'Fechado', 'Perdido'],
    default: 'Lead'
  },
  notes: {
    type: String,
    default: ''
  },
  interactions: [{
    content: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);
