// src/pages/TallyTest.jsx

import React, { useState, useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates';
import Navbar from '../../components/Navbar';
import { 
    Activity, CheckCircle2, RefreshCw, SendHorizontal, 
    Database, Search, Copy, Check 
} from 'lucide-react';

const TallyTest = () => {
    const { request, loading } = useApi();
    
    // Core Bridge State
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const [ledgers, setLedgers] = useState([]); 
    
    // Technical Inspection State
    const [activityLog, setActivityLog] = useState([]);
    const [manualXml, setManualXml] = useState(""); 
    const [isUserEditing, setIsUserEditing] = useState(false); 
    const [lastResponse, setLastResponse] = useState("");
    const [viewMode, setViewMode] = useState('request'); 
    const [copiedSection, setCopiedSection] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Entry Data (Updated to include new billing fields)
    const [voucherType, setVoucherType] = useState("Sales");
    const [voucherData, setVoucherData] = useState({
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: "10", 
        ledgerName: "",    
        bankAccount: "",   
        incomeLedger: "MF COMMISION INCOME",  
        amount: "",
        gstType: "NONE", // NONE, LOCAL, INTERSTATE
        cgstLedger: "CGST",
        sgstLedger: "SGST",
        igstLedger: "IGST",
        cgstAmount: "",
        sgstAmount: "",
        igstAmount: "",
        narration: "Commission Entry via Bridge",
        // New Tax & Address Fields
        partyState: "",
        partyCountry: "India",
        partyGstRegType: "",
        partyGstin: "",
        partyAddress: []
    });

    const generatedXml = useMemo(() => {
        if (!selectedCompany) return "";
        return tallyTemplates.generateVoucher({
            company: selectedCompany,
            type: voucherType,
            ...voucherData
        });
    }, [voucherData, voucherType, selectedCompany]);

    const displayXml = isUserEditing ? manualXml : generatedXml;

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

    const copyToClipboard = (text, section) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const fetchCompanies = async () => {
        const xml = tallyTemplates.getCompanies();
        logActivity("Scanning for Tally instances...", "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
            setCompanies(filtered);
            if (filtered.length > 0) setSelectedCompany(filtered[0]);
            logActivity(`Success: Found ${filtered.length} firms.`, "success");
        } catch {
            logActivity(`Bridge Failed. Is Tally running?`, "error");
        }
    };

    // Upgraded fetchLedgers to grab the advanced GST details for testing
    const fetchLedgers = async () => {
        const xml = tallyTemplates.getLedgers(selectedCompany);
        logActivity(`Pulling masters for ${selectedCompany}...`, "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            
            const ledgerMatches = [...responseData.matchAll(/<LEDGER NAME="([^"]*)"[^>]*>([\s\S]*?)<\/LEDGER>/g)];
            
            const mapped = ledgerMatches.map(m => {
                const name = tallyTemplates.unescapeXml(m[1]);
                const block = m[2];
                
                const parentMatch = block.match(/<PARENT[^>]*>(.*?)<\/PARENT>/i);
                const stateMatch = block.match(/<(?:LED)?STATENAME[^>]*>(.*?)<\/(?:LED)?STATENAME>/i);
                const gstinMatch = block.match(/<PARTYGSTIN[^>]*>(.*?)<\/PARTYGSTIN>/i);
                const countryMatch = block.match(/<COUNTRY(?:NAME|OFRESIDENCE)[^>]*>(.*?)<\/COUNTRY(?:NAME|OFRESIDENCE)>/i);
                const addressMatches = [...block.matchAll(/<ADDRESS[^>]*>(.*?)<\/ADDRESS>/gi)];
                const addressList = addressMatches.map(a => tallyTemplates.unescapeXml(a[1]));

                return { 
                    name: name, 
                    parent: parentMatch ? tallyTemplates.unescapeXml(parentMatch[1]) : '',
                    stateName: stateMatch ? tallyTemplates.unescapeXml(stateMatch[1]) : '',
                    country: countryMatch ? tallyTemplates.unescapeXml(countryMatch[1]) : 'India',
                    gstin: gstinMatch ? tallyTemplates.unescapeXml(gstinMatch[1]) : '',
                    address: addressList
                };
            });

            setLedgers(mapped);
            logActivity(`Sync Complete: ${mapped.length} accounts mapped.`, "success");
        } catch (err) {
            logActivity(`Sync Error: ${err.message}`, "error");
        }
    };

    const postVoucher = async () => {
        logActivity(`Committing ${voucherType} to books...`, "process");
        try {
            const responseData = await request("/tally/proxy", "POST", { xml: displayXml });
            setLastResponse(responseData);
            if (responseData.includes("<CREATED>1</CREATED>") || responseData.includes("CREATED: 1")) {
                logActivity(`Voucher Posted Successfully!`, "success");
                setIsUserEditing(false); 
                setManualXml("");
            } else {
                logActivity("Tally rejected the entry.", "error");
            }
            setViewMode('response');
        } catch (err) {
            logActivity(`Transmission Error: ${err.message}`, "error");
        }
    };

    const handleFormChange = (updates) => {
        setVoucherData(prev => ({ ...prev, ...updates }));
        setIsUserEditing(false); 
    };

    // Auto-map Ledger Details when a Ledger is selected
    const handleLedgerSelect = (selectedName) => {
        const ledgerObj = ledgers.find(l => l.name === selectedName);
        handleFormChange({ 
            ledgerName: selectedName,
            partyState: ledgerObj?.stateName || "",
            partyCountry: ledgerObj?.country || "India",
            partyGstin: ledgerObj?.gstin || "",
            partyGstRegType: ledgerObj?.gstin ? "Regular" : "Unregistered",
            partyAddress: ledgerObj?.address || []
        });
    };

    const handleAmountChange = (val, currentGstType = voucherData.gstType) => {
        const base = parseFloat(val) || 0;
        if (currentGstType === 'LOCAL') {
            const tax = (base * 0.09).toFixed(2);
            handleFormChange({ amount: val, cgstAmount: tax, sgstAmount: tax, igstAmount: "" });
        } else if (currentGstType === 'INTERSTATE') {
            const tax = (base * 0.18).toFixed(2);
            handleFormChange({ amount: val, igstAmount: tax, cgstAmount: "", sgstAmount: "" });
        } else {
            handleFormChange({ amount: val, cgstAmount: "", sgstAmount: "", igstAmount: "" });
        }
    };

    const handleGstTypeChange = (type) => {
        handleFormChange({ gstType: type });
        handleAmountChange(voucherData.amount, type); 
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-700">
            <Navbar />
            <div className="max-w-400 mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)]">
                
                <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">01. Bridge Setup</h2>
                            <button onClick={fetchCompanies} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all">
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Scan PC
                            </button>
                        </div>
                        <div className={`space-y-4 ${companies.length === 0 ? 'opacity-30' : ''}`}>
                            <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-none">
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="flex gap-3">
                                <button onClick={() => setIsCompanyOpen(!isCompanyOpen)} className={`flex-1 flex items-center justify-center gap-3 p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${isCompanyOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                                    {isCompanyOpen ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-200" />} Company Active
                                </button>
                                <button onClick={fetchLedgers} disabled={!isCompanyOpen} className="flex-1 bg-slate-900 text-white p-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                                    <Database className="w-4 h-4"/> Sync Masters
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm p-6 transition-all ${ledgers.length === 0 ? 'opacity-20 pointer-events-none' : ''}`}>
                        <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6">02. New Entry</h2>
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            {['Receipt', 'Payment', 'Sales'].map(t => (
                                <button key={t} onClick={() => { setVoucherType(t); setIsUserEditing(false); }} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${voucherType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
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
                                <select className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none" value={voucherData.ledgerName} onChange={e => handleLedgerSelect(e.target.value)}>
                                    <option value="">{voucherType === 'Sales' ? '-- Choose Party (Debtor) --' : '-- Choose Account --'}</option>
                                    {Object.entries(filteredGroupedLedgers).map(([group, names]) => (
                                        <optgroup key={group} label={group.toUpperCase()}>
                                            {names.map(n => <option key={n} value={n}>{n}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {voucherType === 'Sales' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="Invoice No. (Ref)" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none" value={voucherData.invoiceNumber} onChange={e => handleFormChange({ invoiceNumber: e.target.value })} />
                                        <input type="date" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none" value={voucherData.date} onChange={e => handleFormChange({ date: e.target.value })} />
                                    </div>
                                    <select className="w-full bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-xs font-bold text-indigo-700 outline-none" value={voucherData.incomeLedger} onChange={e => handleFormChange({ incomeLedger: e.target.value })}>
                                        <option value="">-- Choose Sales/Income Ledger --</option>
                                        <option value="MF COMMISION INCOME">MF COMMISION INCOME</option>
                                        <option value="MF COMMISION (IGST)">MF COMMISION (IGST)</option>
                                        <option value="MF COMMISSION (LOC)">MF COMMISSION (LOC)</option>
                                        {ledgers.filter(l => l.parent.toLowerCase().includes("income") || l.parent.toLowerCase().includes("sales")).map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                                    </select>
                                    
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                                        <div className="flex gap-4">
                                            <select className="bg-white border border-slate-200 p-2 rounded-lg text-xs font-bold outline-none w-1/3" value={voucherData.gstType} onChange={e => handleGstTypeChange(e.target.value)}>
                                                <option value="NONE">Non-GST ARN</option>
                                                <option value="LOCAL">GST ARN (Local 9%+9%)</option>
                                                <option value="INTERSTATE">GST ARN (Interstate 18%)</option>
                                            </select>
                                            <input type="number" placeholder="Base Commission Amt" className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-sm font-black text-indigo-600 outline-none" value={voucherData.amount} onChange={e => handleAmountChange(e.target.value)} />
                                        </div>

                                        {voucherData.gstType === 'LOCAL' && (
                                            <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-200">
                                                <div className="space-y-1">
                                                    <input type="text" className="w-full bg-transparent text-[10px] font-bold text-slate-400 outline-none" value={voucherData.cgstLedger} onChange={e => handleFormChange({ cgstLedger: e.target.value })} />
                                                    <input type="number" readOnly className="w-full bg-slate-100 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-not-allowed" value={voucherData.cgstAmount} placeholder="Auto-calculated" />
                                                </div>
                                                <div className="space-y-1">
                                                    <input type="text" className="w-full bg-transparent text-[10px] font-bold text-slate-400 outline-none" value={voucherData.sgstLedger} onChange={e => handleFormChange({ sgstLedger: e.target.value })} />
                                                    <input type="number" readOnly className="w-full bg-slate-100 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-not-allowed" value={voucherData.sgstAmount} placeholder="Auto-calculated" />
                                                </div>
                                            </div>
                                        )}

                                        {voucherData.gstType === 'INTERSTATE' && (
                                            <div className="animate-in fade-in zoom-in duration-200 space-y-1">
                                                <input type="text" className="w-full bg-transparent text-[10px] font-bold text-slate-400 outline-none" value={voucherData.igstLedger} onChange={e => handleFormChange({ igstLedger: e.target.value })} />
                                                <input type="number" readOnly className="w-full bg-slate-100 border border-slate-200 p-2 rounded-lg text-xs font-bold text-slate-600 outline-none cursor-not-allowed" value={voucherData.igstAmount} placeholder="Auto-calculated" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <select className="w-full bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-xs font-bold text-indigo-700 outline-none" value={voucherData.bankAccount} onChange={e => handleFormChange({ bankAccount: e.target.value })}>
                                            <option value="">-- Choose Bank --</option>
                                            {ledgers.filter(l => l.parent.includes("Bank") || l.parent.includes("Cash")).map(l => <option key={l.name} value={l.name}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <input type="number" placeholder="Amount" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-black text-indigo-600 outline-none" value={voucherData.amount} onChange={e => handleFormChange({ amount: e.target.value })} />
                                    <input type="date" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-bold outline-none" value={voucherData.date} onChange={e => handleFormChange({ date: e.target.value })} />
                                </div>
                            )}
                            
                            <textarea rows="2" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs font-medium outline-none" placeholder="Narration..." value={voucherData.narration} onChange={e => handleFormChange({ narration: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6 h-full overflow-hidden">
                    <div className="bg-white border border-slate-200 rounded-4xl shadow-xl flex flex-col overflow-hidden h-3/5 relative">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <div className="flex gap-6">
                                <button onClick={() => setViewMode('request')} className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-all ${viewMode === 'request' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Request XML</button>
                                <button onClick={() => setViewMode('response')} className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-all ${viewMode === 'response' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>Response Feedback</button>
                            </div>
                            <div className="flex items-center gap-3">
                                {isUserEditing && (
                                    <button onClick={() => setIsUserEditing(false)} className="text-[9px] font-bold text-red-500 hover:underline">Discard Edits</button>
                                )}
                                <button onClick={() => copyToClipboard(viewMode === 'request' ? displayXml : lastResponse, 'data')} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200 group">
                                    {copiedSection === 'data' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />}
                                    <span className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 uppercase">Copy</span>
                                </button>
                                <button onClick={postVoucher} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all">
                                    <SendHorizontal className="w-3 h-3"/> Commit to Tally
                                </button>
                            </div>
                        </div>
                        <textarea 
                            className={`flex-1 p-8 font-mono text-[10px] outline-none resize-none custom-scrollbar leading-relaxed ${isUserEditing ? 'text-indigo-600 bg-indigo-50/20' : 'text-blue-600 bg-transparent'}`}
                            value={viewMode === 'request' ? displayXml : lastResponse || "// Feedback will appear here..."}
                            onChange={(e) => {
                                if (viewMode === 'request') {
                                    setManualXml(e.target.value);
                                    setIsUserEditing(true); 
                                }
                            }}
                        />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-4xl shadow-sm flex flex-col overflow-hidden h-2/5 relative">
                        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-indigo-500"/> Connection Activity</span>
                            <button onClick={() => copyToClipboard(activityLog.map(l => `[${l.time}] ${l.msg}`).join('\n'), 'feed')} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors group">
                                {copiedSection === 'feed' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />}
                            </button>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto space-y-3">
                            {activityLog.map((log, i) => (
                                <div key={i} className="flex gap-4 animate-in slide-in-from-left duration-300">
                                    <span className="text-[9px] font-bold text-slate-300 mt-0.5 whitespace-nowrap">{log.time}</span>
                                    <span className={`text-xs font-semibold ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-emerald-600' : 'text-slate-600'}`}>{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TallyTest;