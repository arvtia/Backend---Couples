const Couple = require('../models/Couple');
const User = require('../models/User');
const crypto = require('crypto');
const verifyCoupleMembership = require('../utils/verifyCoupleMembership');

const createCouple =  async (req, res) => {
  const { userId, partnerCode } = req.body;
  try {
    const user = await User.findById(userId);
    const partner = await User.findOne({ partnerCode });

    if (!user || !partner) return res.status(404).json({ error: 'User or partner not found' });

    const couple = new Couple({ members: [user._id, partner._id] });
    await couple.save();

    user.coupleId = couple._id;
    partner.coupleId = couple._id;
    await user.save();
    await partner.save();

    res.json({ couple });
  } catch (err) {
    res.status(500).json({ error: 'Linking failed', details: err.message });
  }
};


const getCouple = async ( req, res)=>{
   const { coupleId } = req.params;
  
  // Only allow access if user is a member
  const isMember = await verifyCoupleMembership(req.userId, coupleId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });
   try {
      const couple = await Couple.findById(coupleId).populate('members', 'name email');
      if (!couple) return res.status(404).json({ error: 'Couple not found' });
      res.json({ couple });
   } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve couple', details: err.message });
   }
}


module.exports = { createCouple, getCouple };