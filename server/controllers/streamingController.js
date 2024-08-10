import { Server } from "socket.io";

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
    });

    socket.on("screen-data", (data) => {
      const { roomId, track } = data;
      socket.to(roomId).emit("receive-screen", track);
    });
  });

  return io;
};

export const getRooms = (req, res) => {
  res.json(Object.keys(rooms));
};

export const createRoom = (req, res) => {
  const { roomId } = req.body;
  if (!roomId) {
    return res.status(400).json({ error: "Room ID is required" });
  }
  if (rooms[roomId]) {
    return res.status(400).json({ error: "Room already exists" });
  }
  rooms[roomId] = [];
  res.status(201).json({ message: `Room ${roomId} created` });
};
