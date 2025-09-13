
const Token = require('../models/Tokens');

const getTokensByCouple = async (req, res) => {
  const { coupleId } = req.params;
  try {
    const tokens = await Token.find({ coupleId }).sort({ date: 1 }); // Mongo sort
    res.json({ tokens });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve tokens', details: err.message });
  }
};


module.exports = { getTokensByCouple };