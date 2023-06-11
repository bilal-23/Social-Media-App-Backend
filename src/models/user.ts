import { Schema, model, Types, models } from 'mongoose';

const userSchema = new Schema({
    verified: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        immuatable: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    pic: {
        type: String,
        default: ""
    },
    followers: {
        type: [{ type: Types.ObjectId, ref: 'User' }],
        default: []
    },
    following: {
        type: [{ type: Types.ObjectId, ref: 'User' }],
        default: []
    },
    bookmarks: {
        type: [{ type: Types.ObjectId, ref: 'Post' }],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
});

export const User = models.User || model('User', userSchema);