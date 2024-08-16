import express from "express";
import {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
} from "../controllers/FollowerController.js";

const router = express.Router();

router.post("/follow", followUser);
router.post("/unfollow", unfollowUser);
router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/following", getUserFollowing);

export default router;
