import React, { useState, useEffect, useRef } from "react";
import { Search, User, ArrowRight, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { useApi } from "../../hooks/useApi";

const UniversalSearch = () => { 
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { request } = useApi();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await request("/clients/");
        if (res?.success) {
          setClients(res.data || []);
        } else {
          setClients([]);
        }
      } catch (err) { 
        console.error("Search fetch error:", err); 
        setClients([]); 
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

  const filteredClients = clients?.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.pan?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 6);

  const handleSelect = (client) => {
    navigate(`/client/${client._id}`); 
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative group flex items-center">
        {/* SEARCH ANCHOR: Original High-Vis Green */}
        <div className="absolute left-2.5 md:left-3 w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-focus-within:scale-105 transition-all duration-300 z-10">
          <Search size={16} md:size={20} strokeWidth={3} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="SEARCH CLIENTS BY NAME OR PAN..."
          autoComplete="off"
          className="w-full pl-12 md:pl-16 pr-12 md:pr-16 py-3.5 md:py-5 
                     bg-white dark:bg-slate-800/80 
                     text-slate-900 dark:text-white 
                     border-2 border-slate-200 dark:border-white/10 
                     focus:border-green-600 dark:focus:border-green-500
                     rounded-lg md:rounded-xl shadow-sm
                     text-sm md:text-base font-[1000] uppercase tracking-wider
                     placeholder:text-slate-400 dark:placeholder:text-slate-600 
                     outline-none transition-all duration-300"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* KEYBOARD HINT: Original High-Vis Green Key */}
        <div className="absolute right-4 hidden md:flex items-center gap-1.5 pointer-events-none group-focus-within:opacity-0 transition-opacity">
          <kbd className="px-2.5 py-1.5 text-[10px] font-black bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
            CMD + K
          </kbd>
        </div>

        {searchTerm && (
          <button 
            onClick={() => setSearchTerm("")}
            className="absolute right-3.5 p-1.5 md:p-2 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg md:rounded-xl hover:bg-red-600 hover:text-white transition-all"
          >
            <X size={16} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* RESULTS LIST: Sharper Corners, Compact, Colors Intact */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute z-100 w-full mt-2 
                        bg-white dark:bg-slate-800 
                        border-2 border-slate-300 dark:border-slate-700
                        rounded-lg md:rounded-xl shadow-2xl
                        overflow-hidden animate-in fade-in zoom-in-98 duration-200">
          
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center gap-2">
            <Zap size={12} className="text-green-500" fill="currentColor" />
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              Intelligence Database Results
            </p>
          </div>
          
          <div className="p-2 md:p-3 max-h-75 overflow-y-auto no-scrollbar space-y-1 md:space-y-2">
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => handleSelect(c)} 
                  className="flex items-center justify-between p-3 md:p-4 
                             bg-white dark:bg-slate-800/40 
                             border border-transparent
                             hover:border-green-600 dark:hover:border-green-500 
                             rounded-lg md:rounded-xl cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3 md:gap-5">
                    {/* Compacted mobile icon but original hover/colors intact */}
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-50 dark:bg-white/5 
                                    border-2 border-slate-100 dark:border-white/5 
                                    rounded-lg md:rounded-2xl flex items-center justify-center 
                                    text-slate-400 dark:text-slate-600
                                    group-hover:bg-green-600 group-hover:text-white transition-all">
                      <User size={18} md:size={24} strokeWidth={3} />
                    </div>
                    <div>
                      {/* Compacted text size on mobile but colors intact */}
                      <p className="text-xs md:text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-green-600 transition-colors">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] md:text-[10px] font-black px-1.5 py-0.5 md:px-2 md:py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 rounded border border-green-100 dark:border-green-500/20 tracking-widest font-mono">
                          {c.pan}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Original High-Vis Green hover state restored */}
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <ArrowRight size={18} md:size={20} strokeWidth={3} />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 md:p-20 text-center">
                <p className="text-[10px] md:text-[12px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.3em]">
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