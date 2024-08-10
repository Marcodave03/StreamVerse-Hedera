import express from "express";
import { getRooms, createRoom } from "../controllers/streamingController.js";

const router = express.Router();

router.get("/rooms", getRooms);
router.post("/rooms", createRoom);

export default router;
