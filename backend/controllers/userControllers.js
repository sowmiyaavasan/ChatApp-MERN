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

const allUsers = asyncHandler(async (req, res) => {
  //looks for the search attribute in the url
  const keyword = req.query.search
    ? {
        //if search value is present
        $or: [
          // Mongodb OR operator
          // checks if the value in the search attribute matches with the name or email of the User model
          // and options = i says there should be a case sensitive match
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {}; //else do nothing

  //get the list of users who matched the regex query result
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
  //current user id "req.user._id" is obtained through authMiddleware
  //the result should show the collection except the current user that's logged in
});

module.exports = { registerUser, authUser, allUsers };
