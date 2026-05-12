import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';

const TallyTest = () => {
    const { request, loading, error } = useApi();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false); // Checkbox state
    const [ledgers, setLedgers] = useState([]);
    const [successMsg, setSuccessMsg] = useState("");

    const getStatus = () => {
        if (loading) return { type: 'info', msg: 'Communicating with Tally PC...' };
        if (error) return { type: 'danger', msg: error };
        if (successMsg) return { type: 'success', msg: successMsg };
        return { type: 'info', msg: 'Ready to sync' };
    };

    const status = getStatus();

    const fetchCompanies = async () => {
        setSuccessMsg("");
        // Using the "List of Companies" ID we verified earlier
        const xml = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>List of Companies</ID>
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
            const matches = [...responseData.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            setCompanies(matches);
            if (matches.length > 0) setSelectedCompany(matches[0]);
            setSuccessMsg(`Found ${matches.length} companies.`);
        } catch {
            // Error is already handled in the useApi hook, so we don't need to do anything here.
        }
    };

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
            setSuccessMsg(`Successfully synced ${uniqueLedgers.length} ledgers.`);
        } catch {
            // Error is already handled in the useApi hook, so we don't need to do anything here.
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-slate-800">Tally Integration Portal</h1>
                    <p className="text-slate-500">Automated accounting workflow for {selectedCompany || 'Family Business'}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Step 1: Get Companies */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-4 inline-block">STEP 1</span>
                            <h3 className="font-bold mb-2">Identify Companies</h3>
                            <p className="text-xs text-slate-500 mb-4">Fetch the list of all available firms from the local bridge.</p>
                        </div>
                        <button 
                            onClick={fetchCompanies} 
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 disabled:opacity-50"
                        >
                            Scan for Companies
                        </button>
                    </div>

                    {/* Step 2: Select & Verify */}
                    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between transition-opacity ${companies.length === 0 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                        <div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-4 inline-block">STEP 2</span>
                            <h3 className="font-bold mb-2">Select & Open</h3>
                            <select 
                                value={selectedCompany} 
                                onChange={(e) => {
                                    setSelectedCompany(e.target.value);
                                    setIsCompanyOpen(false); // Reset check if company changes
                                }}
                                className="w-full border border-slate-200 rounded-lg py-2 px-2 text-sm mb-4 outline-none"
                            >
                                {companies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            
                            <label className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="mt-1 w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                    checked={isCompanyOpen}
                                    onChange={(e) => setIsCompanyOpen(e.target.checked)}
                                />
                                <span className="text-xs text-amber-800 font-medium leading-tight">
                                    I have opened <strong>"{selectedCompany}"</strong> in the Tally application window.
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Step 3: Fetch Data */}
                    <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between transition-opacity ${!isCompanyOpen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                        <div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-4 inline-block">STEP 3</span>
                            <h3 className="font-bold mb-2">Sync Data</h3>
                            <p className="text-xs text-slate-500 mb-4">Pull all ledger accounts to prepare for voucher creation.</p>
                        </div>
                        <button 
                            onClick={fetchLedgers}
                            disabled={loading || !isCompanyOpen}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                        >
                            Sync Ledger Masters
                        </button>
                    </div>
                </div>

                {/* Status Bar */}
                <div className={`px-6 py-3 rounded-xl border text-sm font-medium ${
                    status.type === 'danger' ? 'bg-red-50 text-red-700 border-red-100' : 
                    status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                    'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                    {status.msg}
                </div>

                {/* Ledger Preview Table */}
                {ledgers.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-slate-700 text-sm">Ledger Masters from Tally</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-wider sticky top-0 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 font-bold">#</th>
                                        <th className="px-6 py-3 font-bold">Ledger Name</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {ledgers.map((l, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 text-slate-400 font-mono text-[10px]">{i + 1}</td>
                                            <td className="px-6 py-3 font-medium text-slate-700">{l}</td>
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