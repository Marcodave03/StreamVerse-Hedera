import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  PrivateKey,
  Client,
  AccountCreateTransaction,
  TopicCreateTransaction,
  Hbar,
} from "@hashgraph/sdk";
import dotenv from "dotenv";
import Profiles from "../models/Profile.js";
import Streams from "../models/Stream.js";

dotenv.config();
const client = Client.forTestnet();

export const register = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(401).json({ message: "Email is already in use" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const privateKey = PrivateKey.generate();
    const publicKey = privateKey.publicKey;

    client.setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      process.env.HEDERA_PRIVATE_KEY
    );

    const transactionResponse = await new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(2))
      .execute(client);

    const receipt = await transactionResponse.getReceipt(client);
    const hederaAccountId = receipt.accountId.toString();

    const user = await User.create({
      email,
      password: hashPassword,
      hederaAccountId,
      hederaPrivateKey: privateKey.toString(),
    });

    await Profiles.create({
      user_id: user.id,
      full_name: username,
    });

    const transaction = await new TopicCreateTransaction()
      .setTopicMemo("Live Streaming Room")
      .execute(client);
    const topicReceipt = await transaction.getReceipt(client);
    const topicId = topicReceipt.topicId.toString();

    await Streams.create({
      user_id: user.id,
      title: "Untitled Stream",
      thumbnail: null,
      stream_url: topicId,
      is_live: false,
      topic_id: topicId,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error during registration: ", error);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const index = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    try {
      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Profiles,
            as: "profile",
            attributes: [
              "full_name",
              "bio",
              "gender",
              "date_of_birth",
              "wallet_address",
              "profile_picture",
            ],
          },
          {
            model: Streams,
            as: "stream",
            attributes: [
              "title",
              "thumbnail",
              "stream_url",
              "is_live",
              "topic_id",
            ],
          },
        ],
        attributes: { exclude: ["password", "hederaPrivateKey"] },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user: ", error);
      res
        .status(500)
        .json({ message: "An error occurred while fetching the user" });
    }
  });
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isBlacklisted = await BlacklistedToken.findOne({ where: { token } });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is already blacklisted" });
    }
    await BlacklistedToken.create({ token });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    console.error("Logout error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  register,
  login,
  index,
  logout,
};
