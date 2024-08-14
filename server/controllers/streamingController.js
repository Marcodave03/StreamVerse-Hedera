import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import {
  Client,
  TopicId,
  TopicMessageSubmitTransaction,
  TopicCreateTransaction,
  TopicMessageQuery,
} from "@hashgraph/sdk";
import dotenv from "dotenv";

const rooms = {};
const client = Client.forTestnet();
client.setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY
);

const handleJoinRoom = (socket) => (roomId, role) => {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      streamers: [],
      watchers: [],
      currentOffer: null,
      iceCandidates: [],
    };
  }

  if (role === "streamer") {
    rooms[roomId].streamers.push(socket.id);
  } else if (role === "watcher") {
    rooms[roomId].watchers.push(socket.id);
    if (rooms[roomId].currentOffer) {
      socket.emit("offer", rooms[roomId].currentOffer);
    }
    if (rooms[roomId].iceCandidates.length > 0) {
      console.log(
        `Sending ${rooms[roomId].iceCandidates.length} ICE candidates to watcher: ${socket.id}`
      );
      rooms[roomId].iceCandidates.forEach((candidate) => {
        socket.emit("ice-candidate", candidate);
      });
    }
  }

  socket.join(roomId);
  console.log(`User ${socket.id} joined room: ${roomId} as ${role}`);

  socket
    .to(roomId)
    .emit("user-connected", { id: socket.id, role, roomid: roomId });
};
const handleOffer = (socket) => (roomId, offer) => {
  if (rooms[roomId]) {
    rooms[roomId].currentOffer = offer;
  }
  socket.to(roomId).emit("offer", offer);
};

const handleIceCandidate = (socket) => (roomId, candidate) => {
  if (!rooms[roomId].iceCandidates) {
    rooms[roomId].iceCandidates = [];
  }
  rooms[roomId].iceCandidates.push(candidate);
  socket.to(roomId).emit("ice-candidate", candidate);
};

const handleDisconnect = (socket) => (role, roomId) => {
  console.log(`User disconnected: ${socket.id}`);

  if (role === "streamer") {
    rooms[roomId].streamers = rooms[roomId].streamers.filter(
      (id) => id !== socket.id
    );
    if (rooms[roomId].streamers.length === 0) {
      rooms[roomId].currentOffer = null;
      rooms[roomId].iceCandidates = [];
    }
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
    rooms[roomId].currentOffer = null;
    rooms[roomId].iceCandidates = [];
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
    socket.on("join-room", handleJoinRoom(socket));
    socket.on("offer", (roomId, offer) => handleOffer(socket)(roomId, offer));
    socket.on("answer", (roomId, answer) => {
      socket.to(roomId).emit("answer", answer);
    });
    socket.on("chat", (roomId, message) => {
      console.log(`Received chat message: ${message} from ${roomId}`);
      socket.to(roomId).emit("receive-chat", message);
    });
    socket.on("ice-candidate", (roomId, candidate) =>
      handleIceCandidate(socket)(roomId, candidate)
    );
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

export const createRoom = async (req, res) => {
  const transaction = await new TopicCreateTransaction()
    .setTopicMemo("Live Streaming Room")
    .execute(client);
  const receipt = await transaction.getReceipt(client);
  const topicId = receipt.topicId.toString();
  rooms[topicId] = {
    streamers: [],
    watchers: [],
    currentOffer: null,
    iceCandidates: [],
  };
  res.status(201).json({ message: `Room ${topicId} created`, roomId: topicId });
};

export const joinRoom = (req, res) => {
  const { roomId, role } = req.body;
  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.status(200).json({ message: `Joined room ${roomId} as ${role}`, roomId });
};
