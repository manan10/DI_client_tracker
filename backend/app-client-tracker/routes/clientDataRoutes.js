const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Client = require('../models/Client');

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Helper to escape regex characters safely
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

router.post('/merge-investor-data', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please provide an Excel file.' });
    }

    // 1. Parse the uploaded Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // defval: "" ensures missing cells don't result in missing keys
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" }); 

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded Excel file is empty.' });
    }

    // 2. Iterate through rows and enrich with DB data
    const enrichedRows = await Promise.all(rows.map(async (row) => {
      // Normalize row keys to avoid issues with trailing spaces or weird casing in Excel headers
      const normalizedRow = {};
      for (const key in row) {
        normalizedRow[key.trim().toLowerCase()] = row[key];
      }

      // Extract investor name
      const rawName = normalizedRow['investor name'] || normalizedRow['name'] || normalizedRow['investor'] || '';
      
      let pan = 'NOT FOUND';
      let email = 'NOT FOUND';

      if (rawName && typeof rawName === 'string') {
        const cleanName = rawName.trim().replace(/\s+/g, ' '); // Clean double spaces
        
        // --- ATTEMPT 1: Exact Case-Insensitive Match ---
        let client = await Client.findOne({ 
          name: new RegExp('^' + escapeRegex(cleanName) + '$', 'i') 
        }).lean();

        // --- ATTEMPT 2: Intelligent Fuzzy Match ---
        // If exact match fails, check if all significant parts of the name exist in the DB string
        if (!client) {
          // Split by space, keeping only words with >1 char (ignores rogue initials preventing a match)
          const nameParts = cleanName.split(' ').filter(part => part.length > 1);
          
          if (nameParts.length > 0) {
            // Creates a regex like: ^(?=.*ZAVERBHAI)(?=.*PATEL).*$
            // This means "Find a string that contains both ZAVERBHAI and PATEL, regardless of order"
            const fuzzyRegex = '^' + nameParts.map(part => `(?=.*${escapeRegex(part)})`).join('') + '.*$';
            
            client = await Client.findOne({
              name: { $regex: new RegExp(fuzzyRegex, 'i') }
            }).lean();
          }
        }

        if (client) {
          pan = client.pan || 'N/A';
          email = client.contactDetails?.email || 'N/A';
        }
      }

      // 3. Return the merged object (keeping original row formatting intact)
      return {
        ...row,
        'PAN Number': pan,
        'Email Address': email
      };
    }));

    // 4. Send back the enriched data for preview
    res.status(200).json({ 
      success: true, 
      data: enrichedRows,
      message: `Successfully processed ${enrichedRows.length} records.`
    });

  } catch (error) {
    console.error("Error processing investor data merge:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while processing the file.' 
    });
  }
});

module.exports = router;