import express from "express";
import {
  getRooms,
  createRoom,
  joinRoom,
  getLiveRooms, // Add this line
  startStream,
  stopStream,
} from "../controllers/StreamingController.js";

const router = express.Router();

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.post("/join-room", joinRoom);
router.get("/live-rooms", getLiveRooms); // Add this route
router.post("/start-stream", startStream);
router.post("/stop-stream", stopStream);

export default router;
