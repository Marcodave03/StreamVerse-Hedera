// src/routes/donation.js
import express from "express";
import { donate } from "../controllers/donationController.js";

const router = express.Router();

router.post("/donate", donate);

export default router;
