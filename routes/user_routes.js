const { Router } = require("express");
const usersController = require("../controllers/users_controller");

const userRouter = Router();

userRouter.get("/search", usersController.searchUsers);

module.exports = userRouter;
