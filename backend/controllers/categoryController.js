const Category = require('../models/Category');
const Spending = require('../models/Spending');

// @desc    Get nested tree of categories
exports.getCategoryTree = async (req, res) => {
    try {
        const allCategories = await Category.find().sort({ displayOrder: 1 });
        
        const parents = allCategories.filter(c => c.parent === null);
        const tree = parents.map(parent => {
            return {
                ...parent._doc,
                subCategories: allCategories.filter(c => 
                    c.parent && c.parent.toString() === parent._id.toString()
                )
            };
        });

        res.json({ success: true, data: tree }); // Wrapped in success for useApi compatibility
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create Sub-Category specifically
exports.createSubCategory = async (req, res) => {
    try {
        const { label } = req.body;
        const { parentId } = req.params;
        
        const subCategory = new Category({
            label,
            parent: parentId,
            displayOrder: await Category.countDocuments({ parent: parentId })
        });
        
        await subCategory.save();
        res.status(201).json({ success: true, data: subCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Reorder Parent Categories
exports.reorderCategories = async (req, res) => {
    try {
        const { order } = req.body; // Array of IDs in new order
        
        const ops = order.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { displayOrder: index }
            }
        }));

        await Category.bulkWrite(ops);
        res.json({ success: true, message: "Categories reordered" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reorder Sub-Categories within a parent
exports.reorderSubCategories = async (req, res) => {
    try {
        const { order } = req.body; // Array of sub-category IDs
        
        const ops = order.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { displayOrder: index }
            }
        }));

        await Category.bulkWrite(ops);
        res.json({ success: true, message: "Sub-categories reordered" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create category or sub-category
exports.createCategory = async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        
        // Return wrapped in success for frontend useApi hook
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update category (Handles Drag-and-Drop Re-parenting)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent a category from being its own parent (recursive loop)
        if (req.body.parent === id) {
            return res.status(400).json({ success: false, message: "Category cannot be its own parent." });
        }

        const category = await Category.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    SMART DELETE: Re-parent spending before deletion
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { migrateToId } = req.query; 

        // 1. Check usage in spending
        const usageCount = await Spending.countDocuments({ category: id });

        if (usageCount > 0) {
            if (!migrateToId) {
                return res.status(409).json({ 
                    success: false,
                    message: "Category in use", 
                    usageCount,
                    needsMigration: true 
                });
            }

            // 2. Move all spends to the new category
            await Spending.updateMany(
                { category: id },
                { $set: { category: migrateToId } }
            );
        }

        // 3. HANDLE CHILDREN: 
        // If this is a parent category, we should delete its sub-categories 
        // to keep the dashboard clean. Orphan sub-categories cause UI crashes.
        const subCategories = await Category.find({ parent: id });
        
        if (subCategories.length > 0) {
            const subIds = subCategories.map(s => s._id);
            // Move any spending from sub-categories too if needed
            if (migrateToId) {
                await Spending.updateMany(
                    { category: { $in: subIds } },
                    { $set: { category: migrateToId } }
                );
            }
            // Delete all sub-categories belonging to this parent
            await Category.deleteMany({ parent: id });
        }

        await Category.findByIdAndDelete(id);
        res.json({ success: true, message: "Category and linked sub-categories purged successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Merge multiple independent categories into a new parent
exports.mergeCategories = async (req, res) => {
    try {
        const { categoryIds, newCategoryName, newCategoryColor } = req.body;

        // 1. Validation: Ensure all categories to be merged are currently parents (no existing parent)
        const checkCategories = await Category.find({ _id: { $in: categoryIds } });
        const hasSubCategories = checkCategories.some(c => c.parent !== null);
        
        if (hasSubCategories) {
            return res.status(400).json({ 
                success: false, 
                message: "Only top-level categories without their own parents can be merged." 
            });
        }

        // 2. Create the new Parent Category
        const newParent = new Category({
            label: newCategoryName,
            color: newCategoryColor || '#6366f1',
            parent: null
        });
        await newParent.save();

        // 3. Update selected categories to become children of the new parent
        await Category.updateMany(
            { _id: { $in: categoryIds } },
            { $set: { parent: newParent._id } }
        );

        res.json({ success: true, data: newParent, message: "Categories merged successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};