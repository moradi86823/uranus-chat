const jwt = require("jsonwebtoken");

const Token = require("../models/token");

const socketAuth = async (socket, next) => {
  try {
    const accessToken = socket.handshake.query.token || "";

    if (!accessToken) {
      return next(new Error("Authentication token missing"));
    }

    try {
      const user = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
      socket.user = user;
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const tokenDoc = await Token.findOne({
          accessToken,
          refreshToken: { $exists: true },
        });

        if (!tokenDoc) {
          return next(new Error("Token does not exist"));
        }

        const user = jwt.verify(
          tokenDoc.refreshToken,
          process.env.JWT_REFRESH_TOKEN_SECRET
        );

        if (!user) {
          return next(new Error("Invalid user"));
        }

        const newAccessToken = jwt.sign(
          { id: user.id, isAdmin: user.isAdmin },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          { expiresIn: "24h" }
        );

        await Token.updateOne(
          { _id: tokenDoc._id },
          { accessToken: newAccessToken }
        ).exec();

        socket.emit("refreshToken", { accessToken: newAccessToken });

        socket.user = user;
        return next();
      }

      return next(new Error("Unauthorized error"));
    }
  } catch (e) {
    return next(new Error("Authentication error"));
  }
};

module.exports = socketAuth;
