const Ledger = require('../models/Ledger');

/**
 * @desc    Process bulk ledger data from Tally Bridge scan with Statutory / GST mapping
 * @route   POST /api/ledgers/bulk-sync
 */
exports.bulkSyncTallyLedgers = async (req, res) => {
    try {
        const { ledgers, company, arnId } = req.body;

        // Validation: Ensure all context fields are present
        if (!ledgers || !Array.isArray(ledgers) || !company || !arnId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required context: Ledgers, Tally Company name, and Client ARN are required." 
            });
        }

        // Prepare bulk operations: Upsert ledgers scoped to specific Company AND ARN
        const operations = ledgers.map(l => {
            const normalizedName = l.name.trim().toUpperCase();
            const stateName = l.stateName || "";
            
            return {
                updateOne: {
                    filter: { 
                        name: normalizedName, 
                        tallyCompanyName: company 
                    },
                    update: { 
                        $set: { 
                            groupName: l.parent, 
                            arnId: arnId,
                            
                            // Statutory / GSTR Data Points Injection
                            address: Array.isArray(l.address) ? l.address : [],
                            stateName: stateName,
                            country: l.country || (stateName ? "India" : ""),
                            gstRegistrationType: l.gstRegistrationType || (l.gstin ? "Regular" : ""),
                            gstin: l.gstin ? l.gstin.trim().toUpperCase() : "",
                            placeOfSupply: l.placeOfSupply || stateName, // Falls back to state if unspecified
                            
                            lastSynced: new Date(),
                            isActive: true
                        } 
                    },
                    upsert: true
                }
            };
        });

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
        let query = {}; 
        
        if (company && company !== 'null') {
            query.tallyCompanyName = company;
        }

        console.log("Fetching ledgers with query:", query);

        const ledgers = await Ledger.find(query)
            .populate({
                path: 'arnId',
                select: 'nickname arnCode' 
            })
            .sort({ name: 1 })
            .lean(); 

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