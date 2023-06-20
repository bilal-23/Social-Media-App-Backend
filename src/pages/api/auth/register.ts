import { User } from "@/models/user";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { runMiddleware } from "@/lib/middleware";
import { hashPassword } from "@/lib/hashpassword";

// Create a new user
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectMongoDB();
    // Extract values from req.body
    const { firstName, lastName, username, email, password } = req.body;

    // Check if the user with email already exists
    const userEmail = await User.findOne({ email });
    if (userEmail) {
      return res
        .status(400)
        .json({ message: "Email linked to different account" });
    }
    const userUsername = await User.findOne({ username });
    if (userUsername) {
      return res.status(400).json({ message: "Username not available" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Bad request", error: "Invalid email" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          message: "Bad request",
          error: "Password should be at least 6 characters in length",
        });
    }

    const hashedPassword = await hashPassword(password);
    // Create a new user object
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}

export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);
  return handler(req, res);
}
