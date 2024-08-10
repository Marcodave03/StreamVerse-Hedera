// server.js

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import UserRouter from "./routes/userRoutes.js"; // Ensure this is pointing to your user routes file
import { donate } from "./controllers/userController.js"; // Import the donate function correctly

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

let rooms = {};

// Setup Socket.IO connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    rooms[roomId].push(socket.id);
    socket.join(roomId);

    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("user-connected", socket.id);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      socket.to(roomId).emit("user-disconnected", socket.id);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    });

    socket.on("screen-data", (data) => {
      const { stream } = data;
      socket.to(roomId).emit("receive-screen", stream);
    });
  });
});

// Define HTTP routes
app.get("/rooms", (req, res) => {
  res.json(Object.keys(rooms));
});

app.post("/rooms", (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: "Room ID is required" });
  }
  if (rooms[roomId]) {
    return res.status(400).json({ error: "Room already exists" });
  }
  rooms[roomId] = [];
  res.status(201).json({ message: `Room ${roomId} created` });
});

app.post("/donate", async (req, res) => {
  try {
    const { receiverAccountId, amount } = req.body;

    if (!receiverAccountId || !amount) {
      return res
        .status(400)
        .json({ message: "Receiver account ID and amount are required" });
    }

    const donationStatus = await donateHbar(receiverAccountId, amount);

    res
      .status(200)
      .json({ message: "Donation successful", status: donationStatus });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing donation", error: error.message });
  }
});

app.use(UserRouter);

const port = process.env.PORT || 5080;
server.listen(port, () => console.log(`Server running on port ${port}`));
