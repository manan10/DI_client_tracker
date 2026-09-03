const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');

const Client = require('../models/Client'); // Adjust path as needed

const upload = multer({ storage: multer.memoryStorage() });

// --- Helper Functions ---
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

const extractCamsData = (workbook, fileName, targetSheetName = null) => {
    let allRawRows = [];
    let extractedHeaders = []; 
    let constants = {}; 

    const sheetsToProcess = targetSheetName ? [targetSheetName] : workbook.SheetNames;

    sheetsToProcess.forEach(sheetName => {
        if (!workbook.Sheets[sheetName]) return;

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
                
                const amcCodeKey = keys.find(k => normalizeHeader(k).includes('amccode') || normalizeHeader(k).includes('productcode'));
                const amcNameKey = keys.find(k => normalizeHeader(k).includes('amcname') || normalizeHeader(k) === 'fund');
                const brokerCodeKey = keys.find(k => normalizeHeader(k).includes('brokercode') || normalizeHeader(k).includes('arn'));

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

    return { allRows: allRawRows, stats: { fileName, camsHeaders: extractedHeaders, constants } };
};

const extractBrokerageData = (workbook) => {
    const brokerageMap = new Map(); // folio -> totalAmount
    let parsedRows = 0;

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        let headerRowIndex = -1;

        for (let i = 0; i < Math.min(rawRows.length, 50); i++) {
            const row = rawRows[i];
            if (!row || !Array.isArray(row)) continue;

            const hasFolio = row.some(cell => normalizeHeader(cell).includes('folio'));
            const hasAmount = row.some(cell => {
                const norm = normalizeHeader(cell);
                return norm.includes('amount') || norm.includes('brokerage') || norm.includes('comm') || norm.includes('net');
            });

            if (hasFolio && hasAmount) {
                headerRowIndex = i;
                break;
            }
        }

        if (headerRowIndex !== -1) {
            const sheetData = xlsx.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: "" });
            if (sheetData.length > 0) {
                const keys = Object.keys(sheetData[0]);
                const exactFolioKey = keys.find(key => normalizeHeader(key).includes('folio'));
                const exactAmountKey = keys.find(key => {
                    const norm = normalizeHeader(key);
                    return norm.includes('amount') || norm.includes('brokerage') || norm.includes('comm') || norm.includes('net');
                });

                if (exactFolioKey && exactAmountKey) {
                    sheetData.forEach(row => {
                        const cleanFolio = normalizeFolio(row[exactFolioKey]);
                        const amount = parseFloat(row[exactAmountKey]) || 0;
                        if (cleanFolio) {
                            parsedRows++;
                            const currentTotal = brokerageMap.get(cleanFolio) || 0;
                            brokerageMap.set(cleanFolio, currentTotal + amount);
                        }
                    });
                }
            }
        }
    });

    return { brokerageMap, parsedRows };
};

// ==========================================
// ROUTE: BROKERAGE REVENUE AUDIT
// ==========================================
router.post('/audit', upload.fields([
    { name: 'camsFile', maxCount: 1 },
    { name: 'brokerageFile', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log("--- STARTING BROKERAGE REVENUE AUDIT ---");
        const amcSheetName = req.body.amcSheetName;

        if (!req.files['camsFile'] || !req.files['brokerageFile']) {
            return res.status(400).json({ success: false, message: "Both Master CAMS file and Brokerage file are required." });
        }
        if (!amcSheetName) {
            return res.status(400).json({ success: false, message: "Target Sheet Name is required for the CAMS file." });
        }

        // 1. Parse Brokerage File (Group amounts by Folio)
        const brokerageWorkbook = xlsx.read(req.files['brokerageFile'][0].buffer, { type: 'buffer' });
        const { brokerageMap, parsedRows: brokTxs } = extractBrokerageData(brokerageWorkbook);

        // 2. Parse CAMS Master File
        const camsWorkbook = xlsx.read(req.files['camsFile'][0].buffer, { type: 'buffer' });
        const camsExtracted = extractCamsData(camsWorkbook, req.files['camsFile'][0].originalname, amcSheetName);
        
        const camsFolios = new Map(); // Map ensures we only keep 1 entry per unique CAMS folio
        camsExtracted.allRows.forEach(item => {
            if (!camsFolios.has(item.cleanFolioVal)) {
                camsFolios.set(item.cleanFolioVal, item.standardizedData);
            }
        });

        // 3. Reconcile
        let unpaidFolios = [];
        let paidFolios = [];
        const allUniquePans = new Set();
        let totalBrokerageTracked = 0;
        
        camsFolios.forEach((clientData, cleanFolio) => {
            if (clientData.pan && clientData.pan !== '-') allUniquePans.add(clientData.pan);

            if (brokerageMap.has(cleanFolio)) {
                const earned = brokerageMap.get(cleanFolio);
                totalBrokerageTracked += earned;
                paidFolios.push({
                    ...clientData,
                    brokerageAmount: earned
                });
            } else {
                unpaidFolios.push({
                    ...clientData,
                    brokerageAmount: 0
                });
            }
        });

        // 4. Enrich Contact Details from DB
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

        unpaidFolios = unpaidFolios.map(enrichRowWithDbData);
        paidFolios = paidFolios.map(enrichRowWithDbData);

        res.status(200).json({
            success: true,
            stats: {
                cams: { ...camsExtracted.stats, uniqueFolios: camsFolios.size },
                brokerage: { totalTransactionsParsed: brokTxs, uniqueEarningFolios: brokerageMap.size, totalBrokerageTracked },
            },
            unpaidCount: unpaidFolios.length,
            unpaidFolios: unpaidFolios,
            paidCount: paidFolios.length,
            paidFolios: paidFolios
        });

    } catch (error) {
        console.error("Brokerage Audit Error:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to process files." });
    }
});

module.exports = router;