const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({  
   name:  { type: String },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   partnerCode: { type: String, unique: true },
   coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple' },

});

module.exports = mongoose.model('User', userSchema);

