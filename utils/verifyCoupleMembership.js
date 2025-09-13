const User = require('../models/User');

const verifyCoupleMembership = async (userId, coupleId) => {
   const user = await User.findById(userId);
   return user.coupleId && user.coupleId.toString() === coupleId;
};

module.exports = verifyCoupleMembership;