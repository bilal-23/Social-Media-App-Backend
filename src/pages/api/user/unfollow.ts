import { User } from "@/models/user";
import { connectMongoDB } from "@/lib/mongoConnect";
import { NextApiRequest, NextApiResponse } from "next";
import { runMiddleware } from "@/lib/middleware";
import verifyToken from "@/lib/verifyToken";

// UNFOLLOW USER
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
    const userId = tokenData.userId;
    try {
        await connectMongoDB();
        const { unfollowId } = req.body;
        if (!unfollowId) {
            return res.status(400).json({ message: "Unfollow Id is missing" });
        }
        if (!userId) {
            return res.status(400).json({ message: "User Id is missing" });
        }
        // Check if user and account to be followed exists
        const user = await User.findById(userId);
        const unfollow = await User.findById(unfollowId);
        if (!user || !unfollow) {
            return res.status(404).json({ message: "User or account to be followed not found" });
        }
        // CHECK IF USER NOT FOLLOWING
        const isFollowing = user.following.includes(unfollowId);
        if (!isFollowing) {
            return res.status(400).json({ message: "Not following" });
        }
        // Remove from following array
        const index = user.following.indexOf(unfollowId);
        if (index > -1) {
            user.following.splice(index, 1);
        }
        // Remove from followers array
        const index2 = unfollow.followers.indexOf(userId);
        if (index2 > -1) {
            unfollow.followers.splice(index2, 1);
        }

        await user.save();
        await unfollow.save();
        return res.status(200).json({ message: "Unfollowed successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}


// This Does Not Populate the Followers, Following, and Bookmarks
export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res);
    return handler(req, res);
}   