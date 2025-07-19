import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Use String for _id ONLY if needed
    _id: { type: String, required: true }, // Remove if you want Mongoose default ObjectId
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String }, // required: false if not always present
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchCities: [String], // no 'required' on array for flexibility
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
