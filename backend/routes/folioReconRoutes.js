const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');

const Client = require('../models/Client'); // Adjust path as needed

const upload = multer({ storage: multer.memoryStorage() });

const normalizeHeader = (str) => {
    if (str === undefined || str === null) return '';
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
};

const normalizeFolio = (str) => {
    if (str === undefined || str === null) return '';
    return String(str).toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^0+(?=\d)/, '');
};

const extractStandardFields = (row, folioVal) => {
    const keys = Object.keys(row);
    
    const findValue = (keywords) => {
        const key = keys.find(k => keywords.some(kw => normalizeHeader(k).includes(kw)));
        return key ? row[key] : '-';
    };

    let rawName = findValue(['name', 'investor', 'client', 'invname']);
    let extractedPan = findValue(['pan']);
    let email = findValue(['email', 'mail']); 

    if (rawName && rawName !== '-') {
        const nameStr = String(rawName).trim();
        
        const panRegex = /\[([A-Z]{5}[0-9]{4}[A-Z]{1})\]/i;
        const panMatch = nameStr.match(panRegex);
        
        if (panMatch && panMatch[1]) {
            if (!extractedPan || extractedPan === '-') {
                extractedPan = panMatch[1].toUpperCase();
            }
        }

        rawName = nameStr
            .replace(/\[[A-Z]{5}[0-9]{4}[A-Z]{1}\]/gi, '') 
            .replace(/\[\d+\]/g, '')                        
            .replace(/\s+/g, ' ')                           
            .trim();
    }

    return {
        folio: folioVal,
        name: rawName || '-',
        pan: extractedPan ? extractedPan.toUpperCase() : '-',
        email: email || '-',
        mobile: '-'
    };
};

const extractDataFromWorkbook = (workbook, fileName, targetSheetName = null) => {
    let allRawRows = [];
    let totalRawRowsWithFolios = 0;
    let extractedHeaders = []; 
    let constants = {}; // NEW: Store repeating AMC constants

    const sheetsToProcess = targetSheetName ? [targetSheetName] : workbook.SheetNames;

    sheetsToProcess.forEach(sheetName => {
        if (!workbook.Sheets[sheetName]) {
            if (targetSheetName) throw new Error(`Sheet "${targetSheetName}" not found in the CAMS file.`);
            return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        let headerRowIndex = -1;

        for (let i = 0; i < Math.min(rawRows.length, 50); i++) {
            const row = rawRows[i];
            if (!row || !Array.isArray(row)) continue;

            const hasFolioHeader = row.some(cell => {
                const norm = normalizeHeader(cell);
                return norm.includes('folio') && !norm.includes('portfolio');
            });

            if (hasFolioHeader) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex !== -1) {
            extractedHeaders = rawRows[headerRowIndex]; 
            
            const sheetData = xlsx.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: "" });
            
            if (sheetData.length > 0) {
                const keys = Object.keys(sheetData[0]);
                
                // NEW: Extract AMC & Broker Constants from the very first row
                const amcCodeKey = keys.find(k => normalizeHeader(k).includes('amccode'));
                const amcNameKey = keys.find(k => normalizeHeader(k).includes('amcname'));
                const brokerCodeKey = keys.find(k => normalizeHeader(k).includes('brokercode'));

                constants = {
                    amcCode: amcCodeKey ? sheetData[0][amcCodeKey] : '',
                    amcName: amcNameKey ? sheetData[0][amcNameKey] : '',
                    brokerCode: brokerCodeKey ? sheetData[0][brokerCodeKey] : ''
                };

                const exactFolioKey = keys.find(key => {
                    const norm = normalizeHeader(key);
                    return norm.includes('folio') && !norm.includes('portfolio');
                });

                if (exactFolioKey) {
                    sheetData.forEach(row => {
                        const rawFolio = row[exactFolioKey];
                        const cleanFolio = normalizeFolio(rawFolio);
                        
                        if (cleanFolio) {
                            totalRawRowsWithFolios++; 
                            allRawRows.push({
                                standardizedData: extractStandardFields(row, rawFolio),
                                cleanFolioVal: cleanFolio
                            });
                        }
                    });
                }
            }
        }
    });

    return {
        allRows: allRawRows,
        stats: {
            fileName: fileName,
            rawRowsParsed: totalRawRowsWithFolios,
            sheetTargeted: targetSheetName || "All Sheets",
            camsHeaders: extractedHeaders,
            constants: constants // Pass constants back
        }
    };
};

router.post('/reconcile', upload.fields([
    { name: 'camsFile', maxCount: 1 },
    { name: 'wealthEliteFiles', maxCount: 20 }
]), async (req, res) => {
    try {
        console.log("--- STARTING DB-ENRICHED RECONCILIATION ---");
        const amcSheetName = req.body.amcSheetName;

        if (!req.files['camsFile'] || !req.files['wealthEliteFiles'] || req.files['wealthEliteFiles'].length === 0) {
            return res.status(400).json({ success: false, message: "CAMS file and Wealth Elite files are required." });
        }
        if (!amcSheetName) {
            return res.status(400).json({ success: false, message: "AMC Sheet Name is required." });
        }

        let globalWeRows = [];
        let weStatsArray = [];

        req.files['wealthEliteFiles'].forEach(file => {
            const weWorkbook = xlsx.read(file.buffer, { type: 'buffer' });
            const extracted = extractDataFromWorkbook(weWorkbook, file.originalname);
            weStatsArray.push(extracted.stats);
            globalWeRows.push(...extracted.allRows);
        });

        const masterWeFolios = new Set();
        const weDataMap = new Map();

        globalWeRows.forEach(item => {
            if (!masterWeFolios.has(item.cleanFolioVal)) {
                masterWeFolios.add(item.cleanFolioVal);
                weDataMap.set(item.cleanFolioVal, item.standardizedData); 
            }
        });

        const camsWorkbook = xlsx.read(req.files['camsFile'][0].buffer, { type: 'buffer' });
        const camsExtracted = extractDataFromWorkbook(camsWorkbook, req.files['camsFile'][0].originalname, amcSheetName);
        
        const camsFolios = new Set();
        const camsDataMap = new Map();
        
        camsExtracted.allRows.forEach(item => {
            if (!camsFolios.has(item.cleanFolioVal)) {
                camsFolios.add(item.cleanFolioVal);
                camsDataMap.set(item.cleanFolioVal, item.standardizedData);
            }
        });

        let missingRows = [];
        let matchedRows = [];
        const allUniquePans = new Set();
        
        masterWeFolios.forEach(folio => {
            const rowData = !camsFolios.has(folio) ? weDataMap.get(folio) : camsDataMap.get(folio);
            
            if (rowData.pan && rowData.pan !== '-') {
                allUniquePans.add(rowData.pan);
            }

            if (!camsFolios.has(folio)) {
                missingRows.push(rowData);
            } else {
                matchedRows.push(rowData);
            }
        });

        const panArray = Array.from(allUniquePans);
        let dbClients = [];
        
        if (panArray.length > 0) {
            dbClients = await Client.find({ pan: { $in: panArray } }).lean(); 
        }

        const dbContactMap = new Map();
        dbClients.forEach(client => {
            if (client.pan) {
                dbContactMap.set(client.pan, {
                    email: client.contactDetails?.email || null,
                    mobile: client.contactDetails?.phoneNo || null
                });
            }
        });

        const enrichRowWithDbData = (row) => {
            if (row.pan && dbContactMap.has(row.pan)) {
                const dbInfo = dbContactMap.get(row.pan);
                if (dbInfo.email) row.email = dbInfo.email; 
                if (dbInfo.mobile) row.mobile = dbInfo.mobile;
            }
            return row;
        };

        missingRows = missingRows.map(enrichRowWithDbData);
        matchedRows = matchedRows.map(enrichRowWithDbData);

        res.status(200).json({
            success: true,
            stats: {
                cams: { ...camsExtracted.stats, uniqueFolios: camsFolios.size },
                wealthElite: weStatsArray,
                overall: { totalWeUniqueCombined: masterWeFolios.size, totalCamsUniqueTargeted: camsFolios.size }
            },
            missingCount: missingRows.length,
            missingFolios: missingRows,
            matchedCount: matchedRows.length,
            matchedFolios: matchedRows
        });

    } catch (error) {
        console.error("Reconciliation Error:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to process files." });
    }
});

module.exports = router;