const Category = require('../models/Category');
const Spending = require('../models/Spending');

// @desc    Get nested tree of categories
exports.getCategoryTree = async (req, res) => {
    try {
        const allCategories = await Category.find().sort({ displayOrder: 1 });
        
        // Build a nested structure
        const parents = allCategories.filter(c => c.parent === null);
        const tree = parents.map(parent => {
            return {
                ...parent._doc,
                subCategories: allCategories.filter(c => 
                    c.parent && c.parent.toString() === parent._id.toString()
                )
            };
        });

        res.json(tree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category or sub-category
exports.createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update category (Handles Drag-and-Drop Re-parenting)
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    SMART DELETE: Re-parent spending before deletion
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { migrateToId } = req.query; // Destination category for existing spends

        // 1. Check if category is used in any spending records
        const usageCount = await Spending.countDocuments({ category: id });

        if (usageCount > 0) {
            if (!migrateToId) {
                return res.status(409).json({ 
                    message: "Category in use", 
                    usageCount,
                    needsMigration: true 
                });
            }

            // 2. SMART MERGE: Move all spends to the new category
            await Spending.updateMany(
                { category: id },
                { $set: { category: migrateToId } }
            );
        }

        // 3. If it's a parent, handle its children (Move them to "Uncategorized" or delete)
        await Category.updateMany(
            { parent: id },
            { $set: { parent: null } } // Or handle child deletion here
        );

        await Category.findByIdAndDelete(id);
        res.json({ message: "Category deleted and transactions migrated." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};