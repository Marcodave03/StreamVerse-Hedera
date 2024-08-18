import express from "express";
import AccountController from "../controllers/AccountController.js";

const router = express.Router();

router.patch("/update-profile", AccountController.updateProfile);
router.patch("/update-profile-picture", AccountController.updateProfilePicture);
router.get("/balance", AccountController.showUserBalance);
router.get("/account-id", AccountController.showUserHederaAccountId);

export default router;
