import React, { useState, useEffect } from 'react';
import { Building2, Landmark, ChevronLeft, ChevronRight, Check, Loader2, WifiOff, Calendar, HelpCircle, Sparkles } from 'lucide-react';
import { tallyTemplates } from '../../../../utils/tallyTemplates';
import { useApi } from '../../../../hooks/useApi';

const IdentityStep = ({ selection, setSelection, accounts, arns }) => {
  const { request } = useApi();
  const [loading, setLoading] = useState({ firms: true, ledgers: false });
  const [tallyFirms, setTallyFirms] = useState([]);
  const [bankLedgers, setBankLedgers] = useState([]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthName = months[selection.month - 1];

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const xml = tallyTemplates.getCompanies();
        const res = await request("/tally/proxy", "POST", { xml });
        const matches = [...res.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
        const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
        setTallyFirms(filtered);
      } catch (err) { console.error("Bridge Connection Error:", err); } 
      finally { setLoading(prev => ({ ...prev, firms: false })); }
    };
    fetchFirms();
  }, [request]);

  useEffect(() => {
    if (!selection.tallyCompany) return;
    const fetchBankLedgers = async () => {
      setLoading(prev => ({ ...prev, ledgers: true }));
      try {
        const xml = tallyTemplates.getLedgers(selection.tallyCompany);
        const res = await request("/tally/proxy", "POST", { xml });
        const ledgerRegex = /<LEDGER NAME="([^"]*)"[^>]*>[\s\S]*?<PARENT[^>]*>(.*?)<\/PARENT>/g;
        const matches = [...res.matchAll(ledgerRegex)];
        const filtered = matches
          .map(m => ({ name: m[1], group: m[2] }))
          .filter(l => l.group.includes("Bank Accounts") || l.group.includes("Cash-in-Hand"));
        setBankLedgers(filtered);
      } catch (err) { console.error("Accounting Sync Error:", err); } 
      finally { setLoading(prev => ({ ...prev, ledgers: false })); }
    };
    fetchBankLedgers();
  }, [selection.tallyCompany, request]);

  // Handle Firm selection and resolve the ARN ID link
  const handleFirmSelect = (firmName) => {
    const matchedArn = arns?.find(a => a.linkedTallyFirms?.includes(firmName));
    
    setSelection({
      ...selection,
      tallyCompany: firmName,
      arnId: matchedArn?._id || null, // Link the ARN context here
      account: null,
      tallyLedger: null
    });
  };

  // Unified selection handler to bridge Tally and MongoDB
  const handleLedgerSelect = (ledger) => {
    // Look for a local account that is already mapped to this Tally Ledger
    const localMatch = accounts?.find(acc => 
      acc.tallyMapping?.companyName === selection.tallyCompany && 
      acc.tallyMapping?.ledgerName === ledger.name
    );

    // If no explicit mapping, fallback to name-based matching
    const fallbackMatch = !localMatch ? accounts?.find(acc => acc.name === ledger.name) : null;
    const finalMatch = localMatch || fallbackMatch;

    setSelection({
      ...selection,
      account: {
        ...ledger,
        _id: finalMatch?._id || undefined, 
      },
      // Preserve the arnId from the Company selection if the ledger match doesn't have one
      arnId: finalMatch?.arnId || selection.arnId,
      tallyCompany: selection.tallyCompany,
      tallyLedger: ledger.name
    });
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#050607] overflow-hidden">
      
      {/* 1. GUIDANCE PANEL */}
      <aside className="w-80 bg-slate-50/50 dark:bg-white/2 border-r border-slate-100 dark:border-white/5 p-10 flex flex-col shrink-0">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Audit Wizard</span>
            </div>
            <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
              Entity <span className="text-emerald-500">Selection</span>
            </h3>
          </div>

          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3">
                <HelpCircle size={14} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step-by-Step Guide</span>
            </div>
            <div className="space-y-8 relative">
              <div className="absolute left-1.75 top-2 bottom-2 w-px bg-slate-200 dark:bg-white/10" />
              {[
                { label: "Check Audit Month", val: `${currentMonthName} ${selection.year}` },
                { label: "Pick Tally Company", val: selection.tallyCompany || "Not Selected" },
                { label: "Select Bank Book", val: selection.account?.name || "Not Selected" }
              ].map((step, i) => (
                <div key={i} className="flex gap-6 relative z-10">
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${!step.val.includes("Not") ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20'}`} />
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{step.label}</p>
                    <p className={`text-[11px] font-[1000] uppercase italic leading-tight transition-colors ${step.val.includes("Not") ? 'text-slate-300' : 'text-slate-900 dark:text-white'}`}>{step.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* 2. CENTER WORKSPACE: Tally Firms */}
      <section className="flex-1 border-r border-slate-100 dark:border-white/5 flex flex-col bg-white dark:bg-transparent overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Building2 size={16} className="text-slate-400" />
            <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">1. Select Active Company</h4>
          </div>
          {loading.firms && <Loader2 size={14} className="animate-spin text-emerald-500" />}
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-3">
          {tallyFirms.map((firm) => {
            const isSelected = selection.tallyCompany === firm;
            return (
              <button
                key={firm}
                onClick={() => handleFirmSelect(firm)} // Updated Logic
                className={`w-full p-6 text-left border-2 transition-all duration-300 flex items-center justify-between rounded-2xl group ${isSelected ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)]' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-200 hover:translate-x-1'}`}
              >
                <span className={`text-sm font-[1000] uppercase italic tracking-tight transition-colors ${isSelected ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>{firm}</span>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-white/10 text-transparent group-hover:text-slate-200'}`}>
                  <Check size={14} strokeWidth={4} />
                </div>
              </button>
            );
          })}
          {tallyFirms.length === 0 && !loading.firms && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
              <WifiOff size={32} strokeWidth={1.5} />
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Tally Bridge not found.<br/>Please open a company in Tally.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. RIGHT WORKSPACE: Time & Ledgers */}
      <section className="flex-[1.2] flex flex-col overflow-hidden bg-[#FBFBFC] dark:bg-transparent relative">
        
        <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-black/20 shrink-0">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">2. Audit Period</span>
              </div>
              <div className="flex items-center bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                <button onClick={() => setSelection(prev => ({...prev, year: prev.year - 1}))} className="p-2 hover:text-emerald-500 transition-colors"><ChevronLeft size={18}/></button>
                <span className="px-6 text-[12px] font-[1000] text-slate-900 dark:text-white italic min-w-20 text-center uppercase tracking-widest">FY {selection.year}</span>
                <button onClick={() => setSelection(prev => ({...prev, year: prev.year + 1}))} className="p-2 hover:text-emerald-500 transition-colors"><ChevronRight size={18}/></button>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {months.map((m, i) => {
                const isSelected = selection.month === i + 1;
                return (
                  <button key={m} onClick={() => setSelection({ ...selection, month: i + 1 })}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_8px_20px_-5px_rgba(16,185,129,0.4)]' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 hover:border-slate-200'}`}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="px-8 py-6 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Landmark size={16} className="text-slate-400" />
              <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">3. Select Bank Account</h4>
            </div>
            {loading.ledgers && <Loader2 size={12} className="animate-spin text-emerald-500" />}
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-3 relative">
            {loading.ledgers && (
              <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-3">
                   <Loader2 className="animate-spin text-emerald-500" size={32} />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Bank Books...</p>
                </div>
              </div>
            )}

            {selection.tallyCompany ? (
              bankLedgers.map((ledger) => {
                const isSelected = selection.account?.name === ledger.name;
                return (
                  <button
                    key={ledger.name}
                    onClick={() => handleLedgerSelect(ledger)}
                    className={`w-full p-6 text-left border-2 transition-all duration-300 flex items-center justify-between rounded-2xl group ${isSelected ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.2)]' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-200 hover:translate-x-1'}`}
                  >
                    <div className="flex flex-col text-left">
                      <span className={`text-sm font-[1000] uppercase italic tracking-tight transition-colors leading-none mb-1 ${isSelected ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>{ledger.name}</span>
                      <span className={`text-[9px] font-black uppercase tracking-tighter transition-opacity ${isSelected ? 'opacity-60' : 'opacity-40'}`}>{ledger.group}</span>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-white/10 text-transparent group-hover:text-slate-200'}`}>
                      <Check size={14} strokeWidth={4} />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-center leading-relaxed">Please pick a company<br/>to load accounts</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default IdentityStep;