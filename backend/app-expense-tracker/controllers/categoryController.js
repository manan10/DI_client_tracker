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

        res.json({ success: true, data: tree });
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
        const { order } = req.body;
        
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
        const { order } = req.body;
        
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
        
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update category (Handles Drag-and-Drop Re-parenting)
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
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

exports.deleteCategory = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { migrateToId } = req.query; 

        const subCategories = await Category.find({ parent: id }).session(session);
        const subIds = subCategories.map(s => s._id);
        const allTargetIds = [id, ...subIds];

        const usageCount = await Spending.countDocuments({ 
            category: { $in: allTargetIds } 
        }).session(session);

        if (usageCount > 0 && !migrateToId) {
            await session.abortTransaction();
            return res.status(409).json({ 
                success: false,
                message: "Category or sub-categories in use", 
                usageCount,
                needsMigration: true 
            });
        }

        if (usageCount > 0 && migrateToId) {
            await Spending.updateMany(
                { category: { $in: allTargetIds } },
                { $set: { category: migrateToId } },
                { session }
            );
        } else if (usageCount > 0 && !migrateToId) {
            throw new Error("Critical: Migration ID required for non-empty category purging.");
        }

        await Category.deleteMany({ parent: id }).session(session);
        await Category.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        res.json({ 
            success: true, 
            message: "Category tree purged and funds re-categorized successfully." 
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

// @desc    Merge multiple independent categories into a new parent
exports.mergeCategories = async (req, res) => {
    try {
        const { categoryIds, newCategoryName, newCategoryColor } = req.body;

        const checkCategories = await Category.find({ _id: { $in: categoryIds } });
        const hasSubCategories = checkCategories.some(c => c.parent !== null);
        
        if (hasSubCategories) {
            return res.status(400).json({ 
                success: false, 
                message: "Only top-level categories without their own parents can be merged." 
            });
        }

        const newParent = new Category({
            label: newCategoryName,
            color: newCategoryColor || '#6366f1',
            parent: null
        });
        await newParent.save();

        await Category.updateMany(
            { _id: { $in: categoryIds } },
            { $set: { parent: newParent._id } }
        );

        res.json({ success: true, data: newParent, message: "Categories merged successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};