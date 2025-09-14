const User = require('../models/User');

const verifyCoupleMembership = async (userId, coupleId) => {
  const user = await User.findById(userId);
  if (!user || !user.coupleId) return false;
  return user.coupleId.toString() === coupleId.toString();
};

module.exports = verifyCoupleMembership;