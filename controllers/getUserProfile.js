import User from '../models/User.js';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email _id partnerCode coupleId');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info', details: err.message });
  }
};