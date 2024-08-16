import Follower from "../models/Follower.js";
import User from "../models/User.js";

// Follow a user
export const followUser = async (req, res) => {
  const { follower_id, following_id } = req.body;

  try {
    // Check if already following
    const existingFollow = await Follower.findOne({
      where: {
        follower_id,
        following_id,
      },
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user." });
    }

    // Create new follow relationship
    const follow = await Follower.create({
      follower_id,
      following_id,
    });

    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow a user
export const unfollowUser = async (req, res) => {
  const { follower_id, following_id } = req.body;

  try {
    const follow = await Follower.findOne({
      where: {
        follower_id,
        following_id,
      },
    });

    if (!follow) {
      return res.status(404).json({ message: "You are not following this user." });
    }

    await follow.destroy();
    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserFollowers = async (req, res) => {
  const { user_id } = req.params;

  try {
    const followers = await Follower.findAll({
      where: {
        following_id: user_id,
      },
      include: [
        {
          model: User,
          as: "Followed", 
          attributes: ["id", "email"],
        },
      ],
    });

    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserFollowing = async (req, res) => {
  const { user_id } = req.params;

  try {
    const following = await Follower.findAll({
      where: {
        follower_id: user_id,
      },
      include: [
        {
          model: User,
          as: "Following", 
          attributes: ["id", "email"],
        },
      ],
    });

    res.status(200).json(following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
