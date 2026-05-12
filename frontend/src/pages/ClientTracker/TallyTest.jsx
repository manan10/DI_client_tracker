import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates';
import Navbar from '../../components/Navbar';
import { 
    Activity, CheckCircle2, RefreshCw, FileCode2, 
    SendHorizontal, AlertCircle, Library, LayoutDashboard, 
    Copy, Check, Database, Landmark 
} from 'lucide-react';

const TallyTest = () => {
    const { request, loading, error: apiError } = useApi();
    
    // Core State
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const [ledgers, setLedgers] = useState([]); // Array of {name, parent}
    
    // UI State
    const [activityLog, setActivityLog] = useState([]);
    const [lastRequest, setLastRequest] = useState("");
    const [lastResponse, setLastResponse] = useState("");
    const [viewMode, setViewMode] = useState('request');
    const [copiedSection, setCopiedSection] = useState(null);

    // Voucher State
    const [voucherType, setVoucherType] = useState("Receipt");
    const [voucherData, setVoucherData] = useState({
        date: new Date().toISOString().split('T')[0],
        ledgerName: "",
        bankAccount: "",
        amount: "",
        narration: "Sync via MFD Portal"
    });

    const logActivity = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setActivityLog(prev => [{ time, msg, type }, ...prev].slice(0, 30));
    };

    const copyToClipboard = (text, section) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const fetchCompanies = async () => {
        const xml = tallyTemplates.getCompanies();
        setLastRequest(xml);
        logActivity("Scanning for local Tally instances...", "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            setLastResponse(responseData);
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const cleanList = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
            setCompanies(cleanList);
            if (cleanList.length > 0) setSelectedCompany(cleanList[0]);
            logActivity(`Success: Found ${cleanList.length} companies.`, "success");
        } catch (err) {
            logActivity(`Connection Failed. Check Bridge/Ngrok.`, "error");
        }
    };

    const fetchLedgers = async () => {
        if (!selectedCompany || !isCompanyOpen) return;
        const xml = tallyTemplates.getLedgers(selectedCompany);
        setLastRequest(xml);
        logActivity(`Categorizing accounts for ${selectedCompany}...`, "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            setLastResponse(responseData);
            
            // Regex to parse Name from attribute and Parent from child tag
            const ledgerRegex = /<LEDGER NAME="(.*?)".*?>[\s\S]*?<PARENT>(.*?)<\/PARENT>/g;
            const matches = [...responseData.matchAll(ledgerRegex)];
            const mapped = matches.map(m => ({ name: m[1], parent: m[2] }));
            
            setLedgers(mapped);
            logActivity(`Sync Complete: ${mapped.length} accounts classified.`, "success");
        } catch (err) {
            logActivity(`Sync Error: ${err.message}`, "error");
        }
    };

    const postVoucher = async () => {
        logActivity(`Committing ${voucherType} to Tally...`, "process");
        const xml = tallyTemplates.generateVoucher({
            company: selectedCompany,
            type: voucherType,
            ...voucherData
        });
        setLastRequest(xml);
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            setLastResponse(responseData);
            if (responseData.includes("<CREATED>1</CREATED>") || responseData.includes("CREATED: 1")) {
                logActivity(`Voucher Created Successfully!`, "success");
                setVoucherData(prev => ({ ...prev, amount: "" }));
            } else {
                logActivity("Tally rejected the entry. Check Raw Response.", "error");
            }
        } catch (err) {
            logActivity(`Critical Error: ${err.message}`, "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <Navbar />
            <div className="max-w-[1500px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)]">
                
                {/* LEFT: WORKFLOW */}
                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-1 mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <LayoutDashboard className="w-6 h-6 text-indigo-600" /> Tally Hub
                        </h1>
                        <p className="text-slate-400 text-sm italic">{selectedCompany || 'Awaiting Connection...'}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Step 1: Bridge Setup</h2>
                            <button onClick={fetchCompanies} disabled={loading} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Scan PC
                            </button>
                        </div>
                        <div className={`space-y-4 ${companies.length === 0 ? 'opacity-30' : ''}`}>
                            <select value={selectedCompany} onChange={(e) => { setSelectedCompany(e.target.value); setIsCompanyOpen(false); setLedgers([]); }} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none">
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="flex gap-3">
                                <button onClick={() => setIsCompanyOpen(!isCompanyOpen)} className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${isCompanyOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                    {isCompanyOpen ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />} Open in Tally
                                </button>
                                <button onClick={fetchLedgers} disabled={!isCompanyOpen || loading} className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 disabled:opacity-20">
                                    <Database className="w-4 h-4"/> Sync Masters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm p-6 transition-all ${ledgers.length === 0 ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
                        <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">Step 2: Post Voucher</h2>
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            {['Receipt', 'Payment', 'Sales'].map(t => (
                                <button key={t} onClick={() => setVoucherType(t)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${voucherType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Target Account</label>
                                <select className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none" value={voucherData.ledgerName} onChange={e => setVoucherData({...voucherData, ledgerName: e.target.value})}>
                                    <option value="">-- Search Accounts --</option>
                                    {ledgers.map(l => <option key={l.name} value={l.name}>{l.name} ({l.parent})</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Bank / Cash Account (Filtered)</label>
                                <select className="w-full bg-indigo-50/30 border border-indigo-100 p-3 rounded-xl text-xs font-bold text-indigo-700 outline-none" value={voucherData.bankAccount} onChange={e => setVoucherData({...voucherData, bankAccount: e.target.value})}>
                                    <option value="">-- Select Verified Bank --</option>
                                    {ledgers.filter(l => l.parent.includes("Bank") || l.parent.includes("Cash")).map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase block">Amount</label>
                                <input type="number" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-black text-indigo-600" value={voucherData.amount} onChange={e => setVoucherData({...voucherData, amount: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase block">VCH Date</label>
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold" value={voucherData.date} onChange={e => setVoucherData({...voucherData, date: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <textarea rows="2" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-medium mt-2" placeholder="Narration..." value={voucherData.narration} onChange={e => setVoucherData({...voucherData, narration: e.target.value})} />
                            </div>
                        </div>
                        <button onClick={postVoucher} disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs tracking-widest shadow-lg mt-6 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                            <SendHorizontal className="w-4 h-4"/> POST {voucherType.toUpperCase()}
                        </button>
                    </div>
                </div>

                {/* RIGHT: DIAGNOSTICS */}
                <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-1/3">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Activity className="w-3 h-3 text-indigo-500"/> Activity Log</span>
                            <button onClick={() => copyToClipboard(activityLog.map(l => `[${l.time}] ${l.msg}`).join('\n'), 'feed')} className="p-1 hover:bg-slate-100 rounded">
                                {copiedSection === 'feed' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                            </button>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto space-y-2 font-mono">
                            {activityLog.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-in fade-in duration-300">
                                    <span className="text-[8px] font-bold text-slate-300 mt-1">{log.time}</span>
                                    <span className={`text-[10px] font-bold ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-emerald-600' : 'text-slate-500'}`}>{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-2/3">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex gap-4">
                                <button onClick={() => setViewMode('request')} className={`text-[9px] font-black uppercase tracking-widest pb-1 transition-all ${viewMode === 'request' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Request XML</button>
                                <button onClick={() => setViewMode('response')} className={`text-[9px] font-black uppercase tracking-widest pb-1 transition-all ${viewMode === 'response' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Response XML</button>
                            </div>
                            <button onClick={() => copyToClipboard(viewMode === 'request' ? lastRequest : lastResponse, 'data')} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 group">
                                {copiedSection === 'data' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                <span className="text-[8px] font-black text-slate-400 uppercase">Copy</span>
                            </button>
                        </div>
                        <div className="flex-1 p-6 bg-slate-50/50 font-mono text-[10px] text-slate-400 overflow-auto whitespace-pre custom-scrollbar">
                            {viewMode === 'request' ? lastRequest || "// Outgoing data..." : lastResponse || "// Inbound feedback..."}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TallyTest;