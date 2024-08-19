import express from "express";
import {
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
} from "../controllers/FollowerController.js";

const router = express.Router();

router.post("/:userId/follow", followUser);
router.post("/:userId/unfollow", unfollowUser);
router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/following", getUserFollowing);

export default router;
