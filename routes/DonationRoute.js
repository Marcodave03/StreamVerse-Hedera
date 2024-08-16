import express from "express";
import DonationController from "../controllers/DonationController.js";

const router = express.Router();

router.post("/donate", DonationController.donate);

export default router;
