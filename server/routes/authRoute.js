import express from "express";
import { register, login, getBalance, getAccount } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/balance", getBalance);
router.get("/account", getAccount);

export default router;
