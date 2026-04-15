const User = require('../models/User');

// Method to get all users for the login dropdown
exports.getAllUsers = async (req, res) => {
    try {
        // Find all users but only return name and username fields
        const users = await User.find({}, 'name username');
        
        if (!users) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error while fetching users" });
    }
};