
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')
const User = require('../models/User');


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