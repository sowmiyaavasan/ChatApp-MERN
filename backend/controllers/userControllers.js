const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

//function behind signing up by a user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  //checking if all fields are filled while signup
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  //checking if email already exisits
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exisits");
  }

  //creating a new user
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  //check for successful user creation
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }); //check if user exists
  const matchPassword = await user.matchPassword(password); //check if password matches

  if (user && matchPassword) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Username or Password is incorrect");
  }
});

module.exports = { registerUser, authUser };
