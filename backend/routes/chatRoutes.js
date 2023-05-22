const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { accessChat, fetchChats } = require("../controllers/chatControllers");

const router = express.Router();

router.route("/").post(protect, accessChat); //chat creation

router.route("/").get(protect, fetchChats); // fetch all chats
// router.route("/group").post(protect, createGroupChat);
// router.route("/rename").put(protect, renameGroup);
// router.route("/removegroup").put(protect, removeFromGroup);
// router.route("/addgroup").put(protect, addToGroup);

module.exports = router;