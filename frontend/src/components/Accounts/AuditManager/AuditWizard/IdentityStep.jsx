import React, { useState, useEffect } from 'react';
import { 
  Building2, ChevronLeft, ChevronRight, Check, 
  Loader2, WifiOff, Calendar, Sparkles 
} from 'lucide-react';
import { tallyTemplates } from '../../../../utils/tallyTemplates';
import { useApi } from '../../../../hooks/useApi';

const IdentityStep = ({ selection, setSelection, arns }) => {
  const { request } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [tallyFirms, setTallyFirms] = useState([]);

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
      } catch (err) { 
        console.error("Bridge Connection Error:", err); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchFirms();
  }, [request]);

  const handleFirmSelect = (firmName) => {
    const matchedArn = arns?.find(a => a.linkedTallyFirms?.includes(firmName));
    setSelection({
      ...selection,
      tallyCompany: firmName,
      arnId: matchedArn?._id || null,
      account: null,
      tallyLedger: null
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      <div className="flex flex-col lg:flex-row h-full w-full bg-[#FBFBFC] dark:bg-[#050607] overflow-hidden relative">
        
        {/* LEFT COLUMN: ACTIVE COMPANY SELECTION */}
        <section className="flex flex-col flex-1 lg:border-r border-slate-200 dark:border-white/5 bg-white dark:bg-transparent overflow-hidden">
          
          <div className="px-5 lg:px-10 py-5 lg:py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-black/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-500 mb-2">
                  <Sparkles size={14} className="lg:w-4 lg:h-4" />
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em]">Step 1</span>
              </div>
              <h3 className="text-xl lg:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                Company <span className="text-emerald-500">Registry</span>
              </h3>
            </div>
            
            {isLoading && <Loader2 size={18} className="animate-spin text-emerald-500" />}
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-8 space-y-3 min-h-62.5 lg:min-h-0">
            {tallyFirms.map((firm) => {
              const isSelected = selection.tallyCompany === firm;
              return (
                <button
                  key={firm}
                  onClick={() => handleFirmSelect(firm)} 
                  className={`w-full p-4 lg:p-6 text-left border lg:border-2 transition-all duration-300 flex items-center justify-between rounded-xl lg:rounded-2xl group shrink-0 ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/50' 
                      : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300 lg:hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 lg:gap-4 overflow-hidden pr-4">
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white'}`}>
                      <Building2 size={16} className="lg:w-5 lg:h-5" />
                    </div>
                    <span className={`text-sm lg:text-base font-[1000] uppercase italic tracking-tight transition-colors truncate ${isSelected ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-200'}`}>
                      {firm}
                    </span>
                  </div>
                  
                  <div className={`w-6 h-6 lg:w-7 lg:h-7 rounded-full flex items-center justify-center transition-all shrink-0 border-2 ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-white/20 text-transparent'}`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                </button>
              );
            })}

            {tallyFirms.length === 0 && !isLoading && (
              <div className="h-full min-h-50 flex flex-col items-center justify-center opacity-30 gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                  <WifiOff size={28} className="text-slate-500" strokeWidth={2} />
                </div>
                <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-center leading-relaxed">
                  Bridge not found.<br/>Open a company in Tally.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: PERIOD SELECTION & CONTEXT SUMMARY */}
        {/* FIX: min-h-0 and flex-1 allows dynamic scroll handling on mobile without overriding the parent height */}
        <section className="w-full lg:w-105 flex flex-col flex-1 lg:flex-none bg-slate-50 dark:bg-black/20 border-t lg:border-t-0 border-slate-200 dark:border-white/5 overflow-y-auto no-scrollbar min-h-0 pb-8 lg:pb-0">
          
          <div className="p-4 lg:p-8 shrink-0">
            <div className="relative overflow-hidden bg-slate-900 dark:bg-[#0D0E12] rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-800 dark:border-white/10">
              <div className="absolute -top-6 -right-6 opacity-10 text-emerald-500 mix-blend-overlay">
                <Building2 size={140} strokeWidth={1} />
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                <span className="text-[9px] lg:text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] mb-2">
                  Dossier Target
                </span>
                
                <h4 className="text-white text-lg lg:text-2xl font-[1000] italic leading-tight mb-6 wrap-break-word">
                  {selection.tallyCompany || 'Select a Company'}
                </h4>
                
                <div className="flex items-center gap-6 mt-auto pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[8px] lg:text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Audit Month</p>
                    <p className="text-sm lg:text-base text-white font-black">{currentMonthName}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div>
                    <p className="text-[8px] lg:text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Fiscal Year</p>
                    <p className="text-sm lg:text-base text-white font-black">{selection.year}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-8 pt-0 lg:pt-0 flex flex-col shrink-0">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                  Select Month
                </span>
              </div>
              
              <div className="flex items-center bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-1">
                <button onClick={() => setSelection(prev => ({...prev, year: prev.year - 1}))} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors active:scale-90">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-4 text-[11px] lg:text-xs font-[1000] text-slate-900 dark:text-white min-w-16 text-center select-none">
                  {selection.year}
                </span>
                <button onClick={() => setSelection(prev => ({...prev, year: prev.year + 1}))} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors active:scale-90">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:gap-3">
              {months.map((m, i) => {
                const isSelected = selection.month === i + 1;
                return (
                  <button 
                    key={m} 
                    onClick={() => setSelection({ ...selection, month: i + 1 })}
                    className={`py-3 lg:py-4 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                      isSelected 
                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-black shadow-lg scale-[1.02]' 
                        : 'bg-white dark:bg-white/2 text-slate-400 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

        </section>
      </div>
    </>
  );
};

export default IdentityStep;