import mongoose, { ConnectOptions } from "mongoose";

export const connectMongoDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection.asPromise();
    }

    return mongoose.connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tfip8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions
    );
};
