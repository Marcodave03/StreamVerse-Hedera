import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AccountBalanceQuery, Client } from "@hashgraph/sdk";
import dotenv from "dotenv";
import Profiles from "../models/Profile.js";

dotenv.config();

const client = Client.forTestnet();

export const showUserBalance = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(user.hederaAccountId)
      .execute(client);

    res.status(200).json({ balance: accountBalance.hbars.toString() });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: error.message });
  }
};

export const showUserHederaAccountId = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["email", "hederaAccountId"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      email: user.email,
      hederaAccountId: user.hederaAccountId,
    });
  } catch (error) {
    console.error("Error fetching account info:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const profile = await Profiles.findOne({
      where: { user_id: decoded.id },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { profile_picture } = req.body;

    await profile.update({ profile_picture });

    res.status(200).json({ message: "Profile picture updated" });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const profile = await Profiles.findOne({
      where: { user_id: decoded.id },
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const { full_name, bio, gender, date_of_birth } = req.body;

    await profile.update({ full_name, bio, gender, date_of_birth });

    res.status(200).json({ message: "Profile updated" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: error.message });
  }
};

export const showUserName = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const profile = await Profiles.findOne({
      where: { user_id: decoded.id },
      attributes: ["full_name"], // Only fetch the full name
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ full_name: profile.full_name });
  } catch (error) {
    console.error("Error fetching user name:", error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  showUserBalance,
  showUserHederaAccountId,
  updateProfilePicture,
  updateProfile,
  showUserName,
};
