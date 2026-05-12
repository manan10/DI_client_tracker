import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi'; // Ensure this path matches your project structure

const TallyTest = () => {
    const { request, loading, error } = useApi();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [ledgers, setLedgers] = useState([]);
    const [successMsg, setSuccessMsg] = useState("");

    /**
     * DERIVED STATE
     * We calculate the UI status based on existing variables 
     * instead of using useEffect to sync them.
     */
    const getStatus = () => {
        if (loading) return { type: 'info', msg: 'Communicating with Tally PC...' };
        if (error) return { type: 'danger', msg: error };
        if (successMsg) return { type: 'success', msg: successMsg };
        return { type: 'info', msg: 'Ready to test connection' };
    };

    const status = getStatus();

    const fetchCompanies = async () => {
        setSuccessMsg(""); 
        const xml = `
        <ENVELOPE>
            <HEADER><TALLYREQUEST>Export</TALLYREQUEST></HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES>
                    <TDL><TDLMESSAGE>
                        <COLLECTION NAME="List of Companies" ISMODIFY="No"><TYPE>Company</TYPE></COLLECTION>
                    </TDLMESSAGE></TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;

        try {
            const responseData = await request("/tally/proxy", "POST", { xml });
            
            // Extract company names using regex from raw XML string
            const matches = [...responseData.matchAll(/<NAME>(.*?)<\/NAME>/g)].map(m => m[1]);
            setCompanies(matches);
            if (matches.length > 0) setSelectedCompany(matches[0]);
            
            setSuccessMsg(`Connected! Found ${matches.length} companies.`);
        } catch {
            // Hook automatically handles error state and console logging
        }
    };

    const fetchLedgers = async () => {
        if (!selectedCompany) return;
        setSuccessMsg("");

        const xml = `
        <ENVELOPE>
            <HEADER>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>List of Ledgers</ID>
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
            const matches = [...responseData.matchAll(/<NAME>(.*?)<\/NAME>/g)].map(m => m[1]);
            setLedgers(matches);
            setSuccessMsg(`Fetched ${matches.length} ledgers from ${selectedCompany}.`);
        } catch {
            // Hook automatically handles error state
        }
    };

    const alertStyles = {
        info: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        danger: "bg-red-50 text-red-700 border-red-200"
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Tally API Gateway</h1>
                    <p className="text-slate-500 text-sm">Automated Bridge Test</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-semibold text-slate-600">
                    <div className={`w-2 h-2 rounded-full ${companies.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    {companies.length > 0 ? 'TUNNEL ACTIVE' : 'DISCONNECTED'}
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`p-4 border rounded-xl shadow-sm transition-all duration-300 ${alertStyles[status.type]}`}>
                        <p className="text-sm font-semibold">{status.msg}</p>
                    </div>

                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Connection Control</h2>
                        
                        <button 
                            onClick={fetchCompanies}
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading && !selectedCompany ? 'Scanning...' : 'Scan Tally Companies'}
                        </button>

                        {companies.length > 0 && (
                            <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Select Active Company</label>
                                    <select 
                                        value={selectedCompany} 
                                        onChange={(e) => setSelectedCompany(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-slate-200 outline-none transition-all text-sm"
                                    >
                                        {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button 
                                    onClick={fetchLedgers}
                                    disabled={loading}
                                    className="w-full border-2 border-slate-900 text-slate-900 py-2.5 rounded-xl font-bold hover:bg-slate-900 hover:text-white active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {loading && selectedCompany ? 'Syncing...' : 'Fetch Ledgers'}
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Ledger Data View */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="font-bold text-slate-800">Ledger Master List</h3>
                            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                {ledgers.length} Accounts
                            </span>
                        </div>
                        
                        <div className="overflow-y-auto flex-1">
                            {ledgers.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.1em] sticky top-0 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 font-bold border-b border-slate-100">Index</th>
                                            <th className="px-6 py-4 font-bold border-b border-slate-100">Account Name</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {ledgers.map((l, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-4 text-slate-400 text-xs font-mono">{String(i + 1).padStart(3, '0')}</td>
                                                <td className="px-6 py-4 font-medium text-slate-700 group-hover:text-slate-900">{l}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <div className="w-8 h-8 border-2 border-dashed border-slate-300 rounded-full"></div>
                                    </div>
                                    <h4 className="text-slate-900 font-bold mb-1">No Data Sync</h4>
                                    <p className="text-slate-400 text-xs max-w-[200px]">Perform a Tally Scan to verify your automated bridge connection.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TallyTest;