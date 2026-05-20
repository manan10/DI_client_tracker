const Ledger = require('../models/Ledger');

/**
 * @desc    Process bulk ledger data from Tally Bridge scan
 * @route   POST /api/ledgers/bulk-sync
 */
exports.bulkSyncTallyLedgers = async (req, res) => {
    try {
        const { ledgers, company, arnId } = req.body;

        // Validation: Added arnId check
        if (!ledgers || !Array.isArray(ledgers) || !company || !arnId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required context: Ledgers, Tally Company name, and Client ARN are required." 
            });
        }

        // Prepare bulk operations: Upsert ledgers scoped to specific Company AND ARN
        const operations = ledgers.map(l => ({
            updateOne: {
                filter: { 
                    name: l.name.toUpperCase(), 
                    tallyCompanyName: company // Using the field name from our earlier discussion
                },
                update: { 
                    $set: { 
                        groupName: l.parent, // Maps to 'parent' from Tally XML
                        arnId: arnId,       // Link to the Client/ARN
                        lastSynced: new Date(),
                        isActive: true
                    } 
                },
                upsert: true
            }
        }));

        const result = await Ledger.bulkWrite(operations);

        res.json({ 
            success: true, 
            company,
            stats: {
                totalSynced: ledgers.length,
                newLedgers: result.upsertedCount,
                updatedLedgers: result.modifiedCount
            }
        });

    } catch (error) {
        console.error("Tally Bulk Sync Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "System failed to reconcile Tally registry",
            details: error.message 
        });
    }
};

/**
 * @desc    Fetch ALL ledgers (for the Registry view) or filter by Company
 * @route   GET /api/ledgers
 */
exports.getAllLedgers = async (req, res) => {
    try {
        const { company } = req.query;
        let query = {}; // Remove isActive: true temporarily to see if data exists
        
        if (company && company !== 'null') {
            query.tallyCompanyName = company;
        }

        console.log("Fetching ledgers with query:", query);

        const ledgers = await Ledger.find(query)
            .populate({
                path: 'arnId',
                select: 'nickname arnCode' // Only pull what we need
            })
            .sort({ name: 1 })
            .lean(); // Lean for better performance and to avoid Mongoose wrapping issues

        res.json({ 
            success: true, 
            count: ledgers.length,
            data: ledgers 
        });
    } catch (error) {
        console.error("SERVER CRASH IN getAllLedgers:", error);
        res.status(500).json({ 
            success: false, 
            message: "Database Query Error", 
            error: error.message 
        });
    }
};