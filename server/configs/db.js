import mongoose from "mongoose";

mongoose.connection.once('connected', () => 
    console.log("Database Connected")
);

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`);
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
};

export default connectDB;
