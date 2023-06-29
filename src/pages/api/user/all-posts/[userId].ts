import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models/user";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from "@/lib/verifyToken";
import { ObjectId } from "mongodb";

// GET - GET ALL POST OF A USER BY ID - POPULATE FOLLOWERS, FOLLOWING, AND BOOKMARKS
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // get auth token from header
  const token = req.headers.authorization;
  // if token is not provided, return error response
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const tokenData: any = verifyToken(token);
  // if token is not valid, return error response
  if (!tokenData) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    await connectMongoDB();

    const userId = req.query.userId as string;
    // GET USER ID FROM URL
    if (!userId)
      return res.status(400).json({ message: "Post ID is required" });

    // CHECK IF USER EXISTS
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // GET POST BY AUTHOR ID
    const posts = await Post.find({ author: new ObjectId(userId) }).populate(
      [
        { path: "author", select: "_id firstName lastName pic username" },
        { path: "comments.user", select: "_id firstName lastName pic username" },
        { path: "likes.likedBy", select: "_id firstName lastName pic username" },
        { path: "likes.dislikedBy", select: "_id firstName lastName pic username" }
      ]
    ).sort({ createdAt: -1 });
    return res.status(200).json({ posts });
  }
  catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}

export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);
  return handler(req, res);
}   
