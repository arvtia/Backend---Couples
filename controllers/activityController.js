
const Couple = require('../models/Couple');
const User = require('../models/User');
const crypto = require('crypto');
const dayjs = require('dayjs');
const Activity = require('../models/Activity');



// Create a couple by linking two users via partner codes
// create activity 
const createActivity = async ( req, res) =>{
   const { coupleId , type , metadata , description } = req.body;
   if (!coupleId || !type || !description) return res.status(400).json({message:"coupleId, type and description are required"});
   try {
      // save activity
      const activity = new Activity({ coupleId, type, metadata, description});
      await activity.save();

      // upsert token for streak
      const today = dayjs().format('YYYY-MM-DD');
      await Token.findOneAndUpdate(
         { coupleId, date: today },
         { $inc: { count: 1 } },
         { upsert: true, new: true, setDefaultsOnInsert: true }
      );      

      res.json({ message: 'Activity logged', activity });
   } catch (err) {
      res.status(500).json({ error: 'Failed to log activity', details: err.message });
   }
}

const getActivities = async ( req, res) =>{
   const { coupleId } = req.params; 
   try {
      const activities = await Activity.find({coupleId}).sort({ createdAt: -1 });
      res.json({ activities });
   } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve activities', details: err.message });
   }
}

module.exports = { createActivity, getActivities };

