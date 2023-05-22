const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router();

router.route("/").post(protect, accessChat); //chat creation

router.route("/").get(protect, fetchChats); //fetch all chats

router.route("/group").post(protect, createGroupChat); //create group chat

router.route("/rename").put(protect, renameGroup); //rename a group

router.route("/removegroup").put(protect, removeFromGroup); //remove user from group

router.route("/addgroup").put(protect, addToGroup); //add user to group

module.exports = router;
