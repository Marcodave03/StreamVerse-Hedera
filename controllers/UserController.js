import Profiles from "../models/Profile.js";
import User from "../models/User.js";

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

// Get users by name from Profiles
export const getUsersByName = async (req, res) => {
  const { name } = req.params;

  try {
    const profiles = await Profiles.findAll({
      where: {
        full_name: name,
      },
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

    if (profiles.length === 0) {
      return res.status(404).json({ message: "No users found with that name" });
    }

    res.json(profiles);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve users", error: error.message });
  }
};

export default {
  getAllUsers,
  getUsersByName,
};
