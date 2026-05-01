const User = require('../models/User');

// @desc    Get all users (for management registry)
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ name: 1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update member details & app access
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
    try {
        const { name, email, username, phone, allowedApps, isAdmin } = req.body;
        const userId = req.params.id;

        // 1. Fetch current user to check for changes
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Uniqueness Validations (only check if changed)
        if (username && username !== user.username) {
            if (await User.findOne({ username })) return res.status(400).json({ message: 'Username already taken' });
        }
        if (email && email !== user.email) {
            if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
        }

        // 3. Prepare Update Object
        const updateFields = {
            name: name || user.name,
            email: email || user.email,
            username: username || user.username,
            phone: phone || user.phone,
            allowedApps: (allowedApps && Array.isArray(allowedApps)) ? allowedApps : user.allowedApps,
        };

        // Explicitly handle isAdmin boolean
        if (typeof isAdmin !== 'undefined') {
            updateFields.isAdmin = isAdmin;
        }

        // 4. Use findByIdAndUpdate to bypass pre-save hooks
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new member with specific app access
// @route   POST /api/users/register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, username, phone, allowedApps, isAdmin } = req.body;

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
            phone,
            isAdmin: isAdmin || false, // Support setting admin during creation
            allowedApps: allowedApps || ['EXPENSE_TRACKER']
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone,
            isAdmin: user.isAdmin,
            allowedApps: user.allowedApps
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle access for a specific app (Helper for quick UI switches)
// @route   PATCH /api/users/:id/toggle-app
exports.toggleAppAccess = async (req, res) => {
    try {
        const { appName } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const index = user.allowedApps.indexOf(appName);
        if (index > -1) {
            user.allowedApps.splice(index, 1);
        } else {
            user.allowedApps.push(appName);
        }

        await user.save();
        res.status(200).json({ allowedApps: user.allowedApps });
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