import Follower from "../models/Follower.js";
import User from "../models/User.js";
import Profiles from "../models/Profile.js"; // Import Profiles model

// Follow a user
export const followUser = async (req, res) => {
  const { follower_id, following_id } = req.body;

  console.log("follower_id:", follower_id); // Debugging log
  console.log("following_id:", following_id); // Debugging log

  try {
    if (!follower_id || !following_id) {
      return res
        .status(400)
        .json({ message: "Follower ID or Following ID is missing." });
    }

    const existingFollow = await Follower.findOne({
      where: {
        follower_id,
        following_id,
      },
    });

    if (existingFollow) {
      return res.status(400).json({ message: "Already following this user." });
    }

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

  console.log("follower_id:", follower_id); // Debugging log
  console.log("following_id:", following_id); // Debugging log

  try {
    if (!follower_id || !following_id) {
      return res
        .status(400)
        .json({ message: "Follower ID or Following ID is missing." });
    }

    const follow = await Follower.findOne({
      where: {
        follower_id,
        following_id,
      },
    });

    if (!follow) {
      return res
        .status(404)
        .json({ message: "You are not following this user." });
    }

    await follow.destroy();
    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user's followers
export const getUserFollowers = async (req, res) => {
  const { user_id } = req.params;

  console.log("user_id:", user_id); // Debugging log

  try {
    if (!user_id) {
      return res.status(400).json({ message: "User ID is missing." });
    }

    const followers = await Follower.findAll({
      where: {
        following_id: user_id,
      },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "email"],
          include: [
            {
              model: Profiles,
              as: "profile",
              attributes: ["full_name"], // Use full_name instead of username
            },
          ],
        },
      ],
    });

    res.status(200).json(
      followers.map((f) => ({
        user_id: f.follower.id,
        email: f.follower.email,
        full_name: f.follower.profile.full_name, // Return full_name
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a user's following
export const getUserFollowing = async (req, res) => {
  const { user_id } = req.params;

  console.log("user_id:", user_id); // Debugging log

  try {
    if (!user_id) {
      return res.status(400).json({ message: "User ID is missing." });
    }

    const following = await Follower.findAll({
      where: {
        follower_id: user_id,
      },
      include: [
        {
          model: User,
          as: "following",
          attributes: ["id", "email"],
          include: [
            {
              model: Profiles,
              as: "profile",
              attributes: ["full_name"], // Use full_name instead of username
            },
          ],
        },
      ],
    });

    res.status(200).json(
      following.map((f) => ({
        user_id: f.following.id,
        email: f.following.email,
        full_name: f.following.profile.full_name, // Return full_name
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
