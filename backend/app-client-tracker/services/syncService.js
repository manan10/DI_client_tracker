const ExcelJS = require("exceljs");
const { v4: uuidv4 } = require("uuid");
const { getCategoryByAum } = require("./tierService");

const cleanName = (name) => {
  if (!name || typeof name !== "string") return "N/A";
  return name
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/Family Head/gi, "")
    .replace(/Family Member/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

const extractClientId = (str) => {
  const match = String(str || "").match(/\d+/);
  return match ? match[0] : null;
};

/**
 * Helper to convert exceljs worksheet to JSON-like array
 * Features intelligent header detection, uppercase normalization, and merged-cell immunity.
 */
const worksheetToJson = (worksheet, options = {}, sheetName = "Unknown") => {
  const data = [];
  const headers = [];

  let startRow = options.startRow;

  if (!startRow) {
    let maxMatches = 0;
    const keywords = ['PAN', 'CLIENT', 'NAME', 'AUM', 'VALUATION', 'VALUE', 'INVESTOR', 'MARKET', 'FOLIO'];
    
    for (let i = 1; i <= 15; i++) {
      const row = worksheet.getRow(i);
      let matchedKeywords = new Set();
      
      row.eachCell((cell) => {
        const val = String((cell.value?.result ?? cell.value) || '').toUpperCase();
        keywords.forEach(k => {
          if (val === k || val.includes(k)) {
            matchedKeywords.add(k);
          }
        });
      });
      
      if (matchedKeywords.size > maxMatches) {
        maxMatches = matchedKeywords.size;
        startRow = i;
      }
    }
    if (!startRow) startRow = 1;
  }

  const headerRow = worksheet.getRow(startRow);
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = String((cell.value?.result ?? cell.value) || '').trim().toUpperCase();
  });

  console.log(`[SyncService] ${sheetName} Sheet - Detected Headers on row ${startRow}:`, headers.filter(Boolean));

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= startRow) return;

    const rowData = {};
    let hasContent = false;
    
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber];
      if (header) {
        const val = cell.value?.result ?? cell.value;
        rowData[header] = val;
        if (val !== null && val !== undefined && val !== '') hasContent = true;
      }
    });

    if (hasContent) {
      data.push(rowData);
    }
  });
  
  return data;
};

exports.processWealthEliteFiles = async (files) => {
  const { aumFile, familyFile, nonFamFile } = files;

  const aumWb = new ExcelJS.Workbook();
  const famWb = new ExcelJS.Workbook();
  const nfWb = new ExcelJS.Workbook();

  await Promise.all([
    aumWb.xlsx.load(aumFile[0].buffer),
    famWb.xlsx.load(familyFile[0].buffer),
    nfWb.xlsx.load(nonFamFile[0].buffer),
  ]);

  const aumSheet = aumWb.getWorksheet(1);
  const famSheet = famWb.getWorksheet(1);
  const nfSheet = nfWb.getWorksheet(1);

  // 1. Process Family Data
  const familyMap = {};
  const panRegex = /PAN\s*:\s*([A-Z]{5}[0-9]{4}[A-Z]{1})/;
  let currentFamilyId = null;

  famSheet.eachRow((row) => {
    const rowType = row.getCell(1).value?.toString().trim();
    const content = String(row.getCell(2).value || "");

    const panMatch = content.match(panRegex);
    const pan = panMatch ? panMatch[1].toUpperCase() : null;
    const clientId = extractClientId(content);

    if (rowType === "Family Head") {
      currentFamilyId = uuidv4();
    }

    if (currentFamilyId) {
      const data = {
        familyId: currentFamilyId,
        isFamilyHead: rowType === "Family Head",
        mobile: row.getCell(3).value?.toString().trim(),
        email: row.getCell(4).value?.toString().trim(),
        address: row.getCell(5).value?.toString().trim(),
        hasExplicitFamily: true,
      };

      if (pan) familyMap[`PAN_${pan}`] = data;
      if (clientId) familyMap[`ID_${clientId}`] = data;
    }
  });

  // 2. Process Non-Family contact info
  const nfData = worksheetToJson(nfSheet, { startRow: 2 }, "Non-Family");
  const nfMap = {};
  
  nfData.forEach((row) => {
    const pan = String(row["PAN"] || "").trim().toUpperCase();
    if (pan) {
      nfMap[pan] = {
        mobile: row["MOBILE"] || row["MOBILE NO"] || row["MOBILE NUMBER"],
        email: row["EMAIL"] || row["EMAIL ID"],
        address: row["ADDRESS"] || "N/A",
      };
    }
  });

  // 3. Process AUM Data
  const aumDataRaw = worksheetToJson(aumSheet, {}, "AUM Master"); 

  return aumDataRaw
    .map((row) => {
      const clientNameRaw = String(
        row["CLIENT NAME"] || 
        row["CLIENT"] || 
        row["INVESTOR NAME"] || 
        row["INVESTOR"] || 
        row["APPLICANT NAME"] || 
        row["NAME"] || 
        ""
      );
      const clientName = cleanName(clientNameRaw);

      if (
        !clientNameRaw ||
        clientName.toUpperCase() === "TOTAL" ||
        clientName.toUpperCase().includes("GRAND TOTAL") ||
        clientName === "N/A"
      ) {
        return null;
      }

      const rawPan = row["PAN"] || row["PAN NO."] || row["PAN NO"] || row["PAN NUMBER"] || "";
      let pan = String(rawPan).trim().toUpperCase();
      const clientId = extractClientId(clientNameRaw);

      const isTempPan = !pan || pan.length !== 10;
      if (isTempPan) {
        pan = `TEMP_${clientId || clientName.replace(/\s+/g, "_")}`;
      }

      const rawAum = row["AUM"] || row["VALUATION"] || row["CURRENT VALUE"] || row["TOTAL VALUE"] || row["MARKET VALUE"] || row["AMOUNT"] || 0;
      
      const numericAum =
        typeof rawAum === "number"
          ? rawAum
          : parseFloat(String(rawAum).replace(/,/g, "")) || 0;

      const famInfo =
        (clientId && familyMap[`ID_${clientId}`]) ||
        (pan && familyMap[`PAN_${pan}`]) ||
        {};
      const nfInfo = nfMap[pan] || {};

      return {
        pan,
        wealthEliteId: clientId,
        name: clientName,
        aum: numericAum,
        category: getCategoryByAum(numericAum),
        contactDetails: {
          phoneNo: String(famInfo.mobile || nfInfo.mobile || "").trim() || "N/A",
          email: String(famInfo.email || nfInfo.email || "").toLowerCase().trim() || "N/A",
          address: famInfo.address || nfInfo.address || "N/A",
        },
        riskProfile: "Moderate",
        familyId: famInfo.familyId || uuidv4(),
        isFamilyHead: famInfo.isFamilyHead ?? true,
        hasExplicitFamily: !!famInfo.hasExplicitFamily,
      };
    })
    .filter((c) => c !== null);
};