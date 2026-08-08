import React from 'react';
import { Info, Loader2, Save, Target } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const TierConfig = ({ thresholds, setThresholds, compliance = {} }) => {
  const { request, loading } = useApi();

  const handleGlobalSave = async () => {
    try {
      await request("/settings", "PUT", { business: { thresholds }, compliance });
      toast.success("Tier thresholds updated successfully.");
    } catch { 
      toast.error("Failed to save changes."); 
    }
  };

  return (
    <div className="w-full max-w-4xl pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Tier Thresholds</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Set AUM limits for Wealth Elite Categorization.</p>
      </div>

      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
        
        {/* Section Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
           <Target size={18} className="text-indigo-600 dark:text-indigo-400" />
           <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">AUM Boundaries</h3>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Define minimum asset values required for each tier.</p>
           </div>
        </div>

        {/* Configuration Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Object.entries(thresholds).map(([tier, value]) => (
            <div key={tier} className="flex flex-col space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex justify-between">
                <span>{tier} Tier</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-slate-400 font-bold">₹</span>
                <input 
                  type="number"
                  value={value}
                  onChange={(e) => setThresholds({...thresholds, [tier]: e.target.value})}
                  onWheel={(e) => e.target.blur()}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md pl-8 pr-12 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
                />
                <span className="absolute right-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cr</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured System Alert */}
      <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-md p-5 flex items-start gap-4">
        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-md shrink-0">
           <Info className="text-amber-700 dark:text-amber-400" size={18} />
        </div>
        <div className="space-y-1 mt-1">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest">Reclassification Notice</p>
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400/80 leading-relaxed">
            Adjusting these values will instantly re-classify all active families in your directory upon saving. Please ensure these limits align with your current business mandates before committing changes.
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end pt-2">
        <button
            onClick={handleGlobalSave}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />} Commit Boundaries
        </button>
      </div>
      
    </div>
  );
};

export default TierConfig;