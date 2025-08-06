const { expressjwt: expjwt } = require("express-jwt");
const Token = require("../models/token");

const jwtAuth = () => {
  return expjwt({
    secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    algorithms: ["HS256"],
    isRevoked: async (req, jwt) => {
      const authHeader = req.headers("Authorization");
      if (!authHeader.startsWith("Bearer ")) return true;

      const accessToken = authHeader.split("Bearer ")[1].trim();
      const token = await Token.findOne({ accessToken });

      const adminRoutesRegex = /^\/api\/v1\/admin\//i;
      const adminFault =
        !jwt.payload.isAdmin && adminRoutesRegex.test(req.originalUrl);

      return adminFault || !token;
    },
  }).unless({
    path: [
      `/api/v1/auth/login/`,
      `/api/v1/auth/login`,
      `/api/v1/auth/register/`,
      `/api/v1/auth/register`,
    ],
  });
};

module.exports = jwtAuth;
