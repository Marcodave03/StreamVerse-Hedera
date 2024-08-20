import Follower from "../models/Follower.js";
import Profiles from "../models/Profile.js";
import Streams from "../models/Stream.js";
import User from "../models/User.js";
import { Op, Sequelize } from "sequelize";

// Get all users from Profiles
export const getAllUsers = async (req, res) => {
  try {
    const profiles = await Profiles.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id"], // Only include the user_id from the User table
        },
      ],
      attributes: [
        "user_id", // Include user_id from the Profiles table
        "full_name",
        "bio",
        "gender",
        "date_of_birth",
        "wallet_address",
        "profile_picture",
      ],
    });
    res.json(profiles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: error.message });
  }
};

export const getUsersByName = async (req, res) => {
  const { name } = req.params;

  try {
    const profiles = await Profiles.findAll({
      where: {
        full_name: {
          [Op.like]: `%${name}%`,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: [],
          include: [
            {
              model: Streams,
              as: "stream",
              attributes: [],
              required: false,
            },
          ],
        },
      ],
      attributes: [
        "user_id",
        "full_name",
        "bio",
        "profile_picture",
        [Sequelize.col("user.stream.topic_id"), "topic_id"],
        [Sequelize.col("user.stream.title"), "stream_title"],
        [Sequelize.col("user.stream.is_live"), "stream_is_live"],
      ],
    });

    for (let profile of profiles) {
      const followerCount = await Follower.count({
        where: { following_id: profile.user_id },
      });
      profile.dataValues.followerCount = followerCount;
    }

    if (profiles.length === 0) {
      return res.status(404).json({ message: "No users found with that name" });
    }

    res.json(profiles);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve users",
      error: error.message,
    });
  }
};

export default {
  getAllUsers,
  getUsersByName,
};
