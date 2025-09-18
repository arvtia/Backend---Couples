
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;


exports.signup = async (req, res) => {
   const { name, email, password } = req.body;
   if (!name || !email || !password) return res.status(400).json({message:"all fields are required"});
   try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({message:"email already in use"});
      
      const hashed = await bcrypt.hash(password, 10);
      const partnerCode = Math.random().toString(36).substring(2, 8);
      const user = new User({ email, name, password: hashed, partnerCode });
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user })

      res.status(201).json({ message: 'User created', user });
   } catch (err) {
      console.error(err);
      res.status(500).json({message:"server error"});
   }
};


exports.Login = async (req, res)=> {
   const { email, password } = req.body;
   if (!email || !password) return res.status(400).json({message:"all fields are required"});
   try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({message:"invalid credentials"});

      const match = await bcrypt.compare(password, user.password)
      if (!match) return res.status(400).json({message:"invalid credentials"});

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user })
   } catch (err) {
      console.error(err);
      res.status(500).json({message:"server error"});
   }
}



// Send password reset link
exports.sendResetLink = async (req, res) => {
   const { email } = req.body;
   if (!email) return res.status(400).json({ message: "Email is required" });
   try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "User not found" });

      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // Setup nodemailer
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
         }
      });

      const resetUrl = `${ALLOWED_ORIGINS}/reset-password/${token}`;
      const mailOptions = {
         to: user.email,
         subject: 'Password Reset',
         text: `Click this link to reset your password: ${resetUrl}`
      };

      await transporter.sendMail(mailOptions);

      res.json({ message: "Reset link sent to email" });
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
};

// Reset password and send confirmation
exports.resetPassword = async (req, res) => {
   const { token, password } = req.body;
   if (!token || !password) return res.status(400).json({ message: "Token and new password required" });
   try {
      const user = await User.findOne({
         resetPasswordToken: token,
         resetPasswordExpires: { $gt: Date.now() }
      });
      if (!user) return res.status(400).json({ message: "Invalid or expired token" });

      user.password = await bcrypt.hash(password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Send confirmation email
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
         }
      });

      const mailOptions = {
         to: user.email,
         subject: 'Password Updated',
         text: 'Your password has been successfully updated.'
      };

      await transporter.sendMail(mailOptions);

      res.json({ message: "Password updated and confirmation sent" });
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
   }
};
