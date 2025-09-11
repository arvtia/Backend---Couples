const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI

// routes
const authRoutes = require('./routes/authRoutes')
const coupleRoutes = require('./routes/coupleRoutes')
const activityRoutes = require('./routes/activityRoutes')

// Middleware 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB connection
mongoose.connect(MONGO_URI )
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.log('Mongo error', err));

// initialize routes
app.use('/api/auth', authRoutes);
app.use('/api/couple', coupleRoutes);
app.use('/api/activity', activityRoutes);



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

