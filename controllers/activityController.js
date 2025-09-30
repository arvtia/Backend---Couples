
const crypto = require('crypto');
const dayjs = require('dayjs');
const Activity = require('../models/Activity');
const Token = require('../models/Tokens');
const verifyCoupleMembership = require('../utils/verifyCoupleMembership');
const User = require('../models/User')


// Create a couple by linking two users via partner codes
// create activity 
const createActivity = async ( req, res) =>{
   const { coupleId , type , metadata , description } = req.body;
   if (!coupleId || !type || !description) return res.status(400).json({message:"coupleId, type and description are required"});
   try {

      const isMember = await verifyCoupleMembership(req.userId, coupleId);
      if (!isMember) return res.status(403).json({ error: 'Access denied' });

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
      const isMember = await verifyCoupleMembership(req.userId, coupleId);
      if (!isMember) return res.status(403).json({ error: 'Access denied' });

      const activities = await Activity.find({ coupleId }).sort({ createdAt: -1 }).lean();
      res.json({ activities });
   } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve activities', details: err.message });
   }
}


// activity graph 
const getActivityGraph = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.coupleId) {
      return res.status(404).json({ error: 'Couple not linked yet' });
    }

    const coupleId = user.coupleId;

    // Aggregate counts per day
    const activities = await Activity.aggregate([
      { $match: { coupleId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0, date: "$_id", count: 1 } }
    ]);

    // Ensure , it return all days for the past year, even with 0 count
    const today = dayjs();
    const days = [];
    for (let i = 0; i < 365; i++) {
      const date = today.subtract(i, 'day').format('YYYY-MM-DD');
      const found = activities.find(a => a.date === date);
      days.push({ date, count: found ? found.count : 0 });
    }

    res.json(days.reverse()); // oldest → newest
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity graph', details: err.message });
  }
};


module.exports = { createActivity, getActivities, getActivityGraph };

