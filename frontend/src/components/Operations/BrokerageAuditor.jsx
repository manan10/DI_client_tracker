import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, Loader2, Landmark, XCircle, Files, CheckSquare, XSquare, Activity, KeySquare, Search, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useApi } from '../../hooks/useApi';

const BrokerageAuditor = () => {
    const { request, loading } = useApi();
    
    const [camsFile, setCamsFile] = useState(null);
    const [brokerageFile, setBrokerageFile] = useState(null);
    const [amcSheetName, setAmcSheetName] = useState("");
    
    const [unpaidData, setUnpaidData] = useState(null);
    const [paidData, setPaidData] = useState(null);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('unpaid'); 

    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleFileChange = (e, setter, typeName) => {
        const file = e.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
            setter(file);
            clearResults();
        } else {
            toast.error(`Please upload a valid Excel or CSV file for the ${typeName}.`);
        }
    };

    const clearResults = () => {
        setUnpaidData(null);
        setPaidData(null);
        setStats(null);
        setSearchTerm("");
        setSortConfig({ key: null, direction: 'asc' });
        setActiveTab('unpaid');
    };

    const handleReconcile = async () => {
        if (!camsFile || !brokerageFile) {
            toast.error("Please upload both files to begin.");
            return;
        }
        if (!amcSheetName.trim()) {
            toast.error("Please specify the target AMC Sheet Name.");
            return;
        }

        const formData = new FormData();
        formData.append('camsFile', camsFile);
        formData.append('brokerageFile', brokerageFile);
        formData.append('amcSheetName', amcSheetName.trim());
        
        try {
            // Hitting the new dedicated Brokerage Audit endpoint
            const response = await request('/brokerage/audit', 'POST', formData);
            setUnpaidData(response.unpaidFolios);
            setPaidData(response.paidFolios);
            setStats(response.stats);
            
            if (response.unpaidFolios.length === 0) {
                toast.success(`100% Payout Success! Brokerage received for all ${response.paidFolios.length} folios.`);
                setActiveTab('paid');
            } else {
                toast.warning(`Identified ${response.unpaidFolios.length} folios missing brokerage payments.`);
                setActiveTab('unpaid');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Processing error encountered.");
        }
    };

    const resetTool = () => {
        setCamsFile(null);
        setBrokerageFile(null);
        setAmcSheetName("");
        clearResults();
    };

    const formatINR = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount || 0);
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-50" />;
        return sortConfig.direction === 'asc' 
            ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-amber-500" /> 
            : <ArrowDown className="w-3.5 h-3.5 ml-1 text-amber-500" />;
    };

    const exportUnpaidFolios = () => {
        if (!unpaidData || unpaidData.length === 0) return;

        const camsHeaders = stats?.cams?.camsHeaders;
        const camsConstants = stats?.cams?.constants || {}; 
        
        if (!camsHeaders || camsHeaders.length === 0) {
            toast.error("Could not retrieve original format headers. Export failed.");
            return;
        }

        const norm = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        const colIndexes = {
            folio: camsHeaders.findIndex(h => norm(h).includes('folio') && !norm(h).includes('portfolio')),
            name: camsHeaders.findIndex(h => norm(h).includes('invname') || norm(h).includes('investor')),
            pan: camsHeaders.findIndex(h => norm(h).includes('pan')),
            email: camsHeaders.findIndex(h => norm(h).includes('email')),
            mobile: camsHeaders.findIndex(h => norm(h).includes('mobile')),
            amcCode: camsHeaders.findIndex(h => norm(h).includes('amccode') || norm(h).includes('productcode')),
            amcName: camsHeaders.findIndex(h => norm(h).includes('amcname') || norm(h) === 'fund'),
            brokerCode: camsHeaders.findIndex(h => norm(h).includes('brokercode') || norm(h).includes('arn'))
        };

        const exportData = [];

        unpaidData.forEach(row => {
            const newRow = new Array(camsHeaders.length).fill(""); 
            if (colIndexes.folio !== -1) newRow[colIndexes.folio] = row.folio !== '-' ? row.folio : "";
            if (colIndexes.name !== -1) newRow[colIndexes.name] = row.name !== '-' ? row.name : "";
            if (colIndexes.pan !== -1) newRow[colIndexes.pan] = row.pan !== '-' ? row.pan : "";
            if (colIndexes.email !== -1) newRow[colIndexes.email] = row.email !== '-' ? row.email : "";
            if (colIndexes.mobile !== -1) newRow[colIndexes.mobile] = row.mobile !== '-' ? row.mobile : "";
            if (colIndexes.amcCode !== -1) newRow[colIndexes.amcCode] = camsConstants.amcCode || "";
            if (colIndexes.amcName !== -1) newRow[colIndexes.amcName] = camsConstants.amcName || "";
            if (colIndexes.brokerCode !== -1) newRow[colIndexes.brokerCode] = camsConstants.brokerCode || "";
            exportData.push(newRow);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Unpaid_Folios");
        XLSX.writeFile(workbook, `Unpaid_Brokerage_Audit_${amcSheetName}.xlsx`);
    };

    const processedTableData = useMemo(() => {
        let rawDataset = activeTab === 'unpaid' ? unpaidData : paidData;
        if (!rawDataset) return [];

        if (searchTerm.trim() !== "") {
            const query = searchTerm.toLowerCase().trim();
            rawDataset = rawDataset.filter(item => 
                String(item.folio).toLowerCase().includes(query) ||
                String(item.name).toLowerCase().includes(query) ||
                String(item.pan).toLowerCase().includes(query)
            );
        }

        if (sortConfig.key) {
            rawDataset = [...rawDataset].sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if (sortConfig.key === 'brokerageAmount') {
                    return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
                }

                valA = String(valA || '').toLowerCase();
                valB = String(valB || '').toLowerCase();
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return rawDataset;
    }, [unpaidData, paidData, activeTab, searchTerm, sortConfig]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Layout */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-500/10 rounded-lg">
                        <Landmark className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Brokerage Revenue Auditor</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Cross-reference AMC payout sheets against your master folio list to track unpaid commissions.
                        </p>
                    </div>
                </div>
                {(camsFile || brokerageFile || stats) && (
                    <button onClick={resetTool} className="flex items-center space-x-1 text-slate-500 hover:text-rose-500 transition-colors">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Reset Auditor</span>
                    </button>
                )}
            </div>

            {/* Target AMC Input */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm border-l-4 border-l-amber-500">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2 items-center space-x-2">
                    <KeySquare className="w-4 h-4 text-amber-500" />
                    <span>Target Master Sheet Name (e.g. NIPPON, HDFC)</span>
                </label>
                <input 
                    type="text" value={amcSheetName} onChange={(e) => setAmcSheetName(e.target.value)}
                    placeholder="Sheet name inside the Master File..."
                    className="w-full md:w-1/2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none dark:text-white"
                />
            </div>

            {/* Upload Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CAMS Upload */}
                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${camsFile ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-amber-400'}`}>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileChange(e, setCamsFile, "Master File")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center space-y-3 pointer-events-none">
                        {camsFile ? <CheckCircle2 className="w-10 h-10 text-amber-500" /> : <Upload className="w-10 h-10 text-slate-400" />}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">CAMS/KARVY Master List</h3>
                            <p className="text-sm text-slate-500 mt-1">{camsFile ? camsFile.name : "Upload Master Source of Truth"}</p>
                        </div>
                    </div>
                </div>

                {/* Brokerage List Upload */}
                <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${brokerageFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'}`}>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={(e) => handleFileChange(e, setBrokerageFile, "Brokerage List")} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center space-y-3 pointer-events-none">
                        {brokerageFile ? <Files className="w-10 h-10 text-emerald-500" /> : <FileSpreadsheet className="w-10 h-10 text-slate-400" />}
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Brokerage Payout List</h3>
                            <p className="text-sm text-slate-500 mt-1">{brokerageFile ? brokerageFile.name : "Upload list with Folios & Amounts"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Run Button Layout */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>Groups multiple scheme payouts by Folio and checks against your Master list.</span>
                </div>
                <button
                    onClick={handleReconcile}
                    disabled={!camsFile || !brokerageFile || !amcSheetName.trim() || loading}
                    className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all justify-center w-full sm:w-auto"
                >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Auditing Revenues...</span></> : <><Landmark className="w-5 h-5" /><span>Run Brokerage Audit</span></>}
                </button>
            </div>

            {/* Core Statistics */}
            {stats && (
                <div className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between border-t-4 border-t-amber-500">
                            <div>
                                <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">Master Data Evaluated</h3>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{stats.cams.fileName}</p>
                                        <p className="text-xs text-amber-500 font-semibold mt-1">Sheet: {stats.cams.sheetTargeted}</p>
                                    </div>
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded">→ {stats.cams.uniqueFolios} Expected Folios</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 border-t-4 border-t-emerald-500">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-4">Brokerage Yield Matrix</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Raw Transactions Merged</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{stats.brokerage.totalTransactionsParsed} rows</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Unique Earning Folios</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{stats.brokerage.uniqueEarningFolios} folios</span>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Total Tracked Brokerage</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">{formatINR(stats.brokerage.totalBrokerageTracked)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Table View */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 gap-2">
                            <div className="flex bg-slate-200/60 dark:bg-slate-900 rounded-lg p-1 space-x-1">
                                <button onClick={() => { setActiveTab('unpaid'); setSearchTerm(""); }} className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-xs transition-all ${activeTab === 'unpaid' ? 'bg-white dark:bg-slate-800 shadow text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <XSquare className="w-3.5 h-3.5" /><span>Unpaid Folios ({unpaidData.length})</span>
                                </button>
                                <button onClick={() => { setActiveTab('paid'); setSearchTerm(""); }} className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-xs transition-all ${activeTab === 'paid' ? 'bg-white dark:bg-slate-800 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <CheckSquare className="w-3.5 h-3.5" /><span>Paid Folios ({paidData.length})</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <div className="relative flex-1 lg:max-w-xs">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search folio, name..."
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 dark:text-white"
                                    />
                                </div>
                                {activeTab === 'unpaid' && unpaidData.length > 0 && (
                                    <button onClick={exportUnpaidFolios} className="flex items-center space-x-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 rounded-lg text-xs font-semibold shadow-sm transition-all whitespace-nowrap">
                                        <Download className="w-3.5 h-3.5" />
                                        <span className="hidden sm:inline">Export Unpaid</span>
                                        <span className="sm:hidden">Export</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {processedTableData.length > 0 ? (
                            <div className="overflow-x-auto max-h-112.5">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th onClick={() => requestSort('folio')} className="px-6 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">Folio No. {renderSortIcon('folio')}</div>
                                            </th>
                                            <th onClick={() => requestSort('name')} className="px-6 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">Client Name {renderSortIcon('name')}</div>
                                            </th>
                                            <th onClick={() => requestSort('pan')} className="px-6 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center">PAN {renderSortIcon('pan')}</div>
                                            </th>
                                            <th onClick={() => requestSort('brokerageAmount')} className="px-6 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                <div className="flex items-center justify-end">Brokerage Earned {renderSortIcon('brokerageAmount')}</div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedTableData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-white">{row.folio}</td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">{row.name}</td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 tracking-wider uppercase font-mono text-xs">{row.pan}</td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-right font-mono font-medium">
                                                    {row.brokerageAmount > 0 ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">{formatINR(row.brokerageAmount)}</span>
                                                    ) : (
                                                        <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded font-bold">UNPAID</span>
                                                    )}
                                                </td>
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

export default BrokerageAuditor;