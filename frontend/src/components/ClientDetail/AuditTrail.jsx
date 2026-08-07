import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Filter, Plus, X, ChevronDown, Clock, Calendar, 
  Edit3, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react';

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const AuditTrail = ({ 
  interactions = [], 
  filterDate, 
  setFilterDate, 
  onAddClick, 
  onEditClick, 
  onDeleteClick 
}) => {
  // Custom Picker States
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(filterDate ? filterDate.getFullYear() : new Date().getFullYear());
  const pickerRef = useRef(null);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter & Sort Logic (Newest First)
  const filteredInteractions = useMemo(() => {
    if (!interactions) return [];
    
    let processed = interactions;

    // 1. Filter by Month/Year if selected
    if (filterDate) {
      processed = processed.filter(log => {
        const logDate = new Date(log.date || log.createdAt);
        return (
          logDate.getMonth() === filterDate.getMonth() && 
          logDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }

    // 2. Sort Newest to Oldest
    return processed.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [interactions, filterDate]);

  const handleMonthSelect = (monthIndex) => {
    setFilterDate(new Date(viewYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  const handleClearFilter = (e) => {
    e.stopPropagation();
    setFilterDate(null);
    setIsPickerOpen(false);
  };

  return (
    <div className="mb-20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Filter Input Wrapper */}
        <div className="flex-1 flex items-center gap-4 bg-white dark:bg-slate-800 p-2 pl-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 shrink-0">
            <Filter size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline-block">Filter Ledger</span>
          </div>

          {/* Custom Date Picker Trigger */}
          <div className="relative flex-1" ref={pickerRef}>
            <div 
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className={`w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 text-[11px] font-black uppercase tracking-tighter px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                isPickerOpen ? 'border-emerald-500/50 ring-2 ring-emerald-500/10' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <span className={filterDate ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}>
                {filterDate 
                  ? filterDate.toLocaleString('default', { month: 'long', year: 'numeric' }) 
                  : "ALL HISTORY"}
              </span>
              
              {filterDate ? (
                <button 
                  onClick={handleClearFilter} 
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                >
                  <X size={14} />
                </button>
              ) : (
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isPickerOpen ? 'rotate-180' : ''}`} />
              )}
            </div>

            {/* Custom Popover Calendar */}
            {isPickerOpen && (
              <div className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Year Header */}
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setViewYear(y => y - 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                    {viewYear}
                  </span>
                  <button 
                    onClick={() => setViewYear(y => y + 1)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {/* Month Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((month, index) => {
                    const isSelected = filterDate && filterDate.getMonth() === index && filterDate.getFullYear() === viewYear;
                    return (
                      <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                          isSelected 
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600'
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 bg-slate-950 dark:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus size={14} /> Log Interaction
        </button>
      </div>

      {/* Audit Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-10 transition-colors duration-300">
        {filteredInteractions.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-4 space-y-12">
            {filteredInteractions.map((log) => {
              const logDate = new Date(log.date || log.createdAt);
              return (
                <div key={log._id || log.id} className="relative pl-8 sm:pl-12 group">
                  {/* Visual Connector Dot */}
                  <div className="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-4 border-emerald-500 shadow-sm transition-transform group-hover:scale-125" />
                  
                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      
                      {/* Date & Time display */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <time className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest">
                            {logDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </time>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {logDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                          </span>
                        </div>

                        <span className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {log.type}
                        </span>
                        
                        {/* If this is from the combined family feed, show who the log belongs to */}
                        {log.memberName && !log.isCurrentClient && (
                          <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                            {log.memberName}
                          </span>
                        )}
                      </div>

                      {/* ALWAYS VISIBLE ACTION ICONS */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => onEditClick(log)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg transition-all shadow-sm hover:shadow"
                          title="Edit Revision"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => onDeleteClick(log._id || log.id)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg transition-all shadow-sm hover:shadow"
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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 animate-in fade-in duration-500">
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