import React, { useState, useEffect, useRef } from "react";
import { Search, User, ArrowRight, X, Command, Activity } from "lucide-react";
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
      
      {/* 1. THE COMMAND INPUT */}
      <div className="relative flex items-center w-full group">
        
        {/* Dynamic Search Icon - Lights up on focus */}
        <div className="absolute left-3.5 flex items-center justify-center text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300 pointer-events-none">
          <Search className="w-4 h-4" strokeWidth={2.5} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by Name or PAN..."
          autoComplete="off"
          className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-[#0B1120] text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-white/10 rounded-md outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />

        {/* Action Controls (Right) */}
        <div className="absolute right-2 flex items-center gap-1.5 z-10">
          {searchTerm ? (
            <button 
              onClick={() => {
                setSearchTerm("");
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors focus:outline-none"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-sm pointer-events-none select-none group-focus-within:opacity-0 transition-opacity duration-200">
              <Command className="w-3 h-3" strokeWidth={2} /> K
            </div>
          )}
        </div>
      </div>

      {/* 2. THE RESULTS PALETTE */}
      {isOpen && searchTerm.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md shadow-xl dark:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Header Bar */}
          <div className="px-3 py-2 bg-slate-50/80 dark:bg-white/2 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Directory Matches
            </span>
          </div>
          
          {/* Scrollable Results */}
          <div className="max-h-[50vh] overflow-y-auto p-1.5 scroll-smooth">
            {filteredClients.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {filteredClients.map((c) => (
                  <button 
                    key={c._id} 
                    onClick={() => handleSelect(c)} 
                    className="group relative flex items-center justify-between w-full p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-sm cursor-pointer transition-all outline-none focus:bg-slate-50 dark:focus:bg-white/5 text-left border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                  >
                    
                    {/* Left: Info Stack */}
                    <div className="flex items-center gap-3 min-w-0">
                      
                      {/* Avatar Square - Interactive Color Swap */}
                      <div className="w-8 h-8 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-white transition-all duration-300 shrink-0">
                        <User className="w-4 h-4" strokeWidth={2.5} />
                      </div>
                      
                      {/* Name & Badge Container */}
                      <div className="flex flex-col items-start min-w-0">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {c.name}
                        </span>
                        
                        {/* Sharp Tech Badge for PAN */}
                        <span className="mt-0.5 inline-flex items-center px-1.5 py-0.5 rounded-[3px] text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 tracking-widest">
                          {c.pan}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right: Slide-in Action Arrow */}
                    <div className="w-6 h-6 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 shrink-0 ml-2 overflow-hidden">
                      <ArrowRight className="w-4 h-4 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" strokeWidth={2.5} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              
              /* Empty State */
              <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-sm bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center mb-3">
                  <Search className="w-4 h-4 text-slate-400" strokeWidth={2} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                  No records found
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-55">
                  Adjust your search criteria to find missing clients.
                </span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default UniversalSearch;