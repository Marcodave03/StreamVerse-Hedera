import express from "express";
import {
  getRooms,
  createRoom,
  joinRoom,
  getLiveRooms,
  startStream,
  stopStream,
  getStream,
  getStreamer,
  searchStream,
  getAllStreams,
} from "../controllers/StreamingController.js";

const router = express.Router();

router.get("/streamer/:topic_id", getStreamer);
router.get("/search/:search", searchStream);
router.get("/:user_id", getStream);
router.get("/rooms", getRooms);
router.post("/rooms", createRoom);
router.post("/join-room", joinRoom);
router.get("/live-rooms", getLiveRooms);
router.patch("/start-stream", startStream);
router.post("/stop-stream", stopStream);
router.get("/", getAllStreams);

export default router;
