import express from "express";
import AccountController from "../controllers/AccountController.js";

const router = express.Router();

router.patch("/update-profile-picture", AccountController.updateProfilePicture);
router.get("/balance", AccountController.showUserBalance);
router.get("/account-id", AccountController.showUserHederaAccountId);
router.get("/name", AccountController.showUserName);

export default router;
