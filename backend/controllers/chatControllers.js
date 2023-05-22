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

//fetch all chats for a user
const fetchChats = asyncHandler(async (req, res) => {
  try {
    //fetch the chat data for the user that's logged in from users array of chat model and send as response
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      //populate the result with users, latestMessage and groupAdmin fields with chat data
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) //sort from recent to old
      .then(async (results) => {
        results = await User.populate(results, {
          //populate the existing result with sender's data
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results); //send the result as response
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//create group chat
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users); //parsing the stringified object recieved from frontend

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    //query the db for created group chat and send as response
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = asyncHandler(async (req, res) => {
  //pull the chat Id and name that has to be updated from request
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId, //finding parameter
    {
      chatName: chatName, //updating parameter
    },
    {
      new: true, //set new to true to return the updated name instead of old name
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

//adding a user to a group
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId }, //adding the user to users array
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat not found");
  } else {
    res.json(added);
  }
});

//removing a user from group
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
