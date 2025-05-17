const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 
  if (!token)
    return res.status(401).json({ message: "Unauthorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized, user not found" });
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }
};

module.exports = authMiddleware;
