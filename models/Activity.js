const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  type: { type: String, required: true }, // e.g., 'dateNight', 'vacation', 'memory'
  description: { type: String },
  metadata: { type: Object }, // optional extra info
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', ActivitySchema);