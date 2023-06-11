import { User } from "@/models/user";
import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from '@/lib/verifyToken';

// Like a post
async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
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
        // GET USER ID AND POST ID FROM REQUEST BODY
        const { postId } = req.body;
        if (!userId || !postId) {
            return res.status(400).json({ message: "Missing userId or postId" });
        }
        // FIND USER BY ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Increase like field by one
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // CHECK IF ALREADY LIKED
        if (post.likes.likedBy.includes(userId)) {
            return res.status(400).json({ message: "Post is already liked" });
        }

        post.likes.likedBy.push(userId);
        // Remove user from dislikedBy array if present
        const index = post.likes.dislikedBy.indexOf(userId);
        if (index > -1) {
            post.likes.dislikedBy.splice(index, 1);
        }
        post.likes.likeCount = post.likes.likedBy.length;
        await post.save();

        return res.status(200).json({ message: "Post liked successfully" });

    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}

export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res);
    return handler(req, res);
}   