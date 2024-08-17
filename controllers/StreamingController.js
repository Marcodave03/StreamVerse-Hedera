import { Server } from "socket.io";
import {
  Client,
  TopicMessageSubmitTransaction,
  TopicCreateTransaction,
} from "@hashgraph/sdk";
import dotenv from "dotenv";
import Streams from "../models/Stream.js"; // Import the Streams model

dotenv.config();

const rooms = {};

const client = Client.forTestnet();
try {
  client.setOperator(
    process.env.HEDERA_ACCOUNT_ID,
    process.env.HEDERA_PRIVATE_KEY
  );
} catch (error) {
  console.error("Failed to set up Hedera client operator:", error);
  process.exit(1);
}

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

export const startStream = async (req, res) => {
  const { roomId } = req.body;

  try {
    // Find the stream associated with the roomId
    const stream = await Streams.findOne({ where: { stream_url: roomId } });

    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    // Update the stream's is_live status to true
    stream.is_live = true;
    await stream.save();

    res.status(200).json({ message: "Stream started successfully" });
  } catch (error) {
    console.error("Error starting stream:", error);
    res.status(500).json({ error: "Failed to start stream" });
  }
};

export const stopStream = async (req, res) => {
  const { roomId } = req.body;

  try {
    const stream = await Streams.findOne({ where: { stream_url: roomId } });

    if (!stream) {
      return res.status(404).json({ error: "Stream not found" });
    }

    stream.is_live = false;
    await stream.save();

    res.status(200).json({ message: "Stream stopped successfully" });
  } catch (error) {
    console.error("Error stopping stream:", error);
    res.status(500).json({ error: "Failed to stop stream" });
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
  const { userId, title } = req.body;

  try {
    let existingStream = await Streams.findOne({ where: { user_id: userId } });

    let topicId;
    if (existingStream) {
      topicId = existingStream.stream_url.split("/").pop();

      // Update the stream information if needed
      existingStream.title = title || existingStream.title;
      existingStream.stream_url = topicId;
      existingStream.is_live = false; // Set the stream status to live
      await existingStream.save();
    } else {
      const transaction = await new TopicCreateTransaction()
        .setTopicMemo("Live Streaming Room")
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      topicId = receipt.topicId.toString();

      existingStream = await Streams.create({
        user_id: userId,
        title: title || "Untitled Stream",
        thumbnail: null, // You can update this to handle a thumbnail if available
        stream_url: topicId, // Use topicId in the stream_url
        is_live: false, // Set stream status as live when created
      });
    }

    // Step 4: Store or update the room details in memory for streaming purposes
    rooms[topicId] = {
      streamers: [],
      watchers: [],
      currentOffer: null,
      iceCandidates: [],
    };

    // Step 5: Return the response to the client
    res.status(201).json({
      message: `Room ${topicId} created or updated`,
      roomId: topicId,
      streamData: existingStream, // Send back the stream data
    });
  } catch (error) {
    console.error("Error creating or updating room:", error);
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

export const getLiveRooms = async (req, res) => {
  try {
    // Fetch only the streams that are live
    const liveStreams = await Streams.findAll({
      where: { is_live: true },
      attributes: ["stream_url"], // Only return the stream_url
    });

    const liveRooms = liveStreams.map((stream) => stream.stream_url);

    res.status(200).json(liveRooms);
  } catch (error) {
    console.error("Error fetching live rooms:", error);
    res.status(500).json({ error: "Failed to fetch live rooms" });
  }
};
