const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Token = require("../models/token");

const registerUser = async (req, res) => {
  const validation = validationResult(req);
  const { email, name, password } = req.body;

  if (!validation.isEmpty()) {
    return res.status(400).json(
      validation.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }))
    );
  }

  try {
    const user = new User({
      email,
      name,
      passwordHash: bcrypt.hashSync(password, 8),
      activeCode: uuidv4(),
    });
    await user.save();
    return res.status(201).json(user);
  } catch (err) {
    if (err.message.includes("email_1 dup key")) {
      return res.status(409).json({
        message: "Invalid Email",
      });
    }
    return res.status(500).json({
      message: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    // TEST
    // if (!user || !user.isActive) {
    //   return res.status(404).json({
    //     message: "Incorrect email or password",
    //   });
    // }

    if (!user) {
      return res.status(404).json({
        message: "Incorrect email or password",
      });
    }

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(404).json({
        message: "Incorrect email or password",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      { expiresIn: "60d" }
    );

    const token = await Token.findOne({ userId: user.id });
    if (token) await token.deleteOne();
    await new Token({
      userId: user.id,
      accessToken,
      refreshToken,
    }).save();
    user.passwordHash = undefined;

    return res.status(200).json({
      ...user._doc,
      accessToken,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};
