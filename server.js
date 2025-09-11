const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
require('dotenv').config();
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI


// Middleware 
app.use(cors());


// MongoDB connection
mongoose.connect(MONGO_URI )
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.log('Mongo error', err));

// Routes


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

