const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//creating or fetching a 1:1 chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; //pick out the target user id from the request

  if (!userId) {
    //check if value is present
    console.log("User ID param not sent with request");
    return res.sendStatus(400);
  }

  //
  var isChat = await Chat.find({
    //finding chat data satisfying below conditions
    isGroupChat: false, //shound be a 1:1 chat
    $and: [
      //both users should be present
      { users: { $elemMatch: { $eq: req.user._id } } }, //lookup the user equal to current user's id
      { users: { $elemMatch: { $eq: userId } } }, //lookup the user equal to searched user's id
    ],
  })
    //populate the users field (that currently contains only user id) with all user data except their password
    .populate("users", "-password")
    .populate("latestMessage"); //populate with all data from latest message

  //final data of the chat between 2 users
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  //if there's existing chat, send that as response
  if (isChat.length > 0) {
    res.send(isChat[0]); //there will be only one entry in the array as the chats will just be one between 2 users
  } else {
    //create a new chat
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    //sending the created chat as response
    try {
      const createdChat = await Chat.create(chatData); //storing the created chat in Chat db
      //find the created chat in chat db and get the user details except password
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

module.exports = { accessChat };
