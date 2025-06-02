import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedUserId },
    }).select("-password");

    if(!filteredUsers){
      return res.status(400).json({
        success:false,
        message:"Users Not Found"
      })
    }

    return res.status(200).json({
      filteredUsers,
      success: true,
      // message:"User Fetched"
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: receiverId } = req.params;

    const { text, image } = req.body;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId: myId,
      receiverId,
      text,
      image: imageUrl,
    });

    if (!newMessage) {
      return res.status(400).json({
        success: false,
        message: "Message Not Sent",
      });
    }

    const receiverSocketId = getReceiverSocketId(receiverId)

    if(receiverSocketId){
      io.to(receiverSocketId).emit('newMessage', newMessage)
    }
 
    return res.status(201).json({
      newMessage,
      success: true,
      message: "Message Sent",
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
};
