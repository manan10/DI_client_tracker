const Ledger = require('../models/Ledger');
const ExcelJS = require('exceljs');
const fs = require('fs');

/**
 * IMPORT LOGIC: Stateful Top-Down Parser
 */
const importTallyLedgers = async (req, res) => {
  try {
    const { arnId } = req.body;
    if (!arnId) return res.status(400).json({ success: false, message: "ARN ID is required" });
    if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

    console.log(`--- Starting Import for ARN: ${arnId} ---`);
    const normalizedData = [];
    const filePath = req.file.path;

    if (req.file.originalname.match(/\.(xlsx|xls)$/)) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);

      let currentGroup = 'General'; 

      worksheet.eachRow((row, rowNumber) => {
        // Skip Tally Header rows (Company details and report title)
        if (rowNumber < 8) return; 

        const nameCell = row.getCell(1);
        const nameValue = nameCell.value?.toString().trim();
        
        if (!nameValue || nameValue.includes("Group(s)")) return;

        /**
         * TALLY HIERARCHICAL LOGIC:
         * Groups are usually BOLD. Ledgers are NORMAL font.
         */
        const isBold = nameCell.font && nameCell.font.bold;
        
        if (isBold) {
          currentGroup = nameValue;
        } else {
          normalizedData.push({
            name: nameValue.toUpperCase(),
            group: currentGroup,
            arnId: arnId,
            lastUpdated: new Date()
          });
        }
      });
    } else {
      // CSV Logic: Handles hierarchical commas
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      let currentGroup = 'General';

      lines.forEach((line, index) => {
        if (index < 8 || !line.trim()) return;
        
        const cols = line.split(',');
        const nameValue = cols[0]?.replace(/"/g, '').trim();

        if (!nameValue || nameValue.includes("Group(s)")) return;

        // Group lines in CSV usually end with empty column commas (,,)
        const isHeader = line.endsWith(',,'); 
        
        if (isHeader) {
          currentGroup = nameValue;
        } else {
          normalizedData.push({
            name: nameValue.toUpperCase(),
            group: currentGroup,
            arnId: arnId,
            lastUpdated: new Date()
          });
        }
      });
    }

    if (normalizedData.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: "No ledgers identified." });
    }

    // Bulk Upsert: Update if exists (name + arnId), Insert if new
    const ops = normalizedData.map(item => ({
      updateOne: {
        filter: { name: item.name, arnId: item.arnId },
        update: { $set: item },
        upsert: true
      }
    }));

    const result = await Ledger.bulkWrite(ops);
    
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    /**
     * CORRECTED MATH FOR STATISTICS
     * upsertedCount: Brand new records
     * matchedCount: Records already in DB (includes those just upserted)
     */
    const newRecords = result.upsertedCount || 0;
    const existingRecords = (result.matchedCount || 0) - (result.upsertedCount || 0);

    res.status(200).json({
      success: true,
      stats: {
        created: newRecords,
        updated: existingRecords,
        total: normalizedData.length
      }
    });
  } catch (error) {
    console.error("Import Error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * FETCH METHOD: Retrieve master list per ARN
 */
const getLedgersByArn = async (req, res) => {
  try {
    const { arnId } = req.params;
    if (!arnId) return res.status(400).json({ success: false, message: "ARN ID is required" });

    const ledgers = await Ledger.find({ arnId }).sort({ name: 1 });
    res.json({
        success: true,
        data: ledgers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  importTallyLedgers,
  getLedgersByArn
};