import { Server } from "socket.io";
import dotenv from "dotenv";
import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
} from "@hashgraph/sdk";
import Streams from "../models/Stream.js";

dotenv.config();

const rooms = {};
const client = Client.forTestnet();

const handleJoinRoom = (socket) => async (roomId, role) => {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      streamers: [],
      watchers: [],
      currentOffer: null,
      iceCandidates: [],
    };
  }

  socket.roomId = roomId;
  socket.role = role;

  if (role === "streamer") {
    rooms[roomId].streamers.push(socket.id);

    const userId = socket.user.id;
    const stream = await Streams.findOne({ where: { user_id: userId } });
    if (stream) {
      stream.is_live = true;
      await stream.save();
    }
  } else if (role === "watcher") {
    rooms[roomId].watchers.push(socket.id);
    if (rooms[roomId].currentOffer) {
      socket.emit("offer", rooms[roomId].currentOffer);
    }
    if (rooms[roomId].iceCandidates.length > 0) {
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
  if (rooms[roomId]) {
    rooms[roomId].iceCandidates.push(candidate);
    socket.to(roomId).emit("ice-candidate", candidate);
  }
};

const handleDisconnect = (socket) => async () => {
  const { roomId, role } = socket;

  console.log(`User disconnected: ${socket.id}`);

  if (rooms[roomId]) {
    if (role === "streamer") {
      rooms[roomId].streamers = rooms[roomId].streamers.filter(
        (id) => id !== socket.id
      );
      if (rooms[roomId].streamers.length === 0) {
        rooms[roomId].currentOffer = null;
        rooms[roomId].iceCandidates = [];

        const userId = socket.user.id;
        const stream = await Streams.findOne({ where: { user_id: userId } });
        if (stream) {
          stream.is_live = false;
          await stream.save();
        }
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
  }
};

const handleStopStream = (socket) => async (roomId) => {
  if (rooms[roomId]) {
    rooms[roomId].streamers = rooms[roomId].streamers.filter(
      (id) => id !== socket.id
    );
    rooms[roomId].currentOffer = null;
    rooms[roomId].iceCandidates = [];
    socket.to(roomId).emit("stream-stopped", socket.id);

    const userId = socket.user.id;
    const stream = await Streams.findOne({ where: { user_id: userId } });
    if (stream) {
      stream.is_live = false;
      await stream.save();
    }
  }
};

const sendMessage = (message, roomId) => {
  try {
    new TopicMessageSubmitTransaction()
      .setTopicId(roomId)
      .setMessage(message)
      .execute(client);
  } catch (error) {
    console.error(error);
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
      sendMessage(message, roomId);
      socket.to(roomId).emit("chat", message);
    });
    socket.on("ice-candidate", (roomId, candidate) =>
      handleIceCandidate(socket)(roomId, candidate)
    );
    socket.on("disconnect", handleDisconnect(socket));
    socket.on("stop-stream", (roomId) => handleStopStream(socket)(roomId));
  });

  return io;
};

export const getRooms = (req, res) => {
  res.json(Object.keys(rooms));
};

export const createRoom = async (req, res) => {
  try {
    const { userId, title, stream_url } = req.body; // Assuming userId is sent in the request
    let stream = await Streams.findOne({ where: { user_id: userId } });

    if (stream) {
      stream.is_live = true;
      stream.title = title || stream.title;
      stream.stream_url = stream_url || stream.stream_url;
      await stream.save();
    } else {
      const transaction = await new TopicCreateTransaction()
        .setTopicMemo("Live Streaming Room")
        .execute(client);
      const receipt = await transaction.getReceipt(client);
      const topicId = receipt.topicId.toString();

      stream = await Streams.create({
        user_id: userId,
        title,
        stream_url,
        is_live: true,
      });

      rooms[topicId] = {
        streamers: [],
        watchers: [],
        currentOffer: null,
        iceCandidates: [],
      };
    }

    res.status(201).json({
      message: `Room ${stream.id} created or updated`,
      roomId: stream.id,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create or update room" });
  }
};

export const joinRoom = (req, res) => {
  const { roomId, role } = req.body;
  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }
  res.status(200).json({ message: `Joined room ${roomId} as ${role}`, roomId });
};
