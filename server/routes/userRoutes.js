import express from "express";
import {
  register,
  login,
  logout,
  donate,
} from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authToken.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticateToken, logout);
router.post("/donate", authenticateToken, donate);

export default router;



