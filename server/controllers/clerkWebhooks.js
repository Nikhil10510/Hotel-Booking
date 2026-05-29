import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // 1. Extract raw body and headers (see Express note below)
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // 2. Verify webhook payload must be raw body (see note!)
    // If using express.raw() middleware:
    // await whook.verify(req.body, headers)
    // If using JSON parser (not recommended for Clerk), use raw body value instead.
    await whook.verify(
      typeof req.body === "string" ? req.body : JSON.stringify(req.body),
      headers
    );
    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          username: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url || "",
          // role defaults to "user" in your schema
        };
        console.log("✅ Creating user:", userData.email);
        await User.create(userData);
        break;
      }

      case "user.updated": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          username: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url || "",
        };
        console.log("🔁 Updating user:", userData.email);
        await User.findByIdAndUpdate(data.id, userData, { new: true, upsert: true });
        break;
      }

      case "user.deleted":
        console.log("❌ Deleting user:", data.id);
        await User.findByIdAndDelete(data.id);
        break;

      default:
        console.log("📦 Unhandled webhook type:", type);
        break;
    }

    res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("🚨 Webhook error:", error.message);
    res.status(400).json({ success: false, message: `Webhook error: ${error.message}` });
  }
};

export default clerkWebhooks;
