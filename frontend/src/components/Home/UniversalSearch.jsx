import React, { useState, useEffect, useRef } from "react";
import { Search, User, ArrowRight, X, Command, Zap } from "lucide-react";
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
        setClients(data || []);
      } catch (err) { 
        console.error("Search fetch error:", err); 
      }
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
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
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
        {/* 1. VIBRANT SEARCH ANCHOR - Solid orange makes it impossible to miss */}
        <div className="absolute left-3 w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-focus-within:scale-110 transition-all duration-300">
          <Search size={20} strokeWidth={3} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="SEARCH CLIENTS BY NAME OR PAN..."
          autoComplete="off"
          /* 2. HIGH CONTRAST INPUT 
             - Light: Deep slate background for "recessed" look
             - Border: Thick 2px with orange focus
          */
          className="w-full pl-16 pr-20 py-5 
                     bg-slate-100 dark:bg-[#0a0c12] 
                     text-slate-950 dark:text-white 
                     border-2 border-slate-300 dark:border-white/10 
                     focus:bg-white dark:focus:bg-black 
                     focus:border-orange-600 dark:focus:border-orange-500
                     rounded-3xl shadow-inner
                     text-base font-[1000] uppercase tracking-wider
                     placeholder:text-slate-500 dark:placeholder:text-slate-700 
                     outline-none transition-all duration-300"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* 3. COLORED KEYBOARD HINT */}
        <div className="absolute right-4 hidden md:flex items-center gap-1.5 pointer-events-none group-focus-within:opacity-0 transition-opacity">
          <kbd className="px-2.5 py-1.5 text-[10px] font-black bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg shadow-sm">
            CMD + K
          </kbd>
        </div>

        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute right-4 p-2 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
          >
            <X size={18} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* 4. RESULTS - Now using solid background contrast to "cut" through the page */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute z-100 w-full mt-6 
                        bg-white dark:bg-[#080a0f] 
                        border-2 border-orange-500/30 dark:border-orange-500/20 
                        rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] 
                        overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-5 border-b-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/2 flex items-center gap-3">
            <Zap size={14} className="text-orange-500" fill="currentColor" />
            <p className="text-[11px] font-[1000] text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">
              Intelligence Database Results
            </p>
          </div>
          
          <div className="p-3 max-h-125 overflow-y-auto no-scrollbar space-y-2">
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => handleSelect(c)} 
                  className="flex items-center justify-between p-4 
                             bg-white dark:bg-[#0e1117] 
                             border-2 border-slate-100 dark:border-white/5 
                             hover:border-orange-600 dark:hover:border-orange-500 
                             rounded-3xl cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-5">
                    {/* RESULT AVATAR WELL */}
                    <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 
                                    border-2 border-slate-200 dark:border-white/5 
                                    rounded-2xl flex items-center justify-center 
                                    text-slate-400 dark:text-slate-700
                                    group-hover:bg-orange-600 group-hover:text-white 
                                    group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all">
                      <User size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[16px] font-[1000] text-slate-950 dark:text-white uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 rounded border border-orange-100 dark:border-orange-500/20 tracking-widest font-mono">
                          {c.pan}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <ArrowRight size={20} strokeWidth={3} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center">
                <p className="text-[12px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.3em]">
                  No Records Found
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalSearch;