import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '../../hooks/useApi'; 
import { tallyTemplates } from '../../utils/tallyTemplates'; 
import { Play, CheckCircle, XCircle, AlertTriangle, FileText, Copy, RefreshCw, ArrowDownLeft, ArrowUpRight, Tag } from 'lucide-react';
import { toast } from 'sonner';

const MatcherTestBench = () => {
    const { request, loading } = useApi();
    
    // Form State
    const [tallyCompany, setTallyCompany] = useState("");
    const [file, setFile] = useState(null);
    
    // Tally State
    const [availableCompanies, setAvailableCompanies] = useState([]);
    const [isTallyOnline, setIsTallyOnline] = useState(false);
    
    // Result State
    const [results, setResults] = useState([]);
    const [availableLedgers, setAvailableLedgers] = useState([]);
    
    // Tab State
    const [activeTab, setActiveTab] = useState('RECEIPT');

    // Poll Tally directly for open companies
    const checkConnection = useCallback(async () => {
        try {
            const res = await request("/tally/proxy", "POST", { xml: tallyTemplates.getCompanies() });
            if (res) {
                const matches = [...res.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
                const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
                setAvailableCompanies(filtered);
                setIsTallyOnline(filtered.length > 0);
            } else {
                setIsTallyOnline(false);
                setAvailableCompanies([]);
            }
        } catch { 
            setIsTallyOnline(false); 
            setAvailableCompanies([]);
        }
    }, [request]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, [checkConnection]);

    const handleRunTest = async () => {
        if (!file || !tallyCompany) {
            toast.error("Please select both a file and a company name.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tallyCompany", tallyCompany);

        try {
            const res = await request('/audit/test-matcher', 'POST', formData, true); 
            if (res.success) {
                // Initialize the expected tags to match the algorithm's guesses
                const mappedResults = res.data.map(r => ({
                    ...r,
                    expectedCommission: r.isCommission,
                    expectedSales: r.isSales
                }));
                
                setResults(mappedResults);
                setAvailableLedgers(res.ledgers);
                setActiveTab('RECEIPT');
                toast.success(`Successfully analyzed ${res.count} rows.`);
            }
        } catch (error) {
            toast.error(error.message || "Failed to run test.");
        }
    };

    const handleMarkStatus = (id, status) => {
        setResults(prev => prev.map(r => 
            r.id === id ? { ...r, status, correctedLedger: status === 'CORRECT' ? r.suggestedLedger : r.correctedLedger } : r
        ));
    };

    const handleCorrectedLedgerChange = (id, ledgerName) => {
        setResults(prev => prev.map(r => 
            r.id === id ? { ...r, correctedLedger: ledgerName } : r
        ));
    };

    const handleExpectedTagToggle = (id, type) => {
        setResults(prev => prev.map(r => 
            r.id === id ? { ...r, [type]: !r[type] } : r
        ));
    };

    // Helper to generate a copyable report of both successes and failures for the AI prompt
    const generateAIReport = () => {
        // A row is a failure if the ledger was wrong OR if the tags were wrong
        const failures = results.filter(r => 
            r.status === 'INCORRECT' || 
            r.isCommission !== r.expectedCommission || 
            r.isSales !== r.expectedSales
        );
        
        // A row is a success if everything was marked correct
        const successes = results.filter(r => 
            r.status === 'CORRECT' && 
            r.isCommission === r.expectedCommission && 
            r.isSales === r.expectedSales
        );

        if (failures.length === 0 && successes.length === 0) {
            toast.info("Please validate some rows first!");
            return;
        }

        let report = "--- ALGORITHM TEST BENCH REPORT ---\n\n";

        if (failures.length > 0) {
            report += "🚨 FAILED MATCHES (Needs fixing):\n\n";
            failures.forEach(f => {
                report += `Narration: ${f.narration}\n`;
                report += `Type: ${f.type}\n`;
                report += `Ledger Got: ${f.suggestedLedger} (Confidence: ${f.confidence})\n`;
                report += `Ledger Expected: ${f.status === 'INCORRECT' ? (f.correctedLedger || "[NOT SELECTED]") : "CORRECT"}\n`;
                report += `Tags Got: Comm=${!!f.isCommission} | Sales=${!!f.isSales}\n`;
                report += `Tags Expected: Comm=${!!f.expectedCommission} | Sales=${!!f.expectedSales}\n\n`;
            });
        }

        if (successes.length > 0) {
            report += "✅ CORRECT MATCHES (Do not break these):\n\n";
            successes.forEach(s => {
                report += `Narration: ${s.narration}\n`;
                report += `Type: ${s.type}\n`;
                report += `Ledger Got: ${s.suggestedLedger} (Confidence: ${s.confidence})\n`;
                report += `Tags Got: Comm=${!!s.isCommission} | Sales=${!!s.isSales}\n\n`;
            });
        }

        navigator.clipboard.writeText(report);
        toast.success("Full AI report copied to clipboard!");
    };

    // Stats & Filtering
    const totalProcessed = results.length;
    const totalCorrect = results.filter(r => r.status === 'CORRECT').length;
    const totalIncorrect = results.filter(r => r.status === 'INCORRECT').length;
    
    const receiptCount = results.filter(r => r.type === 'RECEIPT').length;
    const paymentCount = results.filter(r => r.type === 'PAYMENT').length;

    const displayedResults = useMemo(() => {
        return results.filter(r => r.type === activeTab);
    }, [results, activeTab]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="text-amber-500" />
                        Algo Test Bench
                    </h1>
                    <p className="text-slate-500 text-sm">Upload a raw bank statement to test the Genius Matcher & Tagger.</p>
                </div>
                {results.length > 0 && (
                    <button 
                        onClick={generateAIReport}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition shadow-md"
                    >
                        <Copy size={16} /> Export AI Report
                    </button>
                )}
            </div>

            {/* CONTROL PANEL */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-end gap-4">
                <div className="flex-1 relative">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tally Firm</label>
                        <div className="flex items-center gap-2">
                            <button onClick={checkConnection} className="text-slate-400 hover:text-emerald-500 transition" title="Refresh Companies">
                                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <span className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${isTallyOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isTallyOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                {isTallyOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                    
                    <select 
                        value={tallyCompany}
                        onChange={(e) => setTallyCompany(e.target.value)}
                        disabled={!isTallyOnline}
                        className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 bg-white outline-none disabled:opacity-50 disabled:bg-slate-50"
                    >
                        <option value="">-- Select Open Company --</option>
                        {availableCompanies.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Bank Statement</label>
                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-2.5 hover:border-emerald-500 transition cursor-pointer bg-slate-50">
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <div className="flex items-center gap-2 text-slate-600 text-sm overflow-hidden">
                            <FileText size={18} />
                            <span className="truncate">{file ? file.name : "Choose CSV/Excel file..."}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleRunTest}
                    disabled={loading || !tallyCompany || !file}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 font-semibold disabled:opacity-50 transition"
                >
                    {loading ? <span className="animate-spin">⚙️</span> : <Play size={18} />}
                    Run Matcher
                </button>
            </div>

            {/* RESULTS STATS */}
            {results.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 border p-4 rounded-xl text-center">
                        <p className="text-2xl font-black text-slate-700">{totalProcessed}</p>
                        <p className="text-xs font-bold uppercase text-slate-400">Processed</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                        <p className="text-2xl font-black text-emerald-600">{totalCorrect}</p>
                        <p className="text-xs font-bold uppercase text-emerald-500">Correct</p>
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                        <p className="text-2xl font-black text-rose-600">{totalIncorrect}</p>
                        <p className="text-xs font-bold uppercase text-rose-500">Incorrect</p>
                    </div>
                </div>
            )}

            {/* DATA TABLE & TABS */}
            {results.length > 0 && (
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col">
                    
                    {/* SEGMENTED TAB CONTROL */}
                    <div className="p-3 border-b bg-slate-50 flex items-center gap-2">
                        <div className="flex p-1 bg-slate-200/50 rounded-lg w-fit">
                            <button
                                onClick={() => setActiveTab('RECEIPT')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === 'RECEIPT' 
                                        ? 'bg-white text-emerald-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <ArrowDownLeft size={14} className={activeTab === 'RECEIPT' ? 'text-emerald-500' : 'opacity-50'} />
                                Receipts 
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'RECEIPT' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {receiptCount}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('PAYMENT')}
                                className={`flex items-center gap-2 px-6 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === 'PAYMENT' 
                                        ? 'bg-white text-rose-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <ArrowUpRight size={14} className={activeTab === 'PAYMENT' ? 'text-rose-500' : 'opacity-50'} />
                                Payments
                                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'PAYMENT' ? 'bg-rose-50 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                                    {paymentCount}
                                </span>
                            </button>
                        </div>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                            <tr>
                                <th className="p-4 w-1/2">Transaction Details</th>
                                <th className="p-4 w-1/4">Algorithm Suggestion</th>
                                <th className="p-4 text-center">Validation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedResults.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-8 text-center text-slate-400 text-sm font-bold italic">
                                        No {activeTab.toLowerCase()}s found in this statement.
                                    </td>
                                </tr>
                            ) : (
                                displayedResults.map((row) => (
                                    <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${row.status === 'INCORRECT' ? 'bg-rose-50/30' : ''}`}>
                                        {/* NARRATION COL */}
                                        <td className="p-4">
                                            <div className="font-mono text-xs text-slate-800 break-all bg-slate-100 p-2 rounded border border-slate-200 mb-2">
                                                {row.narration}
                                            </div>
                                            <div className="flex items-center justify-between pr-4">
                                                <div className="flex items-center gap-3 text-xs font-bold">
                                                    <span className={row.type === 'RECEIPT' ? 'text-emerald-600' : 'text-rose-600'}>{row.type}</span>
                                                    <span className="text-slate-500">Amt: {row.amount}</span>
                                                </div>
                                                
                                                {/* AUTO-TAGGING BADGES (Displaying Algo's Guess) */}
                                                <div className="flex items-center gap-2">
                                                    {row.isCommission && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                            <Tag size={10} /> Comm
                                                        </span>
                                                    )}
                                                    {row.isSales && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                            <Tag size={10} /> Sales
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* SUGGESTION COL */}
                                        <td className="p-4 align-top pt-5">
                                            <p className="font-bold text-slate-700">{row.suggestedLedger}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${row.confidence > 0.8 ? 'bg-emerald-500' : row.confidence > 0.4 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                                        style={{ width: `${Math.min(row.confidence * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold text-slate-400">{Math.round(row.confidence * 100)}%</span>
                                            </div>
                                        </td>

                                        {/* VALIDATION COL */}
                                        <td className="p-4 align-top pt-5">
                                            <div className="flex flex-col items-center gap-3">
                                                
                                                {/* LEDGER VALIDATION */}
                                                <div className="flex flex-col items-center gap-1 w-full max-w-35">
                                                    <div className="flex items-center justify-center gap-2 bg-slate-100 p-1 rounded-lg w-full">
                                                        <button 
                                                            onClick={() => handleMarkStatus(row.id, 'CORRECT')}
                                                            className={`flex-1 flex justify-center p-1 rounded-md transition ${row.status === 'CORRECT' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-emerald-600'}`}
                                                            title="Mark Ledger Correct"
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleMarkStatus(row.id, 'INCORRECT')}
                                                            className={`flex-1 flex justify-center p-1 rounded-md transition ${row.status === 'INCORRECT' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-rose-600'}`}
                                                            title="Mark Ledger Incorrect"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>

                                                    {row.status === 'INCORRECT' && (
                                                        <select
                                                            className="w-full text-[10px] border-rose-200 border bg-rose-50 rounded p-1 text-rose-800 outline-none focus:border-rose-400"
                                                            value={row.correctedLedger}
                                                            onChange={(e) => handleCorrectedLedgerChange(row.id, e.target.value)}
                                                        >
                                                            <option value="">-- Select Ledger --</option>
                                                            {availableLedgers.map(l => (
                                                                <option key={l} value={l}>{l}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>

                                                {/* TAG VALIDATION (User specifies what it SHOULD be) */}
                                                <div className="flex flex-col items-center gap-1 w-full border-t border-slate-100 pt-2">
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Expected Tags</span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleExpectedTagToggle(row.id, 'expectedCommission')}
                                                            className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border transition ${
                                                                row.expectedCommission 
                                                                ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                                                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            Comm
                                                        </button>
                                                        <button
                                                            onClick={() => handleExpectedTagToggle(row.id, 'expectedSales')}
                                                            className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border transition ${
                                                                row.expectedSales 
                                                                ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm' 
                                                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            Sales
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MatcherTestBench;