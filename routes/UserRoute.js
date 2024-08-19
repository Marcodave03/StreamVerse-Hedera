import express from "express";
import UserController from "../controllers/UserController.js";

const router = express.Router();

router.get("/", UserController.getAllUsers);
router.get("/name/:name", UserController.getUsersByName);

export default router;
