import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default:
                'https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg',
        },
    },
    { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        prompt: {
            type: String,
            required: true
        },
        response: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);

export { User, Conversation };