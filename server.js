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
const tokenRoutes = require('./routes/tokenRoutes')
const postRoutes = require('./routes/postRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const streakRoutes = require('./routes/streakRoutes');


const allowedOrigins = [
  'http://localhost:5173',               // Vite dev server
  'x-eight-teal.vercel.app',
        // Replace with your actual deployed frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // if you're using cookies or auth headers
}));


// Middleware 
// app.use(cors({
//   origin: 'http://localhost:5173/',
// })); // app.use(cors({ origin: 'https://your-frontend.vercel.app', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// MongoDB connection
mongoose.connect(MONGO_URI )
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.log('Mongo error', err));

// initialize routes

app.use('/api/auth', authRoutes);   // http://localhost:5000/api/auth/
app.use('/api/couple', coupleRoutes);   // http://localhost:5000/api/couple/COUPLE_ID
app.use('/api/activity', activityRoutes);  // http://localhost:5000/api/activity/COUPLE_ID
app.use('/api/tokens', tokenRoutes);  // http://localhost:5000/api/tokens/COUPLE_ID
app.use('/api/posts', postRoutes);  // http://localhost:5000/api/posts/ // http://localhost:5000/api/posts?coupleId=COUPLE_ID&visibility=public
app.use('/api/upload', uploadRoutes);  // http://localhost:5000/api/upload
app.use('/api/streak', streakRoutes); // https:// localhost:5000/api/streak

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime().toFixed(0) + ' seconds',
    timestamp: new Date(),
    message: 'Backend is healthy'
  });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

