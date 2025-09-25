const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name:  { type: String },
  password: { type: String, required: true },
  partnerCode: { type: String, unique: true },
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple' },

  // 🔐 Add these two fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });