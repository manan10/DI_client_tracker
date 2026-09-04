import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const DateTimePicker = ({ value, onChange, placeholder = "Select Date & Time", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse initial value or default to now
  const initialDate = value ? new Date(value) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  
  // Time states
  const [hours, setHours] = useState(initialDate.getHours() % 12 || 12);
  const [minutes, setMinutes] = useState(initialDate.getMinutes());
  const [period, setPeriod] = useState(initialDate.getHours() >= 12 ? 'PM' : 'AM');

  const containerRef = useRef(null);

  const daysInWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Calendar logic
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handleDateSelect = (day) => {
    let newHours = period === 'PM' && hours !== 12 ? hours + 12 : hours;
    if (period === 'AM' && hours === 12) newHours = 0;

    const newDate = new Date(currentYear, currentMonth, day, newHours, minutes);
    
    // Format to local ISO string (YYYY-MM-DDTHH:mm)
    const offset = newDate.getTimezoneOffset() * 60000;
    const formattedDate = new Date(newDate.getTime() - offset).toISOString().slice(0, 16);
    
    onChange(formattedDate);
    setIsOpen(false); // Close after picking the date (user can reopen to tweak time)
  };

  const handleTimeChange = (type, val) => {
    let newH = hours;
    let newM = minutes;
    let newP = period;

    if (type === 'H') newH = parseInt(val) || 12;
    if (type === 'M') newM = parseInt(val) || 0;
    if (type === 'P') newP = val;

    setHours(newH);
    setMinutes(newM);
    setPeriod(newP);

    // Apply to current selected date
    let militaryHours = newP === 'PM' && newH !== 12 ? newH + 12 : newH;
    if (newP === 'AM' && newH === 12) militaryHours = 0;

    const currentSelected = value ? new Date(value) : new Date();
    currentSelected.setHours(militaryHours);
    currentSelected.setMinutes(newM);

    const offset = currentSelected.getTimezoneOffset() * 60000;
    const formattedDate = new Date(currentSelected.getTime() - offset).toISOString().slice(0, 16);
    onChange(formattedDate);
  };

  // UI Formatting
  const formatDisplay = () => {
    if (!value) return placeholder;
    const d = new Date(value);
    return d.toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const selectedDate = value ? new Date(value) : null;

    // Blank spaces for offset
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate && 
                         selectedDate.getDate() === day && 
                         selectedDate.getMonth() === currentMonth && 
                         selectedDate.getFullYear() === currentYear;
                         
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === currentMonth && 
                      new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
            isSelected 
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
              : isToday 
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center h-11 px-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:border-slate-400 dark:focus:border-emerald-500/50 transition-all outline-none font-bold disabled:opacity-50"
      >
        <CalendarIcon size={14} className="text-slate-400 mr-3 shrink-0" />
        <span className="flex-1 text-left truncate">{formatDisplay()}</span>
        <Clock size={14} className="text-slate-400 ml-2 shrink-0" />
      </button>

      {/* CUSTOM POPOVER */}
      {isOpen && (
        <div className="absolute z-9999 top-full left-0 mt-2 p-4 w-72 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
          
          {/* HEADER: Month & Year */}
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                else { setCurrentMonth(currentMonth - 1); }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
              {monthsList[currentMonth]} {currentYear}
            </span>
            <button 
              type="button"
              onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                else { setCurrentMonth(currentMonth + 1); }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* CALENDAR GRID */}
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysInWeek.map(d => (
                <div key={d} className="w-8 text-center text-[10px] font-black uppercase text-slate-400">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          {/* DIVIDER */}
          <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

          {/* TIME CONTROLS */}
          <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-1">
              <select 
                value={hours} 
                onChange={(e) => handleTimeChange('H', e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold p-1 outline-none text-center appearance-none w-10 text-slate-800 dark:text-white cursor-pointer"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
                ))}
              </select>
              <span className="text-slate-400 font-black">:</span>
              <select 
                value={minutes} 
                onChange={(e) => handleTimeChange('M', e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold p-1 outline-none text-center appearance-none w-10 text-slate-800 dark:text-white cursor-pointer"
              >
                {[...Array(60)].map((_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
                ))}
              </select>
            </div>

            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-0.5">
              <button 
                type="button"
                onClick={() => handleTimeChange('P', 'AM')}
                className={`px-2 py-1 text-[10px] font-black rounded cursor-pointer transition-colors ${period === 'AM' ? 'bg-slate-900 text-white dark:bg-emerald-500' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                AM
              </button>
              <button 
                type="button"
                onClick={() => handleTimeChange('P', 'PM')}
                className={`px-2 py-1 text-[10px] font-black rounded cursor-pointer transition-colors ${period === 'PM' ? 'bg-slate-900 text-white dark:bg-emerald-500' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                PM
              </button>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;