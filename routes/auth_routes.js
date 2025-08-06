const { Router } = require("express");
const authRouter = Router();

const authController = require("../controllers/auth_controller");
const { body } = require("express-validator");

const userValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid Email address"),
  body("name")
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 20, min: 2 }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ minLength: 6 })
    .withMessage("Password is too short"),
];

authRouter.post("/register", userValidation, authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.get("/validate", (req, res) => {
  res.status(200).json({ message: "Ok" });
});

module.exports = authRouter;
