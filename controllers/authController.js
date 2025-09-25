
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS;
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);


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

    const resetUrl = `${process.env.ALLOWED_ORIGINS}/reset-password/${token}`;

    const htmlContent = `
      <div style="background-color: #ffe6f0; padding: 40px 20px; font-family: sans-serif; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #fff0f5; padding: 30px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
          <h1 style="font-size: 30px; color: #d6336c; margin-bottom: 24px;">💖 Couples Connect</h1>
          <div style="text-align: left; font-size: 16px; color: #333; line-height: 1.6;">
            <p>Hi there,</p>
            <p>We received a request to reset your password. Click the button below to set a new one. This link will expire in 1 hour.</p>
          </div>
          <div style="margin: 32px 0;">
            <a href="${resetUrl}" style="
              display: inline-block;
              padding: 12px 28px;
              background-color: #fff;
              color: #d6336c;
              border: 2px solid #f3c6d4;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              transition: background-color 0.3s ease;
            ">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #999; margin-top: 40px;">Couples Connect 💞</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Couples Connect <noreply@anything.icu>',
      to: user.email,
      subject: 'Reset Your Password',
      html: htmlContent
    });

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


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

    const htmlContent = `
      <div style="background-color: #ffe6f0; padding: 40px 20px; font-family: sans-serif; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #fff0f5; padding: 30px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
          <h1 style="font-size: 30px; color: #d6336c; margin-bottom: 24px;">💖 Couples Connect</h1>
          <div style="text-align: left; font-size: 16px; color: #333; line-height: 1.6;">
            <p>Hi there,</p>
            <p>Your password has been successfully updated. If this wasn’t you, please contact support immediately.</p>
          </div>
          <div style="margin: 32px 0;">
            <a href="${process.env.ALLOWED_ORIGINS}" style="
              display: inline-block;
              padding: 12px 28px;
              background-color: #fff;
              color: #d6336c;
              border: 2px solid #f3c6d4;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              transition: background-color 0.3s ease;
            ">
              Return to App
            </a>
          </div>
          <p style="font-size: 14px; color: #999; margin-top: 40px;">Couples Connect 💞</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Couples Connect <noreply@anything.icu>',
      to: user.email,
      subject: 'Your Password Has Been Updated',
      html: htmlContent
    });

    res.json({ message: "Password updated and confirmation sent" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.sendTestEmail = async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: "Recipient email is required" });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Test Email',
      text: 'Testing work.'
    });

    res.json({ message: 'Test email sent successfully' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send test email' });
  }
};