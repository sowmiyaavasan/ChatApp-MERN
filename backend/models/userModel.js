const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userModel = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

//function to check entered password matches password in db
userModel.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//function to perform password encryption before saving in db
userModel.pre("save", async function (next) {
  //arrow function didn't perform the function
  if (!this.isModified) {
    next();
  }
  const salt = await bcrypt.genSalt(10); //generate a salt
  this.password = await bcrypt.hash(this.password, salt); //hash password with salt
});

const User = mongoose.model("User", userModel);

module.exports = User;
