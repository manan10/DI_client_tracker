import React, { useState, useEffect, useRef } from "react";
import { Search, User, ArrowRight, X, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ADDED
import { useApi } from "../../hooks/useApi";

const UniversalSearch = () => { // REMOVED onClientSelect prop
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { request } = useApi();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate(); // ADDED

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
    navigate(`/client/${client._id}`); // ROUTE TO NEW PAGE
    setSearchTerm("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative group flex items-center">
        {/* SEARCH ANCHOR */}
        <div className="absolute left-3 w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-focus-within:scale-110 transition-all duration-300 z-10">
          <Search size={20} strokeWidth={3} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="SEARCH CLIENTS BY NAME OR PAN..."
          autoComplete="off"
          className="w-full pl-16 pr-20 py-5 
                     bg-white dark:bg-slate-800/80 
                     text-slate-900 dark:text-white 
                     border-2 border-slate-200 dark:border-white/10 
                     focus:border-green-600 dark:focus:border-green-500
                     rounded-3xl shadow-sm
                     text-base font-[1000] uppercase tracking-wider
                     placeholder:text-slate-400 dark:placeholder:text-slate-600 
                     outline-none transition-all duration-300"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* KEYBOARD HINT */}
        <div className="absolute right-4 hidden md:flex items-center gap-1.5 pointer-events-none group-focus-within:opacity-0 transition-opacity">
          <kbd className="px-2.5 py-1.5 text-[10px] font-black bg-green-50 dark:bg-green-500/10 border-2 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 rounded-lg">
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

      {/* RESULTS LIST */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute z-100 w-full mt-6 
                        bg-white dark:bg-slate-800 
                        border-2 border-green-500/30 dark:border-green-500/20 
                        rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] 
                        overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-5 border-b-2 border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center gap-3">
            <Zap size={14} className="text-green-500" fill="currentColor" />
            <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">
              Intelligence Database Results
            </p>
          </div>
          
          <div className="p-3 max-h-75 overflow-y-auto no-scrollbar space-y-2">
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => handleSelect(c)} 
                  className="flex items-center justify-between p-4 
                             bg-white dark:bg-slate-800/40 
                             border-2 border-slate-50 dark:border-white/5 
                             hover:border-green-600 dark:hover:border-green-500 
                             rounded-3xl cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 
                                    border-2 border-slate-100 dark:border-white/5 
                                    rounded-2xl flex items-center justify-center 
                                    text-slate-400 dark:text-slate-600
                                    group-hover:bg-green-600 group-hover:text-white transition-all">
                      <User size={24} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-green-600 transition-colors">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black px-2 py-0.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500 rounded border border-green-100 dark:border-green-500/20 tracking-widest font-mono">
                          {c.pan}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:bg-green-600 group-hover:text-white transition-all">
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