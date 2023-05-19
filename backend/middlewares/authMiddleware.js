const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    //checks if there is a authorization field in the url
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //removes the string "Bearer" and stores it in token variable
      token = req.headers.authorization.split(" ")[1];

      //decodes the token by passing the JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //finds the current user data by passing the decoded id
      //stores the result (except the password) in user variable in request url
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
