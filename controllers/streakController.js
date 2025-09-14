const dayjs = require('dayjs');
const Activity = require('../models/Activity');
const Post = require('../models/Post');
const User = require('../models/User');
const Couple = require('../models/Couple'); // assuming you have this

const getStreakStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let startDate = dayjs(user.createdAt).startOf('day');

    // If user is in a couple, use couple creation date instead
    if (user.coupleId) {
      const couple = await Couple.findById(user.coupleId);
      if (couple) {
        startDate = dayjs(couple.createdAt).startOf('day');
      }
    } else {
      return res.status(404).json({ error: 'Couple not linked yet' });
    }

    const coupleId = user.coupleId;

    // Gather all activity dates
    const activities = await Activity.find({ coupleId }).select('createdAt').lean();
    const posts = await Post.find({ coupleId }).select('createdAt').lean();

    const allDates = [
      ...activities.map(a => dayjs(a.createdAt).format('YYYY-MM-DD')),
      ...posts.map(p => dayjs(p.createdAt).format('YYYY-MM-DD'))
    ];

    const uniqueDates = [...new Set(allDates)].sort((a, b) => b.localeCompare(a));

    // Calculate current streak
    let currentStreak = 0;
    let today = dayjs().format('YYYY-MM-DD');
    for (let date of uniqueDates) {
      if (date === today) {
        currentStreak++;
        today = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');
      } else {
        break;
      }
    }

    // Calculate highest streak
    let highestStreak = 0;
    let streak = 0;
    let prevDate = null;
    uniqueDates.forEach(date => {
      if (!prevDate) {
        streak = 1;
      } else {
        const expectedPrev = dayjs(prevDate).subtract(1, 'day').format('YYYY-MM-DD');
        if (date === expectedPrev) {
          streak++;
        } else {
          streak = 1;
        }
      }
      highestStreak = Math.max(highestStreak, streak);
      prevDate = date;
    });

    // Build activity graph from startDate → today
    const activityGraph = [];
    let cursor = startDate;
    const todayObj = dayjs();
    while (cursor.isBefore(todayObj) || cursor.isSame(todayObj, 'day')) {
      const dateStr = cursor.format('YYYY-MM-DD');
      const count = allDates.filter(d => d === dateStr).length;
      activityGraph.push({ date: dateStr, count });
      cursor = cursor.add(1, 'day');
    }

    res.json({
      currentStreak,
      highestStreak,
      activityGraph
    });

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
};

module.exports = { getStreakStats };