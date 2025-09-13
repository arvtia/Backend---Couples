// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name:  { type: String },
  password: { type: String, required: true },
  partnerCode: { type: String, unique: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);