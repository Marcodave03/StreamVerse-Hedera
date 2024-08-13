import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const rooms = {};

// Initialize Socket.io and handle events
export const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (roomId, role) => {
      if (!rooms[roomId]) {
        rooms[roomId] = { streamers: [], watchers: [] };
      }

      if (role === "streamer") {
        rooms[roomId].streamers.push(socket.id);
      } else if (role === "watcher") {
        rooms[roomId].watchers.push(socket.id);

        // Send streamers' IDs to the new watcher
        rooms[roomId].streamers.forEach((streamerId) => {
          socket.emit("user-connected", { id: streamerId, role: "streamer" });
        });
      }

      socket.join(roomId);

      console.log(`User ${socket.id} joined room: ${roomId} as ${role}`);
      socket.to(roomId).emit("user-connected", { id: socket.id, role });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        if (rooms[roomId].streamers.includes(socket.id)) {
          rooms[roomId].streamers = rooms[roomId].streamers.filter(
            (id) => id !== socket.id
          );
        } else if (rooms[roomId].watchers.includes(socket.id)) {
          rooms[roomId].watchers = rooms[roomId].watchers.filter(
            (id) => id !== socket.id
          );
        }

        socket.to(roomId).emit("user-disconnected", { id: socket.id, role });

        if (
          rooms[roomId].streamers.length === 0 &&
          rooms[roomId].watchers.length === 0
        ) {
          delete rooms[roomId];
        }
      });

      socket.on("signal", (data) => {
        socket.to(roomId).emit("signal", data);
      });
    });

    socket.on("stop-stream", (roomId) => {
      if (rooms[roomId]) {
        rooms[roomId].streamers = rooms[roomId].streamers.filter(
          (id) => id !== socket.id
        );
        socket.to(roomId).emit("stream-stopped", socket.id);
      }
    });
  });

  return io;
};

// Express route handlers

export const getRooms = (req, res) => {
  res.json(Object.keys(rooms));
};

export const createRoom = (req, res) => {
  const roomId = uuidv4();
  rooms[roomId] = { streamers: [], watchers: [] };
  res.status(201).json({ message: `Room ${roomId} created`, roomId });
};

export const joinRoom = (req, res) => {
  const { roomId, role } = req.body;
  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.status(200).json({ message: `Joined room ${roomId} as ${role}`, roomId });
};
