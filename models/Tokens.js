const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, index: true },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  count: { type: Number, default: 1 }
});

TokenSchema.index({ coupleId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Token', TokenSchema);