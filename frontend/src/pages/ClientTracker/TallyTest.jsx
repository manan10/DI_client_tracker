import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi'; // Adjusted for your project structure
import Navbar from '../../components/Navbar';

const TallyTest = () => {
    const { request, loading, error } = useApi();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const [ledgers, setLedgers] = useState([]);
    const [successMsg, setSuccessMsg] = useState("");

    // Calculate derived status to avoid ESLint "cascading render" warnings
    const getStatus = () => {
        if (loading) return { type: 'info', msg: 'Communicating with Tally PC...' };
        if (error) return { type: 'danger', msg: error };
        if (successMsg) return { type: 'success', msg: successMsg };
        return { type: 'info', msg: 'Ready to sync' };
    };

    const status = getStatus();

    // STEP 1: Fetch ALL companies found in the Tally folder
    const fetchCompanies = async () => {
        setSuccessMsg("");
        const xml = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Company On Disk</ID> 
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                </DESC>
            </BODY>
        </ENVELOPE>`;

        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            
            // Extract names and filter out system/migration folders
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const cleanList = [...new Set(matches)].filter(name => !name.includes('migrated-to'));
            
            setCompanies(cleanList);
            if (cleanList.length > 0) setSelectedCompany(cleanList[0]);
            setSuccessMsg(`Found ${cleanList.length} companies in Tally data folder.`);
        } catch {
            // Error handled by useApi hook
        }
    };

    // STEP 3: Fetch Ledgers (Only works if company is OPEN in Tally)
    const fetchLedgers = async () => {
        if (!selectedCompany || !isCompanyOpen) return;
        setSuccessMsg("");

        const xml = `
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
                        <SVCURRENTCOMPANY>${selectedCompany}</SVCURRENTCOMPANY>
                    </STATICVARIABLES>
                </DESC>
            </BODY>
        </ENVELOPE>`;

        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const uniqueLedgers = [...new Set(matches)];
            
            setLedgers(uniqueLedgers);
            setSuccessMsg(`Successfully synced ${uniqueLedgers.length} ledgers for ${selectedCompany}.`);
        } catch  {
            // Error handled by useApi hook
        }
    };

    const alertStyles = {
        info: "bg-blue-50 text-blue-700 border-blue-100",
        success: "bg-emerald-50 text-emerald-700 border-emerald-100",
        danger: "bg-red-50 text-red-700 border-red-100"
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
            <Navbar /> {/* Assuming you have a Navbar component */}
            <div className="max-w-6xl mx-auto space-y-8">
                
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Tally Hub</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage data sync for Dalal Investment Development</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${companies.length > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                        {companies.length > 0 ? 'BRIDGE CONNECTED' : 'AWAITING SCAN'}
                    </div>
                </header>

                {/* Workflow Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* STEP 1 */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                        <div className="flex-1">
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded mb-4">01</span>
                            <h3 className="text-lg font-bold mb-2">Scan PC</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">Connect to the Tally bridge to see all companies stored on the computer.</p>
                        </div>
                        <button 
                            onClick={fetchCompanies}
                            disabled={loading}
                            className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {loading && companies.length === 0 ? 'Scanning...' : 'Fetch All Companies'}
                        </button>
                    </div>

                    {/* STEP 2 */}
                    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-500 ${companies.length === 0 ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded mb-4">02</span>
                        <h3 className="text-lg font-bold mb-2">Select & Open</h3>
                        <p className="text-sm text-slate-400 mb-4">Select the firm you want to work on.</p>
                        
                        <select 
                            value={selectedCompany} 
                            onChange={(e) => {
                                setSelectedCompany(e.target.value);
                                setIsCompanyOpen(false);
                                setLedgers([]);
                            }}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {companies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <label className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer hover:bg-amber-100/50 transition-colors">
                            <input 
                                type="checkbox" 
                                className="mt-1 h-5 w-5 rounded-md border-amber-300 text-amber-600 focus:ring-amber-500"
                                checked={isCompanyOpen}
                                onChange={(e) => setIsCompanyOpen(e.target.checked)}
                            />
                            <span className="text-xs text-amber-900 font-bold leading-tight">
                                I have opened "{selectedCompany}" in the Tally application.
                            </span>
                        </label>
                    </div>

                    {/* STEP 3 */}
                    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-500 ${!isCompanyOpen ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex-1">
                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded mb-4">03</span>
                            <h3 className="text-lg font-bold mb-2">Sync Ledgers</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-6">Pull the latest chart of accounts from the active Tally company.</p>
                        </div>
                        <button 
                            onClick={fetchLedgers}
                            disabled={loading || !isCompanyOpen}
                            className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:shadow-none"
                        >
                            {loading && isCompanyOpen ? 'Syncing...' : 'Fetch Ledger List'}
                        </button>
                    </div>
                </div>

                {/* Global Status Alert */}
                <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${alertStyles[status.type]}`}>
                    <div className={`w-2 h-2 rounded-full ${status.type === 'danger' ? 'bg-red-500' : status.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></div>
                    <p className="text-sm font-bold">{status.msg}</p>
                </div>

                {/* Results Table */}
                {ledgers.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Master Ledgers</h2>
                            <span className="text-xs font-bold text-slate-500">{ledgers.length} Records found</span>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b border-slate-50">
                                        <th className="px-8 py-4 w-20">No.</th>
                                        <th className="px-8 py-4">Account Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {ledgers.map((l, i) => (
                                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-4 text-xs font-mono text-slate-300">{i + 1}</td>
                                            <td className="px-8 py-4 text-sm font-bold text-slate-700">{l}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TallyTest;