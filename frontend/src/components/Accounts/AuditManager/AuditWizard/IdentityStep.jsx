import React, { useState, useEffect } from 'react';
import { 
  Building2, Landmark, ChevronLeft, ChevronRight, Check, 
  Loader2, WifiOff, Calendar, HelpCircle, Sparkles, ChevronDown 
} from 'lucide-react';
import { tallyTemplates } from '../../../../utils/tallyTemplates';
import { useApi } from '../../../../hooks/useApi';

const IdentityStep = ({ selection, setSelection, accounts, arns }) => {
  const { request } = useApi();
  const [loading, setLoading] = useState({ firms: true, ledgers: false });
  const [tallyFirms, setTallyFirms] = useState([]);
  const [bankLedgers, setBankLedgers] = useState([]);
  
  // Mobile-specific layout state
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(!selection.tallyCompany);

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

  const handleFirmSelect = (firmName) => {
    const matchedArn = arns?.find(a => a.linkedTallyFirms?.includes(firmName));
    
    setSelection({
      ...selection,
      tallyCompany: firmName,
      arnId: matchedArn?._id || null,
      account: null,
      tallyLedger: null
    });
    // Auto-collapse on mobile to reveal ledgers & period
    setMobileCompanyOpen(false); 
  };

  const handleLedgerSelect = (ledger) => {
    const localMatch = accounts?.find(acc => 
      acc.tallyMapping?.companyName === selection.tallyCompany && 
      acc.tallyMapping?.ledgerName === ledger.name
    );

    const fallbackMatch = !localMatch ? accounts?.find(acc => acc.name === ledger.name) : null;
    const finalMatch = localMatch || fallbackMatch;

    setSelection({
      ...selection,
      account: { ...ledger, _id: finalMatch?._id || undefined },
      arnId: finalMatch?.arnId || selection.arnId,
      tallyCompany: selection.tallyCompany,
      tallyLedger: ledger.name
    });
  };

  // Shared Month Picker Component to ensure logical placement across devices
  const PeriodSelector = ({ className = "" }) => (
    <div className={`flex flex-col gap-3 lg:gap-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-3">
          <Calendar size={14} className="text-slate-400 lg:w-4 lg:h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white italic">2. Audit Period</span>
        </div>
        <div className="flex items-center bg-slate-50 dark:bg-white/5 p-0.5 lg:p-1 rounded-lg lg:rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <button onClick={() => setSelection(prev => ({...prev, year: prev.year - 1}))} className="p-1.5 lg:p-2 hover:text-emerald-500 transition-colors"><ChevronLeft size={14} className="lg:w-4.5 lg:h-4.5" /></button>
          <span className="px-2 lg:px-6 text-[10px] lg:text-[12px] font-[1000] text-slate-900 dark:text-white italic min-w-14 lg:min-w-20 text-center uppercase tracking-widest">FY {selection.year}</span>
          <button onClick={() => setSelection(prev => ({...prev, year: prev.year + 1}))} className="p-1.5 lg:p-2 hover:text-emerald-500 transition-colors"><ChevronRight size={14} className="lg:w-4.5 lg:h-4.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-1 lg:gap-2">
        {months.map((m, i) => {
          const isSelected = selection.month === i + 1;
          return (
            <button key={m} onClick={() => setSelection({ ...selection, month: i + 1 })}
              className={`py-2 lg:py-3 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase transition-all border lg:border-2 ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white shadow-[0_4px_15px_-3px_rgba(16,185,129,0.4)]' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 hover:border-slate-200'}`}>
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      <div className="flex flex-col lg:flex-row h-full w-full bg-white dark:bg-[#050607] overflow-hidden relative">
        
        {/* =========================================================================
            DESKTOP ONLY: GUIDANCE PANEL
            ========================================================================= */}
        <aside className="hidden lg:flex w-80 bg-slate-50/50 dark:bg-white/2 border-r border-slate-100 dark:border-white/5 p-10 flex-col shrink-0">
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

        {/* =========================================================================
            MOBILE ONLY: CLEAN TOP HEADER
            ========================================================================= */}
        <div className="lg:hidden flex flex-col shrink-0 bg-white dark:bg-[#050607] border-b border-slate-100 dark:border-white/5 z-10">
          <div className="px-4 py-4 flex items-center justify-between">
            <h3 className="text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                Entity <span className="text-emerald-500">Selection</span>
            </h3>
            {/* Tiny summary chip for real-estate efficiency */}
            {selection.account?.name && (
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-600 uppercase tracking-widest">
                  Ready
                </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            CENTER/ACCORDION 1: TALLY FIRMS
            ========================================================================= */}
        <section className={`flex flex-col lg:border-r border-slate-100 dark:border-white/5 bg-white dark:bg-transparent transition-all duration-300 ${mobileCompanyOpen ? 'flex-1' : 'shrink-0'} lg:flex-1`}>
          
          {/* Header acts as Accordion Trigger on Mobile */}
          <div 
            onClick={() => setMobileCompanyOpen(!mobileCompanyOpen)}
            className="px-4 lg:px-8 py-4 lg:py-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 lg:bg-slate-50/30 flex items-center justify-between shrink-0 cursor-pointer lg:cursor-default select-none"
          >
            <div className="flex items-center gap-2 lg:gap-3">
              <Building2 size={14} className="text-slate-400 lg:w-4 lg:h-4 shrink-0" />
              <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] lg:tracking-[0.3em]">
                1. Active Company
              </h4>
            </div>
            <div className="flex items-center gap-3">
              {/* Show selected firm summary when collapsed on mobile */}
              {!mobileCompanyOpen && selection.tallyCompany && (
                <span className="lg:hidden px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase tracking-widest truncate max-w-37.5">
                   {selection.tallyCompany}
                </span>
              )}
              {loading.firms ? (
                <Loader2 size={14} className="animate-spin text-emerald-500" />
              ) : (
                <ChevronDown size={16} className={`lg:hidden text-slate-400 transition-transform duration-300 ${mobileCompanyOpen ? 'rotate-180' : ''}`} />
              )}
            </div>
          </div>
          
          {/* List Area */}
          <div className={`${mobileCompanyOpen ? 'flex' : 'hidden'} lg:flex flex-col flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8 space-y-2 lg:space-y-3`}>
            {tallyFirms.map((firm) => {
              const isSelected = selection.tallyCompany === firm;
              return (
                <button
                  key={firm}
                  onClick={() => handleFirmSelect(firm)} 
                  className={`w-full p-3 lg:p-6 text-left border lg:border-2 transition-all duration-300 flex items-center justify-between rounded-xl lg:rounded-2xl group shrink-0 ${isSelected ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_5px_15px_-5px_rgba(16,185,129,0.2)]' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-200 lg:hover:translate-x-1'}`}
                >
                  <span className={`text-xs lg:text-sm font-[1000] uppercase italic tracking-tight transition-colors truncate pr-3 ${isSelected ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>{firm}</span>
                  <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-md lg:rounded-lg flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-white/10 text-transparent lg:group-hover:text-slate-200'}`}>
                    <Check size={12} className="lg:w-3.5 lg:h-3.5" strokeWidth={4} />
                  </div>
                </button>
              );
            })}
            {tallyFirms.length === 0 && !loading.firms && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-3">
                <WifiOff size={24} className="lg:w-8 lg:h-8" strokeWidth={1.5} />
                <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">Bridge not found.<br/>Open a company in Tally.</p>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            RIGHT / ACCORDION 2: PERIOD AND LEDGERS
            ========================================================================= */}
        {/* Hidden entirely on mobile if Company Accordion is open AND no company is selected */}
        <section className={`flex-col flex-1 bg-[#FBFBFC] dark:bg-transparent transition-all duration-300 ${!selection.tallyCompany && mobileCompanyOpen ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Period Wrapper (Now visible in chronological order on mobile) */}
          <div className="px-4 lg:px-8 py-4 lg:py-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-black/20 shrink-0">
             <PeriodSelector />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="px-4 lg:px-8 py-4 lg:py-6 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2 lg:gap-3">
                <Landmark size={14} className="text-slate-400 lg:w-4 lg:h-4" />
                <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] lg:tracking-[0.3em]">
                  3. Bank Account
                </h4>
              </div>
              {loading.ledgers && <Loader2 size={14} className="animate-spin text-emerald-500" />}
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8 space-y-2 lg:space-y-3 relative">
              {loading.ledgers && (
                <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-2 lg:gap-3">
                     <Loader2 className="animate-spin text-emerald-500" size={24} />
                     <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest">Loading Books...</p>
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
                      className={`w-full p-3 lg:p-6 text-left border lg:border-2 transition-all duration-300 flex items-center justify-between rounded-xl lg:rounded-2xl group shrink-0 ${isSelected ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_5px_15px_-5px_rgba(16,185,129,0.2)]' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-200 lg:hover:translate-x-1'}`}
                    >
                      <div className="flex flex-col text-left min-w-0 pr-3">
                        <span className={`text-xs lg:text-sm font-[1000] uppercase italic tracking-tight transition-colors leading-none mb-1 truncate ${isSelected ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>{ledger.name}</span>
                        <span className={`text-[8px] lg:text-[9px] font-black uppercase tracking-widest transition-opacity truncate ${isSelected ? 'opacity-60' : 'opacity-40'}`}>{ledger.group}</span>
                      </div>
                      <div className={`w-5 h-5 lg:w-6 lg:h-6 rounded-md lg:rounded-lg flex items-center justify-center transition-all shrink-0 ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-white/10 text-transparent lg:group-hover:text-slate-200'}`}>
                        <Check size={12} className="lg:w-3.5 lg:h-3.5" strokeWidth={4} />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic min-h-37.5">
                  <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] lg:tracking-[0.4em] text-center leading-relaxed">Pick a company<br/>to load accounts</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default IdentityStep;