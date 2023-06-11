import { ObjectId } from "mongodb";
import { User } from "@/models/user";
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
    const userId = tokenData.userId;

    if (req.method !== "DELETE") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }
    try {
        await connectMongoDB();
        // DELETE USER BY ID
        if (req.method === "DELETE") {
            // DELETE USER BY ID
            const user = await deleteUserById(new ObjectId(userId));
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            console.log(user);
            const users = await User.find({})
            return res.status(200).json({ message: "User deleted successfully", users });
        }

    }
    catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error });
    }
}


async function deleteUserById(userId: ObjectId) {
    try {
        const user = await User.findByIdAndDelete(userId);
        return user;
    }
    catch (error) {
        throw error;
    }
}


export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res);
    return handler(req, res);
}  