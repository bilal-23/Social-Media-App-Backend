import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models/user";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from "@/lib/verifyToken";

// Get ALL POSTS - POPULATES AUTHOR AND COMMENTS
// Create a POST
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
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
  // if token is valid, extract userId from token
  const userId = tokenData.userId;

  try {
    await connectMongoDB();
    // Get ALL POSTS
    if (req.method === "GET") {
      const posts = await getPosts();
      return res.status(200).json({ posts });
    }
    //
    //
    // Create a POST
    else if (req.method === "POST") {
      const { content, imgURL = "" } = req.body;

      if (!content) {
        return res.status(400).json({ message: "Bad Request" });
      }

      // FIND USER WITH EMAIL
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User Not Found" });
      }

      const newPost = new Post({
        content,
        imgURL,
        author: userId,
      });

      await newPost.save();
      return res.status(201).json({ message: "Post Created" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}

async function getPosts() {
  const posts = await Post.find({})
    .populate([
      { path: "author", select: "_id firstName pic username" },
      { path: "comments.user", select: "_id firstName pic username" },
    ])
    .sort({ createdAt: -1 }); // -1: DESC, 1: ASC
  return posts;
}

export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);
  return handler(req, res);
}
