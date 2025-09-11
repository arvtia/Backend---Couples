

const User = require('../models/User');
// const Couple = require('../models/Couple');
const crypto = require('crypto');

exports.signup = async (req, res) => {
   const { name, email, password } = req.body;
   if (!name || !email || !password) return res.status(400).json({message:"all fields are required"});
   try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({message:"email already in use"});
      const partnerCode = crypto.randomBytes(3).toString('hex');
      const user = new User({ name, email, password, partnerCode });
      await user.save();
      res.status(201).json({ message: 'User created', user });
   } catch (err) {
      console.error(err);
      res.status(500).json({message:"server error"});
   }
};

