// GET /api/user
export const getUserData = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
        const { role, recentSearchedCities } = req.user;
        res.json({ success: true, role, recentSearchedCities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// POST /api/user/recent-search
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;
        if (!user) return res.status(401).json({ success: false, message: "User not found" });
        if (!recentSearchedCity) return res.status(400).json({ success: false, message: "City is required" });

        // Optional: Prevent duplicates and keep order (most recent at end)
        if (user.recentSearchedCities.includes(recentSearchedCity)) {
            user.recentSearchedCities = user.recentSearchedCities.filter(city => city !== recentSearchedCity);
        }
        user.recentSearchedCities.push(recentSearchedCity);
        if (user.recentSearchedCities.length > 3) {
            user.recentSearchedCities.shift(); // keep only last 3
        }

        await user.save();
        res.status(201).json({ success: true, message: "City Added" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
