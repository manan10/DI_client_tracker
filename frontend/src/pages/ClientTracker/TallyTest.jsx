import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';

const TallyTest = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [ledgers, setLedgers] = useState([]);
    const [status, setStatus] = useState({ type: 'info', msg: 'Ready to test connection' });
    const [loading, setLoading] = useState(false);

    // Points to your Cloud Backend Route we created earlier
    const BRIDGE_URL = "/api/tally/proxy"; 

    const fetchCompanies = async () => {
        setLoading(true);
        setStatus({ type: 'info', msg: 'Scanning Tally...' });
        const xml = `
        <ENVELOPE>
            <HEADER><TALLYREQUEST>Export</TALLYREQUEST></HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES>
                    <TDL><TDLMESSAGE>
                        <COLLECTION NAME="List of Companies" ISMODIFY="No">
                            <TYPE>Company</TYPE>
                        </COLLECTION>
                    </TDLMESSAGE></TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;

        try {
            const res = await axios.post(BRIDGE_URL, { xml });
            const matches = [...res.data.matchAll(/<NAME>(.*?)<\/NAME>/g)].map(m => m[1]);
            setCompanies(matches);
            if (matches.length > 0) setSelectedCompany(matches[0]);
            setStatus({ type: 'success', msg: `Found ${matches.length} active companies in Tally.` });
        } catch {
            setStatus({ type: 'danger', msg: "Connection failed. Is the Bridge running on the Tally PC?" });
        }
        setLoading(false);
    };

    const fetchLedgers = async () => {
        if (!selectedCompany) return;
        setLoading(true);
        setStatus({ type: 'info', msg: `Fetching ledgers for ${selectedCompany}...` });
        
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
            const res = await axios.post(BRIDGE_URL, { xml });
            const matches = [...res.data.matchAll(/<NAME>(.*?)<\/NAME>/g)].map(m => m[1]);
            setLedgers(matches);
            setStatus({ type: 'success', msg: `Successfully fetched ${matches.length} ledgers.` });
        } catch {
            setStatus({ type: 'danger', msg: "Error retrieving data from Tally." });
        }
        setLoading(false);
    };

    const alertStyles = {
        info: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        danger: "bg-red-50 text-red-700 border-red-200"
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
            <Navbar />
            <header className="max-w-6xl mx-auto flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tally API Gateway</h1>
                    <p className="text-slate-500 text-sm">Developer Connection Sandbox</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-200 rounded-full text-xs font-semibold text-slate-600">
                    <div className={`w-2 h-2 rounded-full ${companies.length > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    {companies.length > 0 ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <div className={`p-4 border rounded-xl shadow-sm transition-all ${alertStyles[status.type]}`}>
                        <p className="text-sm font-medium">{status.msg}</p>
                    </div>

                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Step 1: Handshake</h2>
                        <button 
                            onClick={fetchCompanies}
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                            {loading && status.type === 'info' ? 'Scanning...' : 'Scan Tally Companies'}
                        </button>

                        {companies.length > 0 && (
                            <div className="mt-6 space-y-4 pt-6 border-t border-slate-100">
                                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Step 2: Selection</h2>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Company</label>
                                    <select 
                                        value={selectedCompany} 
                                        onChange={(e) => setSelectedCompany(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    >
                                        {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <button 
                                    onClick={fetchLedgers}
                                    disabled={loading}
                                    className="w-full border border-slate-900 text-slate-900 py-2.5 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                                >
                                    Fetch Ledgers
                                </button>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Ledger List */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">
                                {selectedCompany ? `Ledgers for ${selectedCompany}` : 'Ledger Directory'}
                            </h3>
                            <span className="text-xs font-medium text-slate-400">{ledgers.length} items found</span>
                        </div>
                        
                        <div className="overflow-y-auto flex-1 bg-slate-50/30">
                            {ledgers.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-100/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3 w-16">#</th>
                                            <th className="px-6 py-3">Ledger Name</th>
                                            <th className="px-6 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {ledgers.map((l, i) => (
                                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-3 text-slate-400 text-sm font-mono">{i + 1}</td>
                                                <td className="px-6 py-3 font-medium text-slate-700">{l}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200">
                                                        SYNCED
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No ledger data retrieved</p>
                                    <p className="text-slate-400 text-xs mt-1">Complete the handshake to fetch data from Tally.</p>
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