import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const rooms = {};

const handleJoinRoom = (socket) => (roomId, role) => {
  if (!rooms[roomId]) {
    rooms[roomId] = { streamers: [], watchers: [] };
  }

  if (role === "streamer") {
    rooms[roomId].streamers.push(socket.id);
  } else if (role === "watcher") {
    rooms[roomId].watchers.push(socket.id);
  }

  socket.join(roomId);
  console.log(`User ${socket.id} joined room: ${roomId} as ${role}`);

  socket.to(roomId).emit("user-connected", { id: socket.id, role });
};

const handleSignal = (socket) => (data) => {
  const { signalData, targetId } = data;
  socket.to(targetId).emit("signal", {
    signalData,
    from: socket.id,
  });
};

const handleDisconnect = (socket) => (role, roomId) => {
  console.log(`User disconnected: ${socket.id}`);

  if (role === "streamer") {
    rooms[roomId].streamers = rooms[roomId].streamers.filter(
      (id) => id !== socket.id
    );
  } else if (role === "watcher") {
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
    console.log(`Room ${roomId} deleted due to inactivity.`);
  }
};

const handleStopStream = (socket) => (roomId) => {
  if (rooms[roomId]) {
    rooms[roomId].streamers = rooms[roomId].streamers.filter(
      (id) => id !== socket.id
    );
    socket.to(roomId).emit("stream-stopped", socket.id);
  }
};

export const initializeSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", handleJoinRoom(socket));
    socket.on("signal", handleSignal(socket));
    socket.on("offer", (roomId, offer) => {
      socket.to(roomId).emit("offer", offer);
    });
    socket.on("answer", (roomId, answer) => {
      socket.to(roomId).emit("answer", answer);
    });
    socket.on("ice-candidate", (roomId, candidate) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });
    socket.on("disconnect", () =>
      handleDisconnect(socket, socket.role, socket.roomId)
    );
    socket.on("stop-stream", (roomId) => handleStopStream(socket, roomId));
  });

  return io;
};

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
