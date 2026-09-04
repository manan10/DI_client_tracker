import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SalesDatePickerModal = ({
  activePickerId,
  pickerNav,
  monthsList = [],
  weekDays = [],
  calendarGridData,
  activeTx,
  onShiftMonth,
  onSelectDate,
  onClose
}) => {
  if (!activePickerId) return null;

  return createPortal(
    <div className="fixed inset-0 z-300 flex items-center justify-center pointer-events-auto">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl w-[90%] max-w-[320px] animate-in zoom-in-95 duration-100 text-left font-sans">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-3 select-none">
          <button 
            type="button"
            onClick={() => onShiftMonth(-1)} 
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {monthsList[pickerNav.month - 1]} {pickerNav.year}
          </span>
          <button 
            type="button"
            onClick={() => onShiftMonth(1)} 
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase text-slate-400 mb-2 select-none">
          {weekDays.map(d => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: calendarGridData.firstDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          {Array.from({ length: calendarGridData.totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const computedDateStr = `${pickerNav.year}-${String(pickerNav.month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = activeTx?.invoiceBillingDate === computedDateStr;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => onSelectDate(computedDateStr)}
                className={`p-2 text-xs font-mono font-bold rounded-lg text-center transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white' 
                    : 'hover:bg-indigo-500/10 hover:text-indigo-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SalesDatePickerModal;