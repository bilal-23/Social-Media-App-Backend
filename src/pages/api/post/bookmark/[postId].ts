import { ObjectId } from "mongodb";
import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models/user";
import verifyToken from "@/lib/verifyToken";
import { runMiddleware } from "@/lib/middleware";

//POST - BOOKMARK A POST
//DELETE - UNBOOKMARK A POST
async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST" && req.method !== "DELETE") {
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
        const _id = new ObjectId(postId);

        if (!userId) return res.status(400).json({ message: "User ID is required" });
        const _userId = new ObjectId(userId);

        const post = await getPostById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const user = await User.findOne({ _id: _userId });

        // ADD POST TO BOOKMARKS
        if (req.method === "POST") {
            // CHECK IF POST IS ALREADY BOOKMARKED
            const isBookmarked = user.bookmarks.includes(_id);
            if (isBookmarked) return res.status(400).json({ message: "Post already bookmarked" });

            // ADD POST TO BOOKMARKS
            user.bookmarks.push(_id);
            await user.save();
            return res.status(200).json({ message: "Post bookmarked" });
        }

        // DELETE POST FROM BOOKMARKS
        else if (req.method === "DELETE") {
            // CCHECK IF POST IS NOT BOOKMARKED
            const isBookmarked = user.bookmarks.includes(_id);
            if (!isBookmarked) return res.status(400).json({ message: "Post not bookmarked" });

            // DELETE POST FROM BOOKMARKS
            user.bookmarks = user.bookmarks.filter((bookmark: any) => bookmark.toString() !== _id.toString());
            await user.save();
            return res.status(200).json({ message: "Post unbookmarked" });
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