import mongoose, { Types } from 'mongoose';
import { commentSchema } from './comment';

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //contains user Id of user who posted this post
    content: { type: String, required: true },
    likes: {
        likeCount: { type: Number, default: 0 },
        likedBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: []
        }, //contains user Ids of users who liked this post
        dislikedBy: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            default: []
        }, //contains user Ids of users who disliked this post
    },

    comments: { type: [commentSchema], default: [] }, //contains user Ids of users who commented on this post, along with their comments and timestamps
    imageUrl: { type: String, default: '' }, // Add imageUrl field
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
