import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, Loader2, Database, XCircle, Files, CheckSquare, XSquare, Activity, KeySquare, Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useApi } from '../../hooks/useApi';

const FolioReconciler = () => {
    const { request, loading } = useApi();
    
    const [camsFile, setCamsFile] = useState(null);
    const [weFiles, setWeFiles] = useState([]);
    const [amcSheetName, setAmcSheetName] = useState("");
    
    const [missingData, setMissingData] = useState(null);
    const [matchedData, setMatchedData] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('missing'); 

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleCamsFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
            setCamsFile(file);
            clearResults();
        } else {
            toast.error("Please upload a valid Excel or CSV file for CAMS/KARVY.");
        }
    };

    const handleWeFilesChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'));
        if (validFiles.length > 0) {
            setWeFiles(validFiles);
            clearResults();
        }
    };

    const clearResults = () => {
        setMissingData(null);
        setMatchedData(null);
        setStats(null);
        setSearchTerm("");
        setSortConfig({ key: null, direction: 'asc' });
        setActiveTab('missing');
    };

    const handleReconcile = async () => {
        if (!camsFile || weFiles.length === 0) {
            toast.error("Please upload files to begin.");
            return;
        }
        if (!amcSheetName.trim()) {
            toast.error("Please specify the target CAMS Sheet Name.");
            return;
        }

        const formData = new FormData();
        formData.append('camsFile', camsFile);
        formData.append('amcSheetName', amcSheetName.trim());
        weFiles.forEach(file => formData.append('wealthEliteFiles', file));

        try {
            const response = await request('/folios/reconcile', 'POST', formData);
            setMissingData(response.missingFolios);
            setMatchedData(response.matchedFolios);
            setStats(response.stats);
            
            if (response.missingFolios.length === 0) {
                toast.success(`Perfect Match! ${response.matchedFolios.length} unique folios verified.`);
                setActiveTab('matched');
            } else {
                toast.warning(`Identified ${response.missingFolios.length} missing folios.`);
                setActiveTab('missing');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Processing error encountered.");
        }
    };

    const resetTool = () => {
        setCamsFile(null);
        setWeFiles([]);
        setAmcSheetName("");
        clearResults();
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-50" />;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-emerald-500" /> 
            : <ArrowDown className="w-3.5 h-3.5 ml-1 text-emerald-500" />;
    };

    // ==========================================
    // EXPORT ENGINE: FULLY POPULATED CAMS FORMAT
    // ==========================================
    const exportToCamsFormat = () => {
        if (!missingData || missingData.length === 0) {
            toast.error("No missing data to export.");
            return;
        }

        const camsHeaders = stats?.cams?.camsHeaders;
        const camsConstants = stats?.cams?.constants || {}; // Retrieve the sampled constants
        
        if (!camsHeaders || camsHeaders.length === 0) {
            toast.error("Could not retrieve original CAMS headers. Export failed.");
            return;
        }

        const norm = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        // Dynamically hunt for all column indexes
        const colIndexes = {
            folio: camsHeaders.findIndex(h => norm(h).includes('folio') && !norm(h).includes('portfolio')),
            name: camsHeaders.findIndex(h => norm(h).includes('invname') || norm(h).includes('investorname') || norm(h) === 'name'),
            pan: camsHeaders.findIndex(h => norm(h) === 'panno' || norm(h) === 'pan'),
            email: camsHeaders.findIndex(h => norm(h) === 'email' || norm(h).includes('emailid')),
            mobile: camsHeaders.findIndex(h => norm(h) === 'mobileno' || norm(h) === 'mobile'),
            amcCode: camsHeaders.findIndex(h => norm(h).includes('amccode')),
            amcName: camsHeaders.findIndex(h => norm(h).includes('amcname')),
            brokerCode: camsHeaders.findIndex(h => norm(h).includes('brokercode'))
        };

        const exportData = [camsHeaders];

        missingData.forEach(row => {
            const newRow = new Array(camsHeaders.length).fill(""); 
            
            // Map Dynamic Client Data
            if (colIndexes.folio !== -1) newRow[colIndexes.folio] = row.folio !== '-' ? row.folio : "";
            if (colIndexes.name !== -1) newRow[colIndexes.name] = row.name !== '-' ? row.name : "";
            if (colIndexes.pan !== -1) newRow[colIndexes.pan] = row.pan !== '-' ? row.pan : "";
            if (colIndexes.email !== -1) newRow[colIndexes.email] = row.email !== '-' ? row.email : "";
            if (colIndexes.mobile !== -1) newRow[colIndexes.mobile] = row.mobile !== '-' ? row.mobile : "";
            
            // Map Static Template Constants
            if (colIndexes.amcCode !== -1) newRow[colIndexes.amcCode] = camsConstants.amcCode || "";
            if (colIndexes.amcName !== -1) newRow[colIndexes.amcName] = camsConstants.amcName || "";
            if (colIndexes.brokerCode !== -1) newRow[colIndexes.brokerCode] = camsConstants.brokerCode || "";

            exportData.push(newRow);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, amcSheetName || "Missing_Folios");
        XLSX.writeFile(workbook, `Missing_Folios_For_${amcSheetName || 'CAMS'}.xlsx`);
        
        toast.success("Excel file generated successfully! You can copy-paste this directly into CAMS.");
    };

    const processedTableData = useMemo(() => {
        let rawDataset = activeTab === 'missing' ? missingData : matchedData;
        if (!rawDataset) return [];

        if (searchTerm.trim() !== "") {
            const query = searchTerm.toLowerCase().trim();
            rawDataset = rawDataset.filter(item => 
                String(item.folio).toLowerCase().includes(query) ||
                String(item.name).toLowerCase().includes(query) ||
                String(item.pan).toLowerCase().includes(query) ||
                String(item.email).toLowerCase().includes(query) ||
                String(item.mobile).toLowerCase().includes(query)
            );
        }

        if (sortConfig.key) {
            rawDataset = [...rawDataset].sort((a, b) => {
                const valA = String(a[sortConfig.key] || '').toLowerCase();
                const valB = String(b[sortConfig.key] || '').toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rawDataset;
    }, [missingData, matchedData, activeTab, searchTerm, sortConfig]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Layout */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                        <Database className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Master Folio Reconciler</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Identify missing folios by checking Combined WE exports against a targeted CAMS sheet.
                        </p>
                    </div>
                </div>
                {(camsFile || weFiles.length > 0 || stats) && (
                    <button onClick={resetTool} className="flex items-center space-x-1 text-slate-500 hover:text-rose-500 transition-colors">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Reset</span>
                    </button>
                )}
            </div>

            {/* Target AMC Input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
                    <KeySquare className="w-4 h-4 text-emerald-500" />
                    <span>Target CAMS Sheet Name (AMC)</span>
                </label>
                <input 
                    type="text" value={amcSheetName} onChange={(e) => setAmcSheetName(e.target.value)}
                    placeholder="e.g. ICICI, HDFC, TATA..."
                    className="w-full md:w-1/2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
                />
            </div>

            {/* Upload Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${weFiles.length > 0 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}>
                    <input type="file" accept=".xlsx, .xls, .csv" multiple onChange={handleWeFilesChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center space-y-3 pointer-events-none">
                        {weFiles.length > 0 ? <Files className="w-10 h-10 text-emerald-500" /> : <Upload className="w-10 h-10 text-slate-400" />}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Combined Wealth Elite Data</h3>
                            <p className="text-sm text-slate-500 mt-1">{weFiles.length > 0 ? `${weFiles.length} file(s) selected` : "Upload WE exports"}</p>
                        </div>
                    </div>
                </div>

                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${camsFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleCamsFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center space-y-3 pointer-events-none">
                        {camsFile ? <CheckCircle2 className="w-10 h-10 text-emerald-500" /> : <Upload className="w-10 h-10 text-slate-400" />}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">CAMS/KARVY Master Report</h3>
                            <p className="text-sm text-slate-500 mt-1">{camsFile ? camsFile.name : "Upload Master Report"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Run Button Layout */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>Automatically maps matched PANs to your Client CRM Database to enrich email & mobile records.</span>
                </div>
                <button
                    onClick={handleReconcile}
                    disabled={!camsFile || weFiles.length === 0 || !amcSheetName.trim() || loading}
                    className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all justify-center w-full sm:w-auto"
                >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing DB Lookup...</span></> : <><FileSpreadsheet className="w-5 h-5" /><span>Run Reconciliation</span></>}
                </button>
            </div>

            {/* Core Statistics & Analytical Data Grids */}
            {stats && (
                <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">Wealth Elite Configuration Pool</h3>
                            <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
                                {stats.wealthElite.map((f, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-4">{f.fileName}</span>
                                        <span className="text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">{f.rawRowsParsed} Rows</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Unified WE Unique Count</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.overall.totalWeUniqueCombined} Folios</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">CAMS Target Filter</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{stats.cams.fileName}</p>
                                        <p className="text-xs text-rose-500 font-semibold mt-1">Target Sheet: {stats.cams.sheetTargeted}</p>
                                    </div>
                                    <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded">→ {stats.cams.uniqueFolios} Unique</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Data Table Shell Component */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                        
                        {/* Tab Headers and Search Toolbar Control Section */}
                        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 gap-2">
                            <div className="flex bg-slate-200/60 dark:bg-slate-900 rounded-lg p-1 space-x-1">
                                <button onClick={() => { setActiveTab('missing'); setSearchTerm(""); }} className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-xs transition-all ${activeTab === 'missing' ? 'bg-white dark:bg-slate-800 shadow text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <XSquare className="w-3.5 h-3.5" /><span>Missing from CAMS ({missingData.length})</span>
                                </button>
                                <button onClick={() => { setActiveTab('matched'); setSearchTerm(""); }} className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-xs transition-all ${activeTab === 'matched' ? 'bg-white dark:bg-slate-800 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <CheckSquare className="w-3.5 h-3.5" /><span>Matched ({matchedData.length})</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1 lg:max-w-xs">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white"
                                    />
                                </div>
                                
                                {/* EXPORT BUTTON FOR MISSING TAB */}
                                {activeTab === 'missing' && missingData.length > 0 && (
                                    <button
                                        onClick={exportToCamsFormat}
                                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Export CAMS Format</span>
                                        <span className="sm:hidden">Export</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Interactive Dynamic Grid Matrix Body */}
                        {processedTableData.length > 0 ? (
                            <div className="overflow-x-auto max-h-[450px]">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th onClick={() => requestSort('folio')} className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">Folio No. {renderSortIcon('folio')}</div>
                                            </th>
                                            <th onClick={() => requestSort('name')} className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">Client Name {renderSortIcon('name')}</div>
                                            </th>
                                            <th onClick={() => requestSort('pan')} className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">PAN {renderSortIcon('pan')}</div>
                                            </th>
                                            <th onClick={() => requestSort('email')} className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">Email Address {renderSortIcon('email')}</div>
                                            </th>
                                            <th onClick={() => requestSort('mobile')} className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">Mobile No. {renderSortIcon('mobile')}</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedTableData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-3.5 whitespace-nowrap font-medium text-slate-900 dark:text-white">{row.folio}</td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">{row.name}</td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 tracking-wider uppercase font-mono text-xs">{row.pan}</td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400 text-xs">{row.email}</td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-xs">{row.mobile}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-16 text-center text-slate-400">
                                <p className="text-sm font-medium">No records found matching your current parameters.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FolioReconciler;