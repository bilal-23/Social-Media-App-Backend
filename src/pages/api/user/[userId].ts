import { ObjectId } from "mongodb";
import { User } from "@/models/user";
import { Post } from "@/models/post";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from "@/lib/verifyToken";

// GET - GET USER BY ID - POPULATE FOLLOWERS, FOLLOWING, AND BOOKMARKS
// PATCH - UPDATE USER BY ID
// DELETE - DELETE USER BY ID
async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

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
    const authUserId = tokenData.userId;

    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    try {
        try {
            await connectMongoDB();
        }
        catch (error) {
            return res.status(500).json({ message: "Internal Server Error, Cannot Connect DB", error });
        }
        // GET USER ID FROM URL
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ message: "User ID is required" });

        // GET USER BY ID
        const user = await getUserById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        // IF AUTH USER IS NOT THE SAME AS USER ID, REMOVE EMAIL AND BOOKMARKS
        if (authUserId.toString() !== userId.toString()) {
            user.email = undefined;
            user.bookmarks = undefined;
            user.password = undefined;
            return res.status(200).json({ user });
        };

        // Remove the ids from bookmark array if it no longer exists in POSTS collection
        const bookmarks = user.bookmarks;
        if (bookmarks.length > 0) {
            const bookmarkedPosts = await Post.find({ _id: { $in: bookmarks } });
            console.log({ bookmarkedPosts })
            if (bookmarkedPosts.length === 0) {
                user.bookmarks = [];
            } else {
                const bookmarkedPostIds = bookmarkedPosts.map(post => post._id.toString());
                user.bookmarks = bookmarkedPostIds;
            }
            await user.save();
        }

        user.password = undefined;
        return res.status(200).json({ user });

    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}

async function getUserById(userId: string) {
    const user = await User.findById(userId)
        .populate('following', '_id firstName lastName pic username')
        .populate('followers', '_id firstName lastName pic username');

    return user;

}

async function deleteUserById(userId: string) {
    // DELETE USER BY ID
    const user = User.findById(userId);
    if (!user) return null;
    return await User.deleteOne({ id: new ObjectId(userId) });
}


export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res);
    return handler(req, res);
}  
