import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    // Use String for _id ONLY if needed
    _id: { type: String, required: true }, // Remove if you want Mongoose default ObjectId
    username: { type: String, required: true },
    email: { type: String, required: true},
    image: { type: String,required:true }, // required: false if not always present
    role: { type: String, enum: ["user", "hotelOwner"], default: "user" },
    recentSearchedCities: [{type:String,required:true}], // no 'required' on array for flexibility
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
