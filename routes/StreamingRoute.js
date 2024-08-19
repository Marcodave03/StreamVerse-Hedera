import express from "express";
import {
  getRooms,
  createRoom,
  joinRoom,
  getLiveRooms,
  startStream,
  stopStream,
} from "../controllers/StreamingController.js";

const router = express.Router();

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.post("/join-room", joinRoom);
router.get("/live-rooms", getLiveRooms);
router.post("/start-stream", startStream);
router.post("/stop-stream", stopStream);

export default router;
