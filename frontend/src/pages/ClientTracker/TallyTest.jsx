import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates';
import Navbar from '../../components/Navbar';
import { 
    Activity, CheckCircle2, RefreshCw, 
    SendHorizontal, Library, LayoutDashboard, 
    Database, Terminal, Edit3, Search
} from 'lucide-react';

const TallyTest = () => {
    // FIXED: Removed unused apiError variable
    const { request, loading } = useApi();
    
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const [ledgers, setLedgers] = useState([]); 
    
    const [activityLog, setActivityLog] = useState([]);
    const [manualXml, setManualXml] = useState(""); 
    const [lastResponse, setLastResponse] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [voucherType, setVoucherType] = useState("Receipt");
    const [voucherData, setVoucherData] = useState({
        date: new Date().toISOString().split('T')[0],
        ledgerName: "",
        bankAccount: "",
        amount: "",
        narration: "Sync via MFD Portal"
    });

    // FIXED: Computed XML directly instead of using useEffect to avoid cascading renders
    const generatedXml = useMemo(() => {
        if (!selectedCompany) return "";
        return tallyTemplates.generateVoucher({
            company: selectedCompany,
            type: voucherType,
            ...voucherData
        });
    }, [voucherData, voucherType, selectedCompany]);

    // Use manualXml if the user has edited it, otherwise use the auto-generated one
    const activeXml = manualXml || generatedXml;

    const filteredGroupedLedgers = useMemo(() => {
        const filtered = ledgers.filter(l => 
            l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.parent.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.reduce((acc, ledger) => {
            if (!acc[ledger.parent]) acc[ledger.parent] = [];
            acc[ledger.parent].push(ledger.name);
            return acc;
        }, {});
    }, [ledgers, searchTerm]);

    const logActivity = (msg, type = 'info') => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setActivityLog(prev => [{ time, msg, type }, ...prev].slice(0, 30));
    };

    const fetchCompanies = async () => {
        const xml = tallyTemplates.getCompanies();
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
            setCompanies(filtered);
            if (filtered.length > 0) setSelectedCompany(filtered[0]);
            logActivity(`Success: Connected to Tally PC.`, "success");
        } catch {
            logActivity(`Bridge Connection Failed.`, "error");
        }
    };

    const fetchLedgers = async () => {
        const xml = tallyTemplates.getLedgers(selectedCompany);
        logActivity(`Pulling master data for ${selectedCompany}...`, "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            const ledgerRegex = /<LEDGER NAME="([^"]*)"[^>]*>[\s\S]*?<PARENT[^>]*>(.*?)<\/PARENT>/g;
            const matches = [...responseData.matchAll(ledgerRegex)];
            const mapped = matches.map(m => ({ name: m[1], parent: m[2] }));
            setLedgers(mapped);
            logActivity(`Categorized ${mapped.length} accounts.`, "success");
        } catch (err) {
            logActivity(`Sync Error: ${err.message}`, "error");
        }
    };

    const postVoucher = async () => {
        logActivity(`Committing XML to ${selectedCompany}...`, "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml: activeXml });
            setLastResponse(responseData);
            if (responseData.includes("<CREATED>1</CREATED>") || responseData.includes("CREATED: 1")) {
                logActivity(`Voucher Posted Successfully!`, "success");
                setManualXml(""); // Reset manual edits on success
            } else {
                logActivity("Transaction rejected. Review Tally Response.", "error");
            }
        } catch (err) {
            logActivity(`Network Error: ${err.message}`, "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <Navbar />
            {/* FIXED: Applied canonical max-w class */}
            <div className="max-w-400 mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)]">
                
                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">01. Environment</h2>
                            <button onClick={fetchCompanies} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2">
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Scan PC
                            </button>
                        </div>
                        <div className={`space-y-4 ${companies.length === 0 ? 'opacity-30' : ''}`}>
                            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold">
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="flex gap-3">
                                <button onClick={() => setIsCompanyOpen(!isCompanyOpen)} className={`flex-1 p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${isCompanyOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                                    {isCompanyOpen ? 'Company Active' : 'Confirm Active State'}
                                </button>
                                <button onClick={fetchLedgers} disabled={!isCompanyOpen} className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                                    <Database className="w-4 h-4"/> Sync Masters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm p-6 transition-all ${ledgers.length === 0 ? 'opacity-20 pointer-events-none' : ''}`}>
                        <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">02. Entry Helper</h2>
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            {['Receipt', 'Payment', 'Sales'].map(t => (
                                <button key={t} onClick={() => setVoucherType(t)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${voucherType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-300" />
                                    <input 
                                        type="text" 
                                        placeholder="Search ledger..."
                                        className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-xs font-bold outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none" 
                                    value={voucherData.ledgerName} 
                                    onChange={e => setVoucherData({...voucherData, ledgerName: e.target.value})}
                                >
                                    <option value="">-- Choose Account --</option>
                                    {Object.entries(filteredGroupedLedgers).map(([group, names]) => (
                                        <optgroup key={group} label={group.toUpperCase()}>
                                            {names.map(n => <option key={n} value={n}>{n}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <select className="w-full bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-xs font-bold text-indigo-700" value={voucherData.bankAccount} onChange={e => setVoucherData({...voucherData, bankAccount: e.target.value})}>
                                        <option value="">-- Choose Bank --</option>
                                        {ledgers.filter(l => l.parent.includes("Bank") || l.parent.includes("Cash")).map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                                    </select>
                                </div>
                                <input type="number" placeholder="Amount" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-black text-indigo-600" value={voucherData.amount} onChange={e => setVoucherData({...voucherData, amount: e.target.value})} />
                                <input type="date" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none" value={voucherData.date} onChange={e => setVoucherData({...voucherData, date: e.target.value})} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden h-3/5 relative">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Edit3 className="w-3 h-3 text-blue-500"/> Payload Editor</span>
                            <button onClick={postVoucher} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                                <SendHorizontal className="w-3 h-3"/> Commit To Tally
                            </button>
                        </div>
                        <textarea 
                            className="flex-1 p-8 font-mono text-[10px] text-blue-600 bg-transparent outline-none resize-none custom-scrollbar"
                            value={activeXml}
                            onChange={(e) => setManualXml(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6 h-2/5">
                        {/* FIXED: Applied canonical rounded-4xl class */}
                        <div className="bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono">Activity Log</span>
                            </div>
                            <div className="flex-1 p-5 overflow-y-auto space-y-2 font-mono text-[9px]">
                                {activityLog.map((log, i) => (
                                    <div key={i} className={log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-emerald-600' : 'text-slate-400'}>
                                        [{log.time}] {log.msg}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FIXED: Applied canonical rounded-4xl class */}
                        <div className="bg-slate-900 border border-slate-800 rounded-4xl shadow-2xl flex flex-col overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/30">
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 font-mono">Tally Response</span>
                            </div>
                            <div className="flex-1 p-5 overflow-auto font-mono text-[9px] text-emerald-500/80 custom-scrollbar">
                                {lastResponse || "// Awaiting transmission..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TallyTest;