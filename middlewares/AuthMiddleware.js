import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // Check if the Authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Authorization token missing or invalid" });
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Verify the token using your JWT secret key
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user associated with the token
    const user = await User.findByPk(decodedToken.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach the user object to the request object
    req.user = user;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};
