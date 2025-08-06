const User = require("../models/user");

const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      name: { $regex: query, $options: "i" },
    })
      .limit(20)
      .select("_id name");

    res.json(users);
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { searchUsers };
