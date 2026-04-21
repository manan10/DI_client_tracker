const User = require('../models/User');

// @desc    Get all users for dropdowns
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
    try {
        // Included phone in the selection so the frontend can display it in the list
        const users = await User.find({}).select('-password').sort({ name: 1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update family member details
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { name, email, username, phone } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate uniqueness if username is changing
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) return res.status(400).json({ message: 'Username already taken' });
        }

        // Validate uniqueness if email is changing
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ message: 'Email already registered' });
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.phone = phone || user.phone; // Handle phone update

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            username: updatedUser.username,
            phone: updatedUser.phone
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new family member
// @route   POST /api/users/register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, username, phone } = req.body;

        const finalUsername = username || email.split('@')[0];

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Member with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            username: finalUsername,
            phone // Added phone to creation
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin Reset Password (Override)
// @route   PATCH /api/users/:id/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = req.body.password;
        await user.save();

        res.status(200).json({ message: `Password updated for ${user.name}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Preferences (Theme/Notifications)
// @route   PATCH /api/users/preferences
exports.updatePreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.preferences.theme = req.body.theme || user.preferences.theme;
            user.preferences.notifications = req.body.notifications ?? user.preferences.notifications;
            
            const updatedUser = await user.save();
            res.status(200).json(updatedUser.preferences);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete User
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        await user.deleteOne();
        res.status(200).json({ message: 'User removed from family session' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};