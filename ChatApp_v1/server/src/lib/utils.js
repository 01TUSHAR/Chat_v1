import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({path:"../../.env"});

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwtToken", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development'
  });

  return token;
};
