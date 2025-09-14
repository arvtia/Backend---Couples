const dayjs = require('dayjs');
const Token = require('../models/Tokens');
const User = require('../models/User');

const getStreakStats = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.coupleId) {
      return res.status(404).json({ error: 'Couple not linked yet' });
    }

    const coupleId = user.coupleId;

    // Get all token entries for this couple
    const tokens = await Token.find({ coupleId }).sort({ date: -1 }).lean();
    const uniqueDates = [...new Set(tokens.map(t => t.date))];

    // Current streak
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

    // Highest streak
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

    res.json({ currentStreak, highestStreak });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch streak stats', details: err.message });
  }
};

module.exports = { getStreakStats };