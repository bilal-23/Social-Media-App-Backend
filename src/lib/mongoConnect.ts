import mongoose, { ConnectOptions } from "mongoose";

export const connectMongoDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    }
    const link = process.env.MONGODB_URI as string;
    return mongoose.connect(
        link,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions
    );
};
