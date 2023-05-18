const express = require("express");
const { registerUser, authUser } = require("../controllers/userControllers");

const router = express.Router();

//Signup
router.route("/").post(registerUser); //this way of writing it helps in chaining multiple methods
// router.post("/", registerUser);

//Login
router.post("/login", authUser);

module.exports = router;
