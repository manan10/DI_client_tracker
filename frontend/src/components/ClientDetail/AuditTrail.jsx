import React, { useMemo } from 'react';
import { Filter, Plus, X, ChevronDown, Clock, Calendar, Edit3, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';

const AuditTrail = ({ 
  interactions = [], 
  filterDate, 
  setFilterDate, 
  onAddClick, 
  onEditClick, 
  onDeleteClick 
}) => {
  const filteredInteractions = useMemo(() => {
    if (!interactions) return [];
    if (!filterDate) return interactions;

    return interactions.filter(log => {
      const logDate = new Date(log.date);
      return (
        logDate.getMonth() === filterDate.getMonth() && 
        logDate.getFullYear() === filterDate.getFullYear()
      );
    });
  }, [interactions, filterDate]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-4 bg-white dark:bg-slate-800 p-2 pl-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter Ledger</span>
          </div>

          <div className="relative flex-1 group">
            <DatePicker
              selected={filterDate}
              onChange={(date) => setFilterDate(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              placeholderText="ALL HISTORY"
              className="w-full bg-slate-50 dark:bg-slate-900 text-[11px] font-black uppercase tracking-tighter text-slate-800 dark:text-emerald-400 px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-emerald-500/50 transition-all cursor-pointer text-center"
              calendarClassName="custom-emerald-calendar"
            />
            {filterDate ? (
              <button 
                onClick={() => setFilterDate(null)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            ) : (
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            )}
          </div>
        </div>

        <button 
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 bg-slate-950 dark:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-md active:scale-95"
        >
          <Plus size={14} /> Log Interaction
        </button>
      </div>

      {/* Audit Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-10 transition-colors duration-300">
        {filteredInteractions.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-4 space-y-12">
            {filteredInteractions.map((log) => (
              <div key={log._id} className="relative pl-8 sm:pl-12 group">
                {/* Visual Connector Dot */}
                <div className="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-4 border-emerald-500 shadow-sm transition-transform" />
                
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <time className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest">
                        {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </time>
                      <span className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {log.type}
                      </span>
                    </div>

                    {/* ALWAYS VISIBLE ACTION ICONS */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEditClick(log)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg transition-all shadow-sm"
                        title="Edit Revision"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => onDeleteClick(log._id)}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg transition-all shadow-sm"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {log.discussionPoints?.length > 0 && (
                    <div className="flex flex-wrap gap-2.5">
                      {log.discussionPoints.map((pt, i) => (
                        <span key={i} className="text-[9px] font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 rounded">
                          {pt}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-sm font-semibold text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {log.summary}
                  </div>

                  {log.followUpRequired && log.followUpDate && (
                    <div className="flex items-center gap-2 mt-1 text-[10.5px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">
                      <Calendar size={12} /> Follow up due: {new Date(log.followUpDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Clock className="mx-auto text-slate-300 dark:text-slate-600 mb-5" size={48} />
            <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest mb-2.5">Timeline is Quiet</h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              Select a different date or log a new interaction to populate this view.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;