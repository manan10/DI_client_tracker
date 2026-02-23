const XLSX = require("xlsx");
const { getCategoryByAum } = require("./tierService");

const cleanName = (name) => {
  if (!name || typeof name !== "string") return "N/A";
  return name
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/Family Head/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

exports.processWealthEliteFiles = (files) => {
  const { aumFile, familyFile, nonFamFile } = files;

  const aumWb = XLSX.read(aumFile[0].buffer);
  const famWb = XLSX.read(familyFile[0].buffer);
  const nfWb = XLSX.read(nonFamFile[0].buffer);

  const aumData = XLSX.utils.sheet_to_json(aumWb.Sheets[aumWb.SheetNames[0]], {
    range: 1,
  });
  const famDataRaw = XLSX.utils.sheet_to_json(
    famWb.Sheets[famWb.SheetNames[0]],
    { header: 1 },
  );
  const nfData = XLSX.utils.sheet_to_json(nfWb.Sheets[nfWb.SheetNames[0]], {
    range: 1,
  });

  // 1. Map Family List
  const familyMap = {};
  const panRegex = /PAN\s*:\s*([A-Z]{5}[0-9]{4}[A-Z]{1})/;
  famDataRaw.forEach((row) => {
    const match = row[1]?.match(panRegex);
    if (match) {
      familyMap[match[1].toUpperCase()] = {
        name_fam: row[1].split("(")[0].trim(),
        mobile: row[2],
        email: row[3],
        address: row[4],
      };
    }
  });

  // 2. Map Non-Family List
  const nfMap = {};
  nfData.forEach((row) => {
    const pan = row["Pan"]?.trim().toUpperCase();
    if (pan) nfMap[pan] = { mobile: row["Mobile"], email: row["Email"] };
  });

  // 3. Final Transformation
  return aumData
    .map((row) => {
      const pan = row["PAN"]?.trim().toUpperCase();
      if (!pan || pan.length !== 10) return null;

      const numericAum =
        parseFloat(String(row["Valuation"] || "0").replace(/,/g, "")) || 0;
      const fam = familyMap[pan] || {};
      const nf = nfMap[pan] || {};

      return {
        pan,
        name: cleanName(
          fam.name_fam || row["Family Head/Individual"] || "Unknown",
        ),
        aum: numericAum,
        category: getCategoryByAum(numericAum), // Dynamic Tier Logic
        contactDetails: {
          phoneNo: String(fam.mobile || nf.mobile || "").trim() || "N/A",
          email:
            String(fam.email || nf.email || "")
              .toLowerCase()
              .trim() || "N/A",
          address: fam.address || "N/A",
        },
        riskProfile: "Moderate",
      };
    })
    .filter((c) => c !== null);
};
