import Follower from "../models/Follower.js";
import User from "../models/User.js";
import Profiles from "../models/Profile.js";
import Streams from "../models/Stream.js";

export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { followingId } = req.body;

    if (!userId || !followingId) {
      return res.status(400).json({ error: "Missing user ID or following ID" });
    }

    if (userId === followingId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const followExists = await Follower.findOne({
      where: { follower_id: userId, following_id: followingId },
    });

    if (followExists) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    }

    const newFollow = await Follower.create({
      follower_id: userId,
      following_id: followingId,
    });

    res
      .status(201)
      .json({ message: "Successfully followed the user", newFollow });
  } catch (error) {
    console.error("Error in followUser controller:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { followingId } = req.body;

    const followExists = await Follower.findOne({
      where: { follower_id: userId, following_id: followingId },
    });

    if (!followExists) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    await Follower.destroy({
      where: { follower_id: userId, following_id: followingId },
    });

    res.status(200).json({ message: "Successfully unfollowed the user" });
  } catch (error) {
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await Follower.findAll({
      where: { following_id: userId },
      include: [
        {
          model: User,
          as: "Followed",
          include: [
            {
              model: Profiles,
              as: "profile",
              attributes: ["full_name"],
            },
          ],
        },
      ],
    });

    const followerList = followers.map((follower) => ({
      followerId: follower.follower_id,
      fullName: follower.Followed.profile.full_name,
    }));

    res.status(200).json(followerList);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve followers" });
  }
};

export const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await Follower.findAll({
      where: { follower_id: userId },
      include: [
        {
          model: User,
          as: "Following",
          include: [
            {
              model: Profiles,
              as: "profile",
              attributes: ["full_name", "profile_picture"],
            },
            {
              model: Streams,
              as: "stream",
              attributes: ["is_live", "topic_id"],
            },
          ],
        },
      ],
    });

    const followingList = following.map((followingUser) => ({
      followingId: followingUser.following_id,
      fullName: followingUser.Following.profile.full_name,
      isLive: followingUser.Following.stream.is_live,
      topicId: followingUser.Following.stream.topic_id,
      profilePicture: followingUser.Following.profile.profile_picture,
    }));

    res.status(200).json(followingList);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve following" });
  }
};
