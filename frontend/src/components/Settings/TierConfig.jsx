import React from 'react';
import { Info, Loader2, Save } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const TierConfig = ({ thresholds, setThresholds, compliance = {} }) => {
  const { request, loading } = useApi();

  const handleGlobalSave = async () => {
    try {
      await request("/settings", "PUT", { business: { thresholds }, compliance });
      toast.success("Settings saved successfully.");
    } catch { 
      toast.error("Failed to save changes."); 
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 pb-64 md:pb-8">
      {/* HEADER */}
      <header className="mb-12">
        <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900">Tier Thresholds</h3>
        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">Set AUM limits for Wealth Elite Categorization</p>
      </header>

      {/* CONFIGURATION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {Object.entries(thresholds).map(([tier, value]) => (
          <div key={tier} className="relative flex flex-col">
            <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              {tier} Tier (₹ Crores)
            </label>
            <div className="relative flex items-center">
              <input 
                type="number"
                value={value}
                onChange={(e) => setThresholds({...thresholds, [tier]: e.target.value})}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                  }
                }}
                className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-bold text-slate-900 outline-none focus:border-emerald-600 transition-colors"
              />
              <span className="absolute right-0 text-[10px] font-bold text-slate-400 uppercase">Cr</span>
            </div>
          </div>
        ))}
      </div>

      {/* ALERT SECTION */}
      <div className="mt-16 flex gap-4 items-start border-l-2 border-emerald-600 pl-6 py-2">
        <Info className="text-emerald-600 shrink-0 mt-0.5" size={18} />
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-emerald-900 uppercase tracking-widest">System Notice</p>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-lg">
            Adjusting these values will re-classify all families in your directory immediately after saving. Ensure data accuracy before committing changes.
          </p>
        </div>
      </div>

      {/* COMMIT ACTION */}
      <div className="mt-12 flex justify-end">
        <button
            onClick={handleGlobalSave}
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-600/20"
        >
            {loading ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} />} Commit Changes
        </button>
      </div>
    </div>
  );
};

export default TierConfig;