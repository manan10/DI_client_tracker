import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import Navbar from '../../components/Navbar';

const TallyTest = () => {
    const { request, loading, error } = useApi();
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
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
        // Standard ID that won't trigger TDL errors
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
            
            // This will show all companies currently active/visible to Tally
            const cleanList = [...new Set(matches)].filter(name => !name.includes('migrated-to'));
            
            setCompanies(cleanList);
            if (cleanList.length > 0) setSelectedCompany(cleanList[0]);
            setSuccessMsg(`Found ${cleanList.length} companies. Please ensure the one you select is OPEN in Tally.`);
        } catch {
            // Hook handles it
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
            setSuccessMsg(`Successfully synced ${uniqueLedgers.length} ledgers for ${selectedCompany}.`);
        } catch  {
            // Hook handles it
        }
    };

    const alertStyles = {
        info: "bg-blue-50 text-blue-700 border-blue-100",
        success: "bg-emerald-50 text-emerald-700 border-emerald-100",
        danger: "bg-red-50 text-red-700 border-red-100"
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
            <Navbar /> 
            <div className="max-w-6xl mx-auto space-y-8 mt-4">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Tally Hub</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage data sync for Dalal Investment Development</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* STEP 1 */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                        <h3 className="text-lg font-bold mb-2 text-slate-400 uppercase text-[10px] tracking-widest">Step 01</h3>
                        <p className="text-sm text-slate-500 mb-6">Scan for available companies.</p>
                        <button onClick={fetchCompanies} disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold">
                            Scan Companies
                        </button>
                    </div>

                    {/* STEP 2 */}
                    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm ${companies.length === 0 ? 'opacity-40' : 'opacity-100'}`}>
                        <h3 className="text-lg font-bold mb-2 text-slate-400 uppercase text-[10px] tracking-widest">Step 02</h3>
                        <select value={selectedCompany} onChange={(e) => {setSelectedCompany(e.target.value); setIsCompanyOpen(false);}} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm font-semibold">
                            {companies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <label className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 cursor-pointer">
                            <input type="checkbox" className="mt-1 h-5 w-5 rounded text-amber-600" checked={isCompanyOpen} onChange={(e) => setIsCompanyOpen(e.target.checked)} />
                            <span className="text-xs text-amber-900 font-bold leading-tight">
                                I have physically opened "{selectedCompany}" in the Tally app.
                            </span>
                        </label>
                    </div>

                    {/* STEP 3 */}
                    <div className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm ${!isCompanyOpen ? 'opacity-40' : 'opacity-100'}`}>
                        <h3 className="text-lg font-bold mb-2 text-slate-400 uppercase text-[10px] tracking-widest">Step 03</h3>
                        <button onClick={fetchLedgers} disabled={loading || !isCompanyOpen} className="w-full py-3 bg-blue-600 text-white rounded-2xl font-bold">
                            Sync Ledger Masters
                        </button>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${alertStyles[status.type]}`}>
                    <p className="text-sm font-bold">{status.msg}</p>
                </div>

                {ledgers.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase">
                                <tr><th className="px-8 py-4">No.</th><th className="px-8 py-4">Account Name</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {ledgers.map((l, i) => (
                                    <tr key={i}><td className="px-8 py-4 text-xs text-slate-300">{i + 1}</td><td className="px-8 py-4 text-sm font-bold text-slate-700">{l}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TallyTest;