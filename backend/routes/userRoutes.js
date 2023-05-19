const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

//Signup
//this way of writing it helps in chaining multiple APIs against a single route
//the get API with allUsers controller runs through protect middleware
router.route("/").post(registerUser).get(protect, allUsers);
// router.post("/", registerUser);

//Login
router.post("/login", authUser);

module.exports = router;
