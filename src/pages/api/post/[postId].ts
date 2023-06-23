import { ObjectId } from "mongodb";
import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from "@/lib/verifyToken";

// GET - GET POST BY ID - POPULATE FOLLOWERS, FOLLOWING, AND BOOKMARKS
// PATCH - UPDATE POST BY ID
// DELETE - DELETE POST BY ID
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (
    req.method !== "GET" &&
    req.method !== "PATCH" &&
    req.method !== "DELETE"
  ) {
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
    // GET USER ID FROM URL
    const postId = req.query.postId as string;
    if (!postId)
      return res.status(400).json({ message: "Post ID is required" });

    // GET POST BY ID
    if (req.method === "GET") {
      const post = await getPostById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      return res.status(200).json({ post });
    }

    // UPDATE POST BY ID
    else if (req.method === "PATCH") {
      // GET UPDATED CONTENT FROM BODY
      const { content, imgURL = "" } = req.body;
      if (!content)
        return res.status(400).json({ message: "Content is required" });

      // UPDATE POST BY ID
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      // CHECK IF AUTHOR IS CURRENT USER
      if (post.author.toString() !== userId)
        return res
          .status(401)
          .json({ message: "You are not allowed to edit this post" });
      post.content = content;
      post.imgURL = imgURL;
      await post.save();

      return res.status(200).json({ message: "Post updated successfully" });
    }

    // DELETE POST BY ID
    else if (req.method === "DELETE") {
      // DELETE POST BY ID
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      // CHECK IF AUTHOR IS CURRENT USER
      if (post.author.toString() !== userId)
        return res
          .status(401)
          .json({ message: "You are not delete this post" });
      await Post.deleteOne({ _id: new ObjectId(postId) });
      return res.status(200).json({ message: "Post deleted successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}

async function getPostById(postId: string) {
  return await Post.findById(postId).populate([
    { path: "author", select: "_id firstName lastName pic username" },
    { path: "comments.user", select: "_id firstName lastName pic username" },
    { path: "likes.likedBy", select: "_id firstName lastName pic username" },
    { path: "likes.dislikedBy", select: "_id firstName lastName pic username" },
  ]);
}

export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res);
  return handler(req, res);
}
