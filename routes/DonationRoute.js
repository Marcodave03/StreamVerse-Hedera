import express from "express";
import DonationController from "../controllers/DonationController.js";
import { authMiddleware } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/donate", authMiddleware, DonationController.donateToStreamer);
router.get("/stream/:roomId/receiver", DonationController.getReceiverAccountId);

export default router;
