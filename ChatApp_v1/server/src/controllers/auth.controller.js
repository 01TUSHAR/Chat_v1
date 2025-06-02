import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

// signup
const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be more than 6 charaters",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    const hashPassword = await bcryptjs.hash(password, 12);

    const newUser = await User.create({
      fullName,
      email,
      password: hashPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      return res.status(200).json({
        newUser,
        success: true,
        message: "User created successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    generateToken(user._id, res);
    return res.status(200).json({
      user,
      success: true,
      message: "Login Successfully",
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwtToken", "", { maxAge: 0 });
    return res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
};

const updateProfile = async (req, res) => {

  try {
    const userId = req.user._id;

    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({
        success: false,
        message: "Profile pic required",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    if (!uploadResponse) {
      return res.status(400).json({
        success: false,
        message: "Error in uploading",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    return res.status(200).json({
      updatedUser,
      success: true,
      message: "Profile Updated Successfully",
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
};


const checkAuth = async(req ,res )=>{
  try {

    const user = req.user
    return res.status(200).json({
      user,
      success: true,
      message:"Check auth user"
    })
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error}`,
    });
  }
}
export { signup, login, logout, updateProfile, checkAuth};
