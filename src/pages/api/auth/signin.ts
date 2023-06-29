import type { NextApiRequest, NextApiResponse } from 'next';
import { runMiddleware } from '@/lib/middleware';
import { verifyPassword } from '@/lib/verifyPassword';
import { connectMongoDB } from '@/lib/mongoConnect';
import { User } from '@/models/user';



async function handler(req: NextApiRequest, res: NextApiResponse) {
    // ALLOW CORS

    // Check if it is a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // get the user email and password from the request body
    const { email, password } = req.body;

    // Check if the email and password are valid
    if (!email || !password) {
        return res.status(400).json({ message: 'Bad request' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Bad request', error: 'Invalid email' });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Bad request' });
    }


    try {
        await connectMongoDB();

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({ message: "User does not exist" });

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) return res.status(401).json({ message: "Incorrect password" });

        // Password is correct, get a jwt token and store the email in the token and _id in the cookie
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ email: email, _id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '72h' });

        return res.status(200).json({
            message: "Login successfully",
            token: token,
            user: { email, name: user.firstName }
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Cannot login, please try again later.", error: error });
    }

}

export default async function myAPI(req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res);
    return handler(req, res);
}   
