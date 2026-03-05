import React, { useState, useEffect, useRef } from "react";
import { Search, User, ArrowRight, X } from "lucide-react";
import { useApi } from "../../hooks/useApi";

const UniversalSearch = ({ onClientSelect }) => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { request } = useApi();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await request("/clients/");
        setClients(data);
      } catch (err) { console.error(err); }
    };
    fetchClients();

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [request]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.pan?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 6);

  const handleSelect = (client) => {
    onClientSelect(client);
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative group flex items-center">
        <Search className="absolute left-4 text-slate-400 dark:text-slate-500 group-focus-within:text-amber-600 transition-colors" size={18} />
        
        <input
          ref={inputRef}
          type="text"
          placeholder="SEARCH CLIENTS..."
          className="w-full pl-12 pr-16 py-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-amber-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-[11px] font-black text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all duration-300 uppercase tracking-widest shadow-sm focus:shadow-md"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* Keyboard Shortcut Hint */}
        <div className="absolute right-4 flex items-center gap-1 pointer-events-none group-focus-within:opacity-0 transition-opacity">
          <kbd className="px-1.5 py-0.5 text-[9px] font-black bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-300 rounded-md shadow-sm">
            {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'CTRL'}
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[9px] font-black bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-300 rounded-md shadow-sm">
            K
          </kbd>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute z-70 w-full mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Client Results</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => handleSelect(c)} 
                  className="flex items-center justify-between p-4 hover:bg-amber-50/40 dark:hover:bg-amber-900/10 cursor-pointer group border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-amber-600 shadow-sm transition-all">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase">
                        {c.pan}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase italic">
                No matches
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;