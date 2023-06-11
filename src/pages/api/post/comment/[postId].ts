import { ObjectId } from "mongodb";
import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models/user";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from "@/lib/verifyToken";

// GET - GET COMMENTS OF A POST BY ID
//POST - ADD COMMENT TO A POST
// PATCH - UPDATE COMMENT OF A POST
async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET" && req.method !== "POST" && req.method !== "PATCH" && req.method !== "DELETE") {
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
        // GET POST ID FROM URL
        const postId = req.query.postId as string;
        if (!postId) return res.status(400).json({ message: "Post ID is required" });

        const post = await getPostById(postId);
        if (!post) return res.status(404).json({ message: "Post Not Found" });

        // GET COMMENTS OF A POST
        if (req.method === "GET") {
            return res.status(200).json({ comments: post.comments.sort((a: any, b: any) => b.createdAt - a.createdAt) });
        }

        // ADD NEW COMMENT TO A POST
        if (req.method === "POST") {
            const { comment } = req.body;
            if (!comment) return res.status(400).json({ message: "Comment is required" });
            if (!userId) return res.status(400).json({ message: "User ID is required" });

            // Check if user id is valid
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User Not Found" });

            // Add comment to post
            const newComment = {
                _id: new ObjectId(),
                comment,
                user: new ObjectId(userId),
                createdAt: new Date(),
                updatedAt: new Date()
            }
            post.comments.push(newComment);
            await post.save();

            return res.status(200).json({ message: "Comment Added Successfully", comment: newComment });
        }

        // UPDATE COMMENT OF A POST
        if (req.method === "PATCH") {
            const { commentId, comment } = req.body;
            if (!commentId) return res.status(400).json({ message: "Comment ID is required" });
            if (!comment) return res.status(400).json({ message: "Comment is required" });

            // Check if user id is valid
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ message: "User Not Found" });

            // Check if comment id is valid
            const commentIndex = post.comments.findIndex((comment: any) => comment._id.toString() === commentId);
            if (commentIndex === -1) return res.status(404).json({ message: "Comment Not Found" });

            if (post.comments[commentIndex].user._id.toString() !== userId) {
                return res.status(403).json({ message: "You are not allowed to update this comment" });
            }



            post.comments[commentIndex].comment = comment;
            post.comments[commentIndex].updatedAt = new Date();
            await post.save();

            return res.status(200).json({ message: "Comment Updated Successfully", comment: post.comments[commentIndex] });
        }

    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}

async function getPostById(postId: string) {
    return await Post.findById(postId).populate(
        [
            { path: "author", select: "_id firstName pic username" },
            { path: "comments.user", select: "_id firstName pic username" },
            { path: "likes.likedBy", select: "_id firstName pic username" },
            { path: "likes.dislikedBy", select: "_id firstName pic username" }
        ]
    );
}
export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res);
    return handler(req, res);
}   