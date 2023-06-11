import jwt from 'jsonwebtoken';

export default function verifyToken(token) {
    try {
        jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return false;
    }
    const deocdedToken = jwt.decode(token);
    // check timer
    if (deocdedToken.exp * 1000 < Date.now()) {
        return false;
    }
    return { email: deocdedToken.email, userId: deocdedToken._id };
}