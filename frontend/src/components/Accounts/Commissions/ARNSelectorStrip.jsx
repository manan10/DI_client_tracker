import React from 'react';
import { Building2 } from 'lucide-react';

const ARN_ACCENTS = [
  {
    activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/25',
    activeText: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    bar: 'bg-emerald-500'
  },
  {
    activeBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/25',
    activeText: 'text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    bar: 'bg-indigo-500'
  },
  {
    activeBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/25',
    activeText: 'text-cyan-700 dark:text-cyan-300',
    dot: 'bg-cyan-500',
    badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
    bar: 'bg-cyan-500'
  },
  {
    activeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/25',
    activeText: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    bar: 'bg-amber-500'
  },
  {
    activeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/25',
    activeText: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    bar: 'bg-purple-500'
  },
  {
    activeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    activeBorder: 'border-rose-500 ring-2 ring-rose-500/25',
    activeText: 'text-rose-700 dark:text-rose-300',
    dot: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    bar: 'bg-rose-500'
  }
];

const formatCurrency = (val) => {
  if (!val || val === 0) return "0.00";
  if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)} K`;
  return new Intl.NumberFormat('en-IN').format(Math.round(val));
};

const formatMonth = (monthStr) => {
  if (!monthStr || monthStr === "N/A") return "Last Month";
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1] || parts[1]} '${year.slice(-2)}`;
};

const ARNSelectorStrip = ({ arns = [], stats = {}, selectedARN, onSelectARN }) => {
  // Strict DUMMY filtering
  const activeArns = arns.filter(arn => {
    if (!arn) return false;
    if (arn.isDummy === true) return false;
    const code = String(arn.arnCode || '').toUpperCase();
    const nick = String(arn.nickname || '').toUpperCase();
    return !code.includes('DUMMY') && !nick.includes('DUMMY');
  });

  return (
    <div className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xs overflow-hidden p-2 sm:p-2.5">
      {/* 
        Responsive layout:
        Mobile (< 640px) -> grid-cols-2
        Tablet (640px - 1024px) -> grid-cols-3
        Desktop (>= 1024px) -> flex-row with fluid expansion
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-stretch gap-2 sm:gap-2.5 lg:overflow-x-auto no-scrollbar w-full">
        {activeArns.map((arn, idx) => {
          const isActive = selectedARN?.id === arn._id;
          const arnStats = stats[arn._id] || {};
          const totalFY = arnStats.totalFY || 0;
          const lastPayout = arnStats.lastPayout || 0;
          const lastMonthName = arnStats.lastMonthName || 'N/A';
          const theme = ARN_ACCENTS[idx % ARN_ACCENTS.length];

          return (
            <button
              key={arn._id}
              type="button"
              onClick={() => onSelectARN({
                id: arn._id,
                name: arn.arnCode,
                nickname: arn.nickname,
                lastPayout,
                lastMonthName,
                totalFY
              })}
              className={`group w-full lg:flex-1 lg:min-w-52.5 lg:max-w-[320px] p-2.5 sm:p-3.5 rounded-lg border text-left transition-all duration-200 cursor-pointer outline-none select-none relative flex flex-col justify-between gap-2 sm:gap-2.5 ${
                isActive
                  ? `${theme.activeBg} ${theme.activeBorder} shadow-sm`
                  : 'bg-slate-50/50 dark:bg-[#0E1626] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/3'
              }`}
            >
              {/* Row 1: License Code Tag & Nickname */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <div className="min-w-0 flex items-center gap-1.5 sm:gap-2 flex-1">
                  <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0 ${isActive ? `${theme.dot} animate-pulse` : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <h4 className={`text-[11px] sm:text-xs md:text-sm font-bold truncate ${isActive ? theme.activeText : 'text-slate-900 dark:text-white'}`}>
                    {arn.nickname}
                  </h4>
                </div>
                
                <span className={`px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[8px] sm:text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 border ${
                  isActive ? theme.badge : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                }`}>
                  {arn.arnCode}
                </span>
              </div>

              {/* Row 2: Financial Metrics Telemetry */}
              <div className="pt-1.5 sm:pt-2 border-t border-slate-200/60 dark:border-white/5 flex items-baseline justify-between gap-1.5 w-full">
                <div className="min-w-0">
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-none">
                    FY Total
                  </span>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400">₹</span>
                    <span className="text-[11px] sm:text-xs md:text-sm font-black font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                      {formatCurrency(totalFY)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block leading-none truncate max-w-17.5 sm:max-w-22.5">
                    {formatMonth(lastMonthName)}
                  </span>
                  <div className="flex items-baseline justify-end gap-0.5 mt-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400">₹</span>
                    <span className="text-[11px] sm:text-xs md:text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatCurrency(lastPayout)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Indicator Underline */}
              {isActive && (
                <div className={`absolute bottom-0 left-2 right-2 h-[2.5px] ${theme.bar} rounded-full`} />
              )}
            </button>
          );
        })}

        {activeArns.length === 0 && (
          <div className="col-span-full w-full py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
            No active ARN entities found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ARNSelectorStrip;