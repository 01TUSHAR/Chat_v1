import express, { json } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

dotenv.config({path:"../../.env"});


connectDB();

app.use(
  cors({
    origin: ["http://localhost:5173","https://chat-v1-1.onrender.com"],
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
