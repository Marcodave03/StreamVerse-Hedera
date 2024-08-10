import jwt from "jsonwebtoken";
import Users from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = await Users.findByPk(user.id);

    if (!req.user || req.user.jwt_token !== token) {
      return res
        .status(403)
        .json({ message: "Token mismatch or user not found" });
    }

    next();
  });
};
