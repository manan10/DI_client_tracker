import React, { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import Navbar from '../components/Navbar';
import { 
    Activity, RefreshCw, Database, Search, Copy, Check, 
    Building2, AlertCircle, Eye, FileCode2,
    Filter, ArrowUpDown, Sparkles
} from 'lucide-react';

// =========================================================================
// GST STATE CODE LOOKUP TABLE (For Validation & Fallback Verification)
// =========================================================================
const STATE_GST_CODES = {
    "JAMMU AND KASHMIR": "01",
    "HIMACHAL PRADESH": "02",
    "PUNJAB": "03",
    "CHANDIGARH": "04",
    "UTTARAKHAND": "05",
    "HARYANA": "06",
    "DELHI": "07",
    "RAJASTHAN": "08",
    "UTTAR PRADESH": "09",
    "BIHAR": "10",
    "SIKKIM": "11",
    "ARUNACHAL PRADESH": "12",
    "NAGALAND": "13",
    "MANIPUR": "14",
    "MIZORAM": "15",
    "TRIPURA": "16",
    "MEGHALAYA": "17",
    "ASSAM": "18",
    "WEST BENGAL": "19",
    "JHARKHAND": "20",
    "ODISHA": "21",
    "CHATTISGARH": "22",
    "MADHYA PRADESH": "23",
    "GUJARAT": "24",
    "DAMAN AND DIU": "25",
    "DADRA AND NAGAR HAVELI": "26",
    "MAHARASHTRA": "27",
    "ANDHRA PRADESH": "28",
    "KARNATAKA": "29",
    "GOA": "30",
    "LAKSHADWEEP": "31",
    "KERALA": "32",
    "TAMIL NADU": "33",
    "PUDUCHERRY": "34",
    "ANDAMAN AND NICOBAR ISLANDS": "35",
    "TELANGANA": "36",
    "LADAKH": "38"
};

// =========================================================================
// INTERNAL XML UTILITIES & TEMPLATES (No external export to keep Fast Refresh)
// =========================================================================

const escapeXml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return "";
    return unsafe.toString().replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

const unescapeXml = (safe) => {
    if (safe === null || safe === undefined) return "";
    return safe.toString()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
};

const tallyTemplates = {
    getCompanies: () => `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>List of Companies</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`.trim(),

    getLedgersTest: (companyName, fetchMode = 'standard') => {
        const escapedCmp = escapeXml(companyName);

        // Approach B: Export via native collection report
        if (fetchMode === 'deep_native') {
            return `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVCURRENTCOMPANY>${escapedCmp}</SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="LedgerMastersCollection" ISMODIFY="No">
                        <TYPE>Ledger</TYPE>
                        <NATIVEMETHOD>*</NATIVEMETHOD>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`.trim();
        }

        // Approach A: Enhanced multi-fetch including TallyPrime 3.0+ statutory sub-collections
        return `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>Ledger</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVCURRENTCOMPANY>${escapedCmp}</SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="Ledger" ISMODIFY="No">
                        <TYPE>Ledger</TYPE>
                        <FETCH>
                            Name, Parent, LedStateName, StateName, CountryName, CountryOfResidence, 
                            PartyGSTIN, GSTIN, GSTRegistrationType, RegistrationType, Address,
                            PINCode, Email, IncomeTaxNumber, PANNumber, IsBillWiseOn,
                            LEDGSTREGDETAILS.LIST, GSTDETAILS.LIST, FULLMAILINGDETAILS.LIST
                        </FETCH>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`.trim();
    }
};

// =========================================================================
// MAIN COMPONENT
// =========================================================================

const TallyDebtorTest = () => {
    const { request, loading } = useApi();

    // Bridge State
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    
    // Data State
    const [debtors, setDebtors] = useState([]);
    const [selectedLedgerForInspect, setSelectedLedgerForInspect] = useState(null);
    const [rawXmlResponse, setRawXmlResponse] = useState("");
    const [fetchMode, setFetchMode] = useState('standard');
    const [filterGstOnly, setFilterGstOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortAsc, setSortAsc] = useState(true);

    // Logging State
    const [activityLog, setActivityLog] = useState([]);
    const [copiedField, setCopiedField] = useState(null);

    const logActivity = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setActivityLog(prev => [{ time, msg, type }, ...prev].slice(0, 40));
    };

    const copyToClipboard = (text, tag) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(tag);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const fetchCompanies = async () => {
        const xml = tallyTemplates.getCompanies();
        logActivity("Scanning for connected Tally instances...", "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
            setCompanies(filtered);
            if (filtered.length > 0) {
                setSelectedCompany(filtered[0]);
                setIsCompanyOpen(true);
            }
            logActivity(`Found ${filtered.length} active company files.`, "success");
        } catch {
            logActivity(`Bridge Failed. Verify Tally is open with XML port 9000 enabled.`, "error");
        }
    };

    const fetchSundryDebtors = async () => {
        if (!selectedCompany) {
            logActivity("Please select an active company first.", "error");
            return;
        }

        const xml = tallyTemplates.getLedgersTest(selectedCompany, fetchMode);
        logActivity(`Executing getLedgersTest [mode: ${fetchMode}] for "${selectedCompany}"...`, "process");
        
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            setRawXmlResponse(responseData);

            const ledgerMatches = [...responseData.matchAll(/<LEDGER NAME="([^"]*)"[^>]*>([\s\S]*?)<\/LEDGER>/gi)];
            logActivity(`Raw response parsed: ${ledgerMatches.length} total ledgers returned.`, "info");

            const parsedList = [];

            ledgerMatches.forEach(m => {
                const name = unescapeXml(m[1] || "").trim();
                const block = m[2];

                // Parent Extraction
                const parentMatch = block.match(/<PARENT[^>]*>(.*?)<\/PARENT>/i);
                const parent = parentMatch ? unescapeXml(parentMatch[1]).trim() : "";

                // Group Check: Must be under Sundry Debtors
                const isUnderDebtors = parent.toUpperCase().includes("SUNDRY DEBTORS") || 
                                       parent.toUpperCase().includes("DEBTOR");

                // Specific Check: Must contain "Mutual Fund" or "Mutual Funds" (case-insensitive)
                const isMutualFund = name.toLowerCase().includes("mutual fund") || 
                                     parent.toLowerCase().includes("mutual fund");

                if (!isUnderDebtors || !isMutualFund) return;

                // 1. Direct GSTIN/UIN Match (Root tag)
                let gstin = "";
                let gstinSource = "None";

                const rootGstinMatch = block.match(/<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>/i) ||
                                       block.match(/<GSTIN[^>]*>(.*?)<\/GSTIN>/i);

                if (rootGstinMatch && rootGstinMatch[1].trim()) {
                    gstin = unescapeXml(rootGstinMatch[1]).trim();
                    gstinSource = "Root Tag (<PARTYGSTIN>)";
                }

                // 2. Nested Sub-collection Search (TallyPrime 3.0+ statutory list)
                if (!gstin) {
                    const nestedGstinMatch = block.match(/<GSTREGISTRATIONDETAILS[^>]*>[\s\S]*?<GSTIN[^>]*>(.*?)<\/GSTIN>[\s\S]*?<\/GSTREGISTRATIONDETAILS>/i) ||
                                             block.match(/<LEDGSTREGDETAILS\.LIST[^>]*>[\s\S]*?<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>[\s\S]*?<\/LEDGSTREGDETAILS\.LIST>/i) ||
                                             block.match(/<GSTDETAILS\.LIST[^>]*>[\s\S]*?<GSTIN[^>]*>(.*?)<\/GSTIN>[\s\S]*?<\/GSTDETAILS\.LIST>/i);
                    if (nestedGstinMatch && nestedGstinMatch[1].trim()) {
                        gstin = unescapeXml(nestedGstinMatch[1]).trim();
                        gstinSource = "Sub-collection (<LEDGSTREGDETAILS>)";
                    }
                }

                // 3. State Name extraction
                const stateMatch = block.match(/<LEDSTATENAME[^>]*>(.*?)<\/LEDSTATENAME>/i) ||
                                   block.match(/<STATENAME[^>]*>(.*?)<\/STATENAME>/i) ||
                                   block.match(/<PRIORSTATENAME[^>]*>(.*?)<\/PRIORSTATENAME>/i);
                const stateName = stateMatch ? unescapeXml(stateMatch[1]).trim() : "";

                // 4. PAN / Income Tax Number
                const panMatch = block.match(/<INCOMETAXNUMBER[^>]*>(.*?)<\/INCOMETAXNUMBER>/i) ||
                                 block.match(/<PANNUMBER[^>]*>(.*?)<\/PANNUMBER>/i);
                const pan = panMatch ? unescapeXml(panMatch[1]).trim() : (gstin ? gstin.substring(2, 12) : "");

                // 5. Fallback GST prefix check using State + PAN
                const stateCode = STATE_GST_CODES[stateName.toUpperCase()] || "";
                const inferredGstPrefix = (stateCode && pan && pan.length === 10) ? `${stateCode}${pan}` : "";

                // 6. GST Registration Type
                const regTypeMatch = block.match(/<GSTREGISTRATIONTYPE[^>]*>(.*?)<\/GSTREGISTRATIONTYPE>/i) ||
                                     block.match(/<REGISTRATIONTYPE[^>]*>(.*?)<\/REGISTRATIONTYPE>/i);
                const gstRegType = regTypeMatch ? unescapeXml(regTypeMatch[1]).trim() : (gstin ? "Regular" : "Unregistered");

                // 7. Country Name
                const countryMatch = block.match(/<COUNTRYNAME[^>]*>(.*?)<\/COUNTRYNAME>/i) ||
                                     block.match(/<COUNTRYOFRESIDENCE[^>]*>(.*?)<\/COUNTRYOFRESIDENCE>/i);
                const country = countryMatch ? unescapeXml(countryMatch[1]).trim() : "India";

                // 8. Address lines
                const addressMatches = [...block.matchAll(/<ADDRESS[^>]*>(.*?)<\/ADDRESS>/gi)];
                const address = addressMatches.map(a => unescapeXml(a[1]).trim()).filter(Boolean);

                // 9. Bill-wise
                const billWiseMatch = block.match(/<ISBILLWISEON[^>]*>(.*?)<\/ISBILLWISEON>/i);
                const isBillWiseOn = billWiseMatch ? billWiseMatch[1].trim() : "No";

                parsedList.push({
                    name,
                    parent,
                    gstin,
                    gstinSource,
                    inferredGstPrefix,
                    stateName,
                    country,
                    gstRegType,
                    address,
                    pan,
                    isBillWiseOn,
                    rawXmlSnippet: block.trim()
                });
            });

            setDebtors(parsedList);
            logActivity(`Filtered ${parsedList.length} Mutual Fund accounts under Sundry Debtors.`, "success");
        } catch (err) {
            logActivity(`Query failed: ${err.message}`, "error");
        }
    };

    // Filter & Sort
    const displayedDebtors = useMemo(() => {
        let list = [...debtors];
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            list = list.filter(d => 
                d.name.toLowerCase().includes(q) || 
                d.parent.toLowerCase().includes(q) ||
                d.gstin.toLowerCase().includes(q) ||
                d.stateName.toLowerCase().includes(q)
            );
        }
        if (filterGstOnly) {
            list = list.filter(d => Boolean(d.gstin));
        }
        list.sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
        return list;
    }, [debtors, searchTerm, filterGstOnly, sortAsc]);

    // Metric Counters
    const metrics = useMemo(() => {
        const total = debtors.length;
        const withGst = debtors.filter(d => Boolean(d.gstin)).length;
        const missingGst = total - withGst;
        const withState = debtors.filter(d => Boolean(d.stateName)).length;
        return { total, withGst, missingGst, withState };
    }, [debtors]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans">
            <Navbar />

            <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* 1. TOP TITLE BAR & DIAGNOSTIC HUD */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-xs">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">
                                    Sundry Debtors & Mutual Funds GST Inspector
                                </h1>
                                <p className="text-xs text-slate-400 font-medium">
                                    Inspecting root tags and sub-collections for missing AMC GSTINs
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                            Total AMCs: <strong className="font-mono text-slate-900 dark:text-white">{metrics.total}</strong>
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                            With GSTIN: <strong className="font-mono">{metrics.withGst}</strong>
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400">
                            Missing GSTIN: <strong className="font-mono">{metrics.missingGst}</strong>
                        </span>
                        <span className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                            Mapped State: <strong className="font-mono">{metrics.withState}</strong>
                        </span>
                    </div>
                </header>

                {/* 2. CONTROL COMMAND BAR */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        
                        {/* Company Selector */}
                        <div className="md:col-span-4 flex gap-2 items-center">
                            <div className="relative flex-1">
                                <select 
                                    value={selectedCompany} 
                                    onChange={(e) => {
                                        setSelectedCompany(e.target.value);
                                        setIsCompanyOpen(Boolean(e.target.value));
                                        setDebtors([]);
                                        setSelectedLedgerForInspect(null);
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                                >
                                    <option value="">-- Choose Tally Company --</option>
                                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={fetchCompanies}
                                disabled={loading}
                                title="Scan Tally for open companies"
                                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Scan
                            </button>

                            <div 
                                title={isCompanyOpen ? "Company active and selected" : "No active company"}
                                className={`w-3 h-3 rounded-full shrink-0 border ${
                                    isCompanyOpen 
                                        ? "bg-emerald-500 border-emerald-400 animate-pulse" 
                                        : "bg-slate-300 dark:bg-slate-700 border-slate-400"
                                }`}
                            />
                        </div>

                        {/* Mode Toggle */}
                        <div className="md:col-span-3 flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Method:</span>
                            <select 
                                value={fetchMode} 
                                onChange={(e) => setFetchMode(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 px-2.5 py-2 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 outline-none"
                            >
                                <option value="standard">Enhanced Multi-Fetch (With Sub-lists)</option>
                                <option value="deep_native">Deep Native Model (*)</option>
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="md:col-span-5 flex items-center justify-end gap-2">
                            <button
                                onClick={fetchSundryDebtors}
                                disabled={!selectedCompany || loading}
                                className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                            >
                                <Database className="w-4 h-4" /> Run getLedgersTest
                            </button>

                            {rawXmlResponse && (
                                <button
                                    onClick={() => copyToClipboard(rawXmlResponse, 'rawXml')}
                                    className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    {copiedField === 'rawXml' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span className="hidden sm:inline">Copy Raw XML</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search AMC name, state, or GSTIN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <button 
                                onClick={() => setFilterGstOnly(!filterGstOnly)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    filterGstOnly 
                                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                <Filter className="w-3 h-3" /> With GSTIN Only
                            </button>

                            <button 
                                onClick={() => setSortAsc(!sortAsc)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                                <ArrowUpDown className="w-3 h-3" /> {sortAsc ? 'A-Z' : 'Z-A'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. DUAL-PANE VIEW: DEBTORS TABLE + XML RAW INSPECTOR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Primary Table Pane */}
                    <div className={`${selectedLedgerForInspect ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-175">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                            <th className="py-3 px-4">AMC Ledger Name</th>
                                            <th className="py-3 px-3">Parent Group</th>
                                            <th className="py-3 px-3">GSTIN / Inferred</th>
                                            <th className="py-3 px-3">State</th>
                                            <th className="py-3 px-3 text-center">Reg Type</th>
                                            <th className="py-3 px-3 text-right">Inspect</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                                        {displayedDebtors.map((item, idx) => {
                                            const hasGst = Boolean(item.gstin);
                                            const isSelected = selectedLedgerForInspect?.name === item.name;

                                            return (
                                                <tr 
                                                    key={idx} 
                                                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                                                        isSelected ? 'bg-indigo-50/60 dark:bg-indigo-500/10' : ''
                                                    }`}
                                                >
                                                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                                                        <div className="truncate max-w-55" title={item.name}>
                                                            {item.name}
                                                        </div>
                                                        {item.pan && (
                                                            <span className="text-[10px] font-mono text-slate-400 font-medium block">
                                                                PAN: {item.pan}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-3">
                                                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-37.5">
                                                            {item.parent}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-3">
                                                        {hasGst ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                                    {item.gstin}
                                                                </span>
                                                                <button
                                                                    onClick={() => copyToClipboard(item.gstin, `gst-${idx}`)}
                                                                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                                                >
                                                                    {copiedField === `gst-${idx}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                                </button>
                                                            </div>
                                                        ) : item.inferredGstPrefix ? (
                                                            <div className="space-y-0.5">
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded">
                                                                    <Sparkles className="w-3 h-3" /> Prefix: {item.inferredGstPrefix}...
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 block">
                                                                    Root tag missing in Tally
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded">
                                                                <AlertCircle className="w-3 h-3" /> MISSING
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                                                        {item.stateName || <span className="text-slate-400 italic">Not set</span>}
                                                    </td>

                                                    <td className="py-3 px-3 text-center">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                            item.gstRegType.toLowerCase() === 'regular'
                                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                        }`}>
                                                            {item.gstRegType}
                                                        </span>
                                                    </td>

                                                    <td className="py-3 px-3 text-right">
                                                        <button 
                                                            onClick={() => setSelectedLedgerForInspect(isSelected ? null : item)}
                                                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                                                isSelected 
                                                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white border-slate-200 dark:border-white/10'
                                                            }`}
                                                            title="Inspect raw XML block for this AMC"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {displayedDebtors.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-400">
                                                    {debtors.length === 0 
                                                        ? "No Mutual Fund debtor ledgers loaded. Click 'Run getLedgersTest' above." 
                                                        : "No matching Mutual Fund accounts found for the current search filter."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Inspection Sidebar */}
                    {selectedLedgerForInspect && (
                        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                                <div className="flex items-center gap-2">
                                    <FileCode2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                        Raw XML Node Inspector
                                    </h3>
                                </div>
                                <button 
                                    onClick={() => setSelectedLedgerForInspect(null)}
                                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>

                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                                    {selectedLedgerForInspect.name}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-mono">
                                    Parent: {selectedLedgerForInspect.parent} | Detection: {selectedLedgerForInspect.gstinSource}
                                </p>
                            </div>

                            {/* Diagnostic Checklist */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                                    <span className="text-slate-400 block text-[9px]">PARTYGSTIN / GSTIN</span>
                                    <strong className={selectedLedgerForInspect.gstin ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}>
                                        {selectedLedgerForInspect.gstin || "NOT FOUND IN XML"}
                                    </strong>
                                </div>

                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                                    <span className="text-slate-400 block text-[9px]">INFERRED PREFIX</span>
                                    <strong className={selectedLedgerForInspect.inferredGstPrefix ? "text-amber-500" : "text-slate-400"}>
                                        {selectedLedgerForInspect.inferredGstPrefix ? `${selectedLedgerForInspect.inferredGstPrefix}???` : "N/A"}
                                    </strong>
                                </div>

                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                                    <span className="text-slate-400 block text-[9px]">STATENAME / LEDSTATE</span>
                                    <strong className={selectedLedgerForInspect.stateName ? "text-slate-800 dark:text-slate-200" : "text-rose-500"}>
                                        {selectedLedgerForInspect.stateName || "NULL"}
                                    </strong>
                                </div>

                                <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-white/5">
                                    <span className="text-slate-400 block text-[9px]">REGISTRATION TYPE</span>
                                    <strong className="text-slate-800 dark:text-slate-200">
                                        {selectedLedgerForInspect.gstRegType || "NULL"}
                                    </strong>
                                </div>
                            </div>

                            {/* Raw XML Snippet Box */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                                    <span>Tally Ledger Object Chunk</span>
                                    <button 
                                        onClick={() => copyToClipboard(selectedLedgerForInspect.rawXmlSnippet, 'inspectSnippet')}
                                        className="hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedField === 'inspectSnippet' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                                    </button>
                                </div>
                                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-lg text-[10px] font-mono overflow-x-auto max-h-72 leading-relaxed border border-slate-800">
                                    {selectedLedgerForInspect.rawXmlSnippet}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. ACTIVITY LOG TERMINAL */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-indigo-500" /> Connection & Diagnostic Feed
                        </span>
                        <span>{activityLog.length} Records</span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-xs">
                        {activityLog.map((log, index) => (
                            <div key={index} className="flex items-start gap-2.5">
                                <span className="text-slate-400 text-[10px] shrink-0 mt-0.5">{log.time}</span>
                                <span className={
                                    log.type === 'error' ? 'text-rose-600 dark:text-rose-400 font-semibold' :
                                    log.type === 'success' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' :
                                    'text-slate-600 dark:text-slate-300'
                                }>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default TallyDebtorTest;