const XLSX = require("xlsx");
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

// Helper to extract digits from anywhere in a string (e.g., "[123]" or "(123)")
const extractClientId = (str) => {
  const match = String(str || "").match(/\d+/);
  return match ? match[0] : null;
};

exports.processWealthEliteFiles = (files) => {
  const { aumFile, familyFile, nonFamFile } = files;

  const aumWb = XLSX.read(aumFile[0].buffer);
  const famWb = XLSX.read(familyFile[0].buffer);
  const nfWb = XLSX.read(nonFamFile[0].buffer);

  const aumData = XLSX.utils.sheet_to_json(aumWb.Sheets[aumWb.SheetNames[0]], { range: 1 });
  const famDataRaw = XLSX.utils.sheet_to_json(famWb.Sheets[famWb.SheetNames[0]], { header: 1 });
  const nfData = XLSX.utils.sheet_to_json(nfWb.Sheets[nfWb.SheetNames[0]], { range: 1 });

  const familyMap = {};
  const panRegex = /PAN\s*:\s*([A-Z]{5}[0-9]{4}[A-Z]{1})/;
  
  let currentFamilyId = null;

  // 1. Build Family Map with Robust ID Extraction
  famDataRaw.forEach((row) => {
    const rowType = row[0]; // "Family Head" or "Family Member"
    const content = String(row[1] || "");
    
    const panMatch = content.match(panRegex);
    const pan = panMatch ? panMatch[1].toUpperCase() : null;
    
    // Extract ID from "(1771418)" in Family List
    const clientId = extractClientId(content);

    if (rowType === "Family Head") {
      currentFamilyId = uuidv4();
    }

    if (currentFamilyId) {
      const data = {
        familyId: currentFamilyId,
        isFamilyHead: rowType === "Family Head",
        mobile: row[2],
        email: row[3],
        address: row[4],
      };

      if (pan) familyMap[`PAN_${pan}`] = data;
      if (clientId) familyMap[`ID_${clientId}`] = data;
    }
  });

  // 2. Map Non-Family contact info
  const nfMap = {};
  nfData.forEach((row) => {
    const pan = String(row["Pan"] || "").trim().toUpperCase();
    if (pan) {
      nfMap[pan] = { 
        mobile: row["Mobile"] || row["Mobile No"], 
        email: row["Email"] || row["Email ID"],
        address: row["Address"] || "N/A"
      };
    }
  });

  // 3. Final Transformation
  return aumData.map((row) => {
    const rawPan = row["PAN"] || row["Pan"] || "";
    let pan = String(rawPan).trim().toUpperCase();
    
    const clientNameRaw = String(row["Client Name"] || row["Client"] || "");
    
    // Extract ID from "[1771418]" in AUM Report
    const clientId = extractClientId(clientNameRaw);
    const clientName = cleanName(clientNameRaw);

    // Handle Missing PANs
    const isTempPan = !pan || pan.length !== 10;
    if (isTempPan) {
      // Use Client ID to keep the temp PAN stable
      pan = `TEMP_${clientId || clientName.replace(/\s+/g, '_')}`;
    }

    const rawAum = row["AUM"] || row["Valuation"] || "0";
    const numericAum = parseFloat(String(rawAum).replace(/,/g, "")) || 0;
    
    // LOOKUP: Check both the PAN and the ID in the family map
    // We check ID lookup FIRST for cases where PAN might be missing in one file but present in another
    const famInfo = (clientId && familyMap[`ID_${clientId}`]) || (pan && familyMap[`PAN_${pan}`]) || {};
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
    };
  }).filter((c) => c !== null);
};