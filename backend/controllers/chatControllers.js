const asyncHandler = require("express-async-handler");
// const { findById } = require("../models/chatModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
    console.log(req.body);
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChat=asyncHandler(async(req,res)=>{
  try {
  Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
   .populate("users","-password")
   .populate("groupAdmin","-password")
   .populate("latestMessage")
   .sort({updatedAt:-1})
   .then(async(results)=>{
    results=await User.populate(results,{
    path: "latestMessage.sender",
    select: "name pic email",
    })
    res.status(200).json(results);
   })

   
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
})

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

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
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
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


const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin
  
  const chat=await Chat.findById(chatId).populate("groupAdmin","-password").populate("users","-password");
  // console.log(chat.groupAdmin.id);
  // console.log(chat.users);

const searchObject= chat.users.find((user) => user.id==userId);
// console.log(searchObject);
if(searchObject){
   res.status(404);
  throw new Error("User is already present in group");
}

  if(req.user.id!=chat.groupAdmin.id){
     res.status(404);
    throw new Error("Only admin can add or remove");
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    // console.log(req.user.id);

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

const removeFromGroup=asyncHandler(async(req,res)=>{
    const { chatId, userId } = req.body;

  // check if the requester is admin
  const chat=await Chat.findById(chatId).populate("groupAdmin","-password");
 
 
  // console.log(chat.groupAdmin.id);
  if(req.user.id!=chat.groupAdmin.id){
     res.status(404);
    throw new Error("Only admin can add or remove");
  }
  // const searchObject= chat.users.find((user) => user.id==userId);
  // console.log(searchObject);
  // if(!searchObject){
  //   res.status(404);
  //   throw new Error("User is not present in group");
  // }


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

module.exports={accessChat,fetchChat,createGroupChat,renameGroup,addToGroup,removeFromGroup};