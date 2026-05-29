import User from "../models/User.js";
import { clerkClient } from "@clerk/express";

// Middleware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth || {};
        if (!userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        else{
            let user = await User.findById(userId);
            if (!user) {
                // Self-healing fallback: Fetch user from Clerk and create in MongoDB
                try {
                    const clerkUser = await clerkClient.users.getUser(userId);
                    if (clerkUser) {
                        const userData = {
                            _id: clerkUser.id,
                            email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
                            username: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
                            image: clerkUser.imageUrl || "",
                        };
                        user = await User.create(userData);
                        console.log("🚀 Self-healed user creation:", user.email);
                    }
                } catch (clerkError) {
                    console.error("🚨 Failed to fetch/create user from Clerk in middleware:", clerkError.message);
                }
            }

            if (!user) {
                return res.status(401).json({ success: false, message: "User not found in database" });
            }

            req.user = user;
            next();
        }
        
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
