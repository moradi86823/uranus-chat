const jwt = require("jsonwebtoken");

const Token = require("../models/token");

const errorHandler = async (error, req, res, next) => {
  if (error.name === "UnauthorizedError") {
    if (!error.message.includes("jwt expired")) {
      return res.status(401).json({ type: error.type, message: error.message });
    }
    try {
      const authHeader = req.headers["authorization"];
      const accessToken = authHeader?.split(" ")[1];

      const token = await Token.findOne({
        accessToken,
        refreshToken: { $exists: true },
      });
      if (!token) {
        return res.status(401).json({
          message: "Token does not exist",
        });
      }

      const user = jwt.verify(
        token.refreshToken,
        process.env.JWT_REFRESH_TOKEN_SECRET
      );
      if (!user) {
        return res.status(404).json({
          message: "Invalid user",
        });
      }

      const newAccessToken = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" }
      );

      await Token.updateOne(
        { _id: token.id },
        { accessToken: newAccessToken }
      ).exec();

      res.set("Authorization", `Bearer ${newAccessToken}`);
      return next();
    } catch (refreshError) {
      return res.status(401).json({ message: "Unauthorized error" });
    }
  }
  return next();
};

module.exports = errorHandler;
