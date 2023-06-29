import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/models/user";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from '@/lib/verifyToken';


// GET - Bookmarks of logged in user
async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
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

    const userId = tokenData.userId;

    try {
        await connectMongoDB();

        // GET USER BY ID
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: "User not found" });

        // Get bookmarks of user 
        const bookmarks = user.bookmarks;
        if (bookmarks.length === 0) return res.status(200).json({ bookmarks: [], message: "No bookmarks" });

        // Get bookmarked posts from POSTS collection
        const bookmarkedPosts = await Post.find({ _id: { $in: bookmarks } }).populate([
            { path: "author", select: "_id firstName lastName pic username" },
            { path: "comments.user", select: "_id firstName lastName pic username" },
        ]);

        if (bookmarkedPosts.length === 0) return res.status(200).json({ bookmarks: [], message: "No bookmarks" });

        return res.status(200).json({ bookmarks: bookmarkedPosts, message: "Bookmarks" });


    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}

async function getPosts() {
    const posts = await Post.find({})
        .populate([
            { path: "author", select: "_id firstName lastName pic username" },
            { path: "comments.user", select: "_id firstName lastName pic username" },
        ])
        .sort({ createdAt: -1 }); // -1: DESC, 1: ASC
    return posts;
}


export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res);
    return handler(req, res);
}   
