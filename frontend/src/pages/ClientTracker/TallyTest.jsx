import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates';
import Navbar from '../../components/Navbar';
import { 
    Activity, 
    CheckCircle2, 
    RefreshCw, 
    Search, 
    FileCode2, 
    SendHorizontal, 
    AlertCircle, 
    ArrowRight,
    Library,
    LayoutDashboard
} from 'lucide-react';

const TallyTest = () => {
    const { request, loading, error: apiError } = useApi();
    
    // Core State
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const [ledgers, setLedgers] = useState([]);
    
    // Logic/Visibility State
    const [activityLog, setActivityLog] = useState([]);
    const [lastRequest, setLastRequest] = useState("");
    const [lastResponse, setLastResponse] = useState("");
    const [viewMode, setViewMode] = useState('request'); // request | response

    // Voucher State
    const [voucherType, setVoucherType] = useState("Receipt");
    const [voucherData, setVoucherData] = useState({
        date: new Date().toISOString().split('T')[0],
        ledgerName: "",
        bankAccount: "",
        amount: "",
        narration: "Automated entry via MFD Portal"
    });

    const logActivity = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setActivityLog(prev => [{ time, msg, type }, ...prev].slice(0, 30));
    };

    // --- Actions ---

    const fetchCompanies = async () => {
        const xml = tallyTemplates.getCompanies();
        setLastRequest(xml);
        logActivity("Scanning local network for Tally instances...", "process");
        
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            setLastResponse(responseData);
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const cleanList = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
            
            setCompanies(cleanList);
            if (cleanList.length > 0) setSelectedCompany(cleanList[0]);
            logActivity(`Success: Found ${cleanList.length} companies ready for sync.`, "success");
        } catch (err) {
            setLastResponse(err.message || "Connection timed out");
            logActivity(`Connection Failed: Ensure the Tally Bridge is running on the PC.`, "error");
        }
    };

    const fetchLedgers = async () => {
        if (!selectedCompany || !isCompanyOpen) {
            logActivity("Action Required: Please confirm the company is open in Tally first.", "error");
            return;
        }
        const xml = tallyTemplates.getLedgers(selectedCompany);
        setLastRequest(xml);
        logActivity(`Updating ledger list for ${selectedCompany}...`, "process");

        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            setLastResponse(responseData);
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            setLedgers([...new Set(matches)]);
            logActivity(`Sync Complete: ${matches.length} accounts imported.`, "success");
        } catch (err) {
            setLastResponse(err.message);
            logActivity(`Sync Error: ${err.message}`, "error");
        }
    };

    const postVoucher = async () => {
        logActivity(`Validating and sending ${voucherType} entry...`, "process");
        const xml = tallyTemplates.generateVoucher({
            company: selectedCompany,
            type: voucherType,
            ...voucherData
        });
        setLastRequest(xml);

        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            setLastResponse(responseData);
            if (responseData.includes("CREATED: 1") || responseData.includes("<CREATED>1</CREATED>")) {
                logActivity(`${voucherType} successfully posted to Tally!`, "success");
                setVoucherData(prev => ({ ...prev, amount: "" }));
            } else {
                logActivity("Tally rejected the data. See Response Details for specifics.", "error");
            }
        } catch (err) {
            setLastResponse(err.message);
            logActivity(`Failed to post: ${err.message}`, "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <Navbar />
            
            <div className="max-w-[1500px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)]">
                
                {/* LEFT: WORKFLOW & ENTRY */}
                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                    
                    <div className="space-y-1 mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <LayoutDashboard className="w-6 h-6 text-indigo-600" /> Tally Sync Hub
                        </h1>
                        <p className="text-slate-400 text-sm">Direct bridge for Dalal Investment accounting</p>
                    </div>

                    {/* Step 1 & 2 Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Connection Setup</h2>
                            <button 
                                onClick={fetchCompanies} 
                                disabled={loading}
                                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                Scan for Companies
                            </button>
                        </div>

                        <div className={`space-y-4 transition-all ${companies.length === 0 ? 'opacity-30' : 'opacity-100'}`}>
                            <div className="grid grid-cols-1 gap-3">
                                <label className="text-xs font-semibold text-slate-500">Target Company</label>
                                <select 
                                    value={selectedCompany} 
                                    onChange={(e) => { setSelectedCompany(e.target.value); setIsCompanyOpen(false); setLedgers([]); }}
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/10"
                                >
                                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button 
                                    onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                                    className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all ${isCompanyOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                                >
                                    {isCompanyOpen ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                                    Company is Open
                                </button>

                                <button 
                                    onClick={fetchLedgers}
                                    disabled={!isCompanyOpen || loading}
                                    className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-20"
                                >
                                    <Library className="w-4 h-4"/> Sync Accounts
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* VOUCHER FORM CARD */}
                    <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm p-6 transition-all duration-500 ${ledgers.length === 0 ? 'opacity-20 grayscale pointer-events-none' : 'opacity-100'}`}>
                        <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest mb-6">New Transaction</h2>
                        
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            {['Receipt', 'Payment', 'Sales'].map(t => (
                                <button key={t} onClick={() => setVoucherType(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${voucherType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Party / Ledger Name</label>
                                <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400" value={voucherData.ledgerName} onChange={e => setVoucherData({...voucherData, ledgerName: e.target.value})}>
                                    <option value="">Choose an account...</option>
                                    {ledgers.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Bank / Contra Account</label>
                                <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-indigo-400" value={voucherData.bankAccount} onChange={e => setVoucherData({...voucherData, bankAccount: e.target.value})}>
                                    <option value="">Choose bank...</option>
                                    {ledgers.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Amount (₹)</label>
                                <input type="number" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold text-indigo-600 outline-none" placeholder="0.00" value={voucherData.amount} onChange={e => setVoucherData({...voucherData, amount: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Date</label>
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-semibold outline-none" value={voucherData.date} onChange={e => setVoucherData({...voucherData, date: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block ml-1">Reference Narration</label>
                                <textarea rows="2" className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-medium outline-none" value={voucherData.narration} onChange={e => setVoucherData({...voucherData, narration: e.target.value})} />
                            </div>
                        </div>

                        <button 
                            onClick={postVoucher}
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-100 mt-6 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            <SendHorizontal className="w-4 h-4"/>
                            {loading ? 'POSTING...' : `COMMIT ${voucherType.toUpperCase()}`}
                        </button>
                    </div>
                </div>

                {/* RIGHT: ACTIVITY & TECHNICAL DATA */}
                <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
                    
                    {/* LIVE ACTIVITY FEED */}
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-1/3">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-indigo-500"/> Activity Feed
                            </span>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto space-y-3">
                            {activityLog.length === 0 && <p className="text-slate-300 text-xs italic">Waiting for connection...</p>}
                            {activityLog.map((log, i) => (
                                <div key={i} className={`flex gap-4 animate-in slide-in-from-left duration-300`}>
                                    <span className="text-[10px] font-bold text-slate-300 mt-0.5">{log.time}</span>
                                    <span className={`text-xs font-semibold ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                        {log.msg}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TECHNICAL DATA INSPECTOR */}
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-2/3">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex gap-6">
                                <button 
                                    onClick={() => setViewMode('request')}
                                    className={`text-[10px] font-bold uppercase tracking-widest pb-1 transition-all ${viewMode === 'request' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Data Sent
                                </button>
                                <button 
                                    onClick={() => setViewMode('response')}
                                    className={`text-[10px] font-bold uppercase tracking-widest pb-1 transition-all ${viewMode === 'response' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Raw Response
                                </button>
                            </div>
                            <FileCode2 className="w-4 h-4 text-slate-300"/>
                        </div>
                        <div className="flex-1 p-6 bg-slate-50/50 font-mono text-[11px] text-slate-500 overflow-auto whitespace-pre custom-scrollbar">
                            {viewMode === 'request' ? (
                                lastRequest || "Waiting for outgoing data..."
                            ) : (
                                lastResponse || "Waiting for Tally response..."
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* ALERT OVERLAY */}
            {apiError && (
                <div className="fixed bottom-8 right-8 bg-white border-l-4 border-red-500 p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500">
                    <div className="bg-red-50 p-2 rounded-full text-red-500">
                        <AlertCircle className="w-6 h-6"/>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-900">Communication Error</p>
                        <p className="text-[10px] text-slate-500 max-w-xs">{apiError}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TallyTest;