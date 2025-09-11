
const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema({
   members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Couple', coupleSchema);