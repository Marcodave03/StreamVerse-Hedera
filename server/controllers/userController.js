import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import Users from "../models/userModel.js";
import donateHbar from "./hederaController.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const register = async (req, res) => {
  try {
    const { username, email, password, hedera_account_id } = req.body;
    if (!username || !email || !password || !hedera_account_id) {
      return res.status(401).json({ message: "All fields are required" });
    }

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
      hedera_account_id,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    user.jwt_token = token;
    await user.save();

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

export const getAuthUser = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await Users.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  });
};

export const logout = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await Users.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.jwt_token = null;
    await user.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};

export const donate = async (req, res) => {
  try {
    const { receiverAccountId, amount } = req.body;

    if (!receiverAccountId || !amount) {
      return res
        .status(400)
        .json({ message: "Receiver account ID and amount are required" });
    }

    const donationStatus = await donateHbar(receiverAccountId, amount);

    res
      .status(200)
      .json({ message: "Donation successful", status: donationStatus });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing donation", error: error.message });
  }
};
