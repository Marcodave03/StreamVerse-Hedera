import { Server } from "socket.io";
import { v4 as uuidv4 } from 'uuid';

const rooms = {};

export const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

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

      socket.on("signal", (data) => {
        socket.to(roomId).emit("signal", data);
      });
    });
  });

  return io;
};

export const getRooms = (req, res) => {
  res.json(Object.keys(rooms));
};

export const createRoom = (req, res) => {
  const roomId = uuidv4(); 
  rooms[roomId] = [];
  res.status(201).json({ message: `Room ${roomId} created`, roomId });
};

export const joinRoom = (req, res) => {
  const { roomId } = req.body;
  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.status(200).json({ message: `Joined room ${roomId}`, roomId });
};
