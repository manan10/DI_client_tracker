import React from 'react';
import { Info, Loader2, Save, Target } from 'lucide-react';
import { toast } from 'sonner';

import { useApi } from '../../../hooks/useApi';
import PageHeader from '../../../components/Auth/PageHeader';

const TierConfig = ({ thresholds, setThresholds, compliance = {} }) => {
  const { request, loading } = useApi();

  const handleGlobalSave = async () => {
    try {
      await request("/settings", "PUT", { business: { thresholds }, compliance });
      toast.success("Wealth tier limits updated successfully.");
    } catch { 
      toast.error("Failed to save changes. Please try again."); 
    }
  };

  return (
    <div className="w-fullmax-w-[100rem] mx-auto space-y-6 animate-in fade-in duration-300 min-w-0 pb-32">
      
      {/* Universal Page Header */}
      <PageHeader 
        title="Wealth"
        accent="Tiers"
        description="Set minimum portfolio size thresholds to automatically group client families into Diamond, Gold, Silver, and Bronze tiers."
      />

      {/* Main Tier Inputs Card */}
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Card Header Strip */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/40 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 shrink-0">
            <Target size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Minimum Asset Requirements
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Enter the cutoff values in Crores for each category.
            </p>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {Object.entries(thresholds).map(([tier, value]) => (
            <div key={tier} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center justify-between">
                <span>{tier} Tier Minimum</span>
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 font-bold text-sm pointer-events-none">
                  ₹
                </span>
                <input 
                  type="number"
                  value={value}
                  onChange={(e) => setThresholds({ ...thresholds, [tier]: e.target.value })}
                  onWheel={(e) => e.target.blur()}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
                  }}
                  placeholder="0.00"
                  className="w-full bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-12 py-2.5 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-2xs"
                />
                <span className="absolute right-3.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pointer-events-none">
                  Cr
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful Warning Banner */}
      <div className="bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400 shrink-0">
          <Info size={16} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            Automatic Client Regrouping
          </p>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
            Saving new limits will instantly recalculate and update the tier badge for every family in your directory. Please double-check the amounts before saving.
          </p>
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleGlobalSave}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Save Tier Limits</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default TierConfig;