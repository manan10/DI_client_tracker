import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Clock, Inbox, CheckCircle, 
  Repeat, Wallet, LogOut, Layers, FileText, 
  ChevronRight, Activity, Landmark, Database
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import NewSubmission from './Submissions/NewSubmission';
import SubmissionDetail from './Submissions/SubmissionDetail';

const Submissions = () => {
  const { request } = useApi();
  
  // Registry State
  const [submissions, setSubmissions] = useState([]);
  const [activeCategory, setActiveCategory] = useState('PURCHASE_SIP');
  const [viewMode, setViewMode] = useState('ACTIVE'); // ACTIVE | FINALIZED
  const [searchTerm, setSearchTerm] = useState("");

  // Panel Control State
  const [isNewPanelOpen, setIsNewPanelOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  // 1. Unified Registry Sync Effect
  useEffect(() => {
    let isMounted = true;
    const loadRegistry = async () => {
      try {
        const res = await request('/submissions');
        if (res?.success && isMounted) {
          setSubmissions(res.data);
        }
      } catch (err) {
        console.error("Registry sync failed:", err);
      }
    };
    loadRegistry();
    return () => { isMounted = false; };
  }, [request]);

  // 2. Generate Counts for Command Tabs
  const counts = useMemo(() => {
    const map = {
      PURCHASE_SIP: 0,
      PURCHASE_LUMPSUM: 0,
      REDEMPTION: 0,
      SWP: 0,
      NON_FINANCIAL: 0
    };
    
    submissions.forEach(sub => {
      const isMatch = viewMode === 'FINALIZED' ? sub.isFinalized : !sub.isFinalized;
      if (isMatch && map[sub.type] !== undefined) {
        map[sub.type]++;
      }
    });
    return map;
  }, [submissions, viewMode]);

  const subTabs = [
    { id: 'PURCHASE_SIP', name: 'SIPs', icon: Repeat, color: 'text-emerald-500' },
    { id: 'PURCHASE_LUMPSUM', name: 'Lumpsum', icon: Wallet, color: 'text-emerald-500' },
    { id: 'REDEMPTION', name: 'Redemptions', icon: LogOut, color: 'text-rose-500' },
    { id: 'SWP', name: 'SWP Outflows', icon: Layers, color: 'text-rose-500' },
    { id: 'NON_FINANCIAL', name: 'Services', icon: FileText, color: 'text-blue-500' },
  ];

  // 3. Filtered Logic (View + Category + Search)
  const filteredData = useMemo(() => {
    return submissions.filter(sub => {
      const matchesView = viewMode === 'FINALIZED' ? sub.isFinalized : !sub.isFinalized;
      const matchesCategory = sub.type === activeCategory;
      const matchesSearch = 
        sub.schemeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.client?.pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesView && matchesCategory && matchesSearch;
    });
  }, [activeCategory, submissions, searchTerm, viewMode]);

  const handleRecordUpdate = (updatedRecord) => {
    setSubmissions(prev => 
      prev.map(s => s._id === updatedRecord._id ? updatedRecord : s)
    );
  };

  const handleRecordDelete = (deletedId) => {
    setSubmissions(prev => prev.filter(s => s._id !== deletedId));
  };

  // Helper for Displaying Dates
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* UPGRADED COMMAND HEADER */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6 relative z-10">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-emerald-500/10 rounded-lg md:rounded-2xl border border-emerald-500/20 shadow-inner">
                <Activity size={18} className="text-emerald-500 md:w-6 md:h-6" />
              </div>
              <div className="h-10 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />
              <div>
                <h2 className="text-xl md:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                  Submissions <span className="text-emerald-500">Desk</span>
                </h2>
                <div className="flex items-center gap-1.5 md:gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${viewMode === 'ACTIVE' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Client Ops / {viewMode === 'ACTIVE' ? 'Pending Tasks' : 'Finalized Vault'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
            {/* SEGMENTED VIEW TOGGLE */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg md:rounded-2xl shadow-inner h-10 md:h-14">
              <button 
                onClick={() => setViewMode('ACTIVE')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 rounded-md md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  viewMode === 'ACTIVE' 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm md:shadow-lg ring-1 ring-slate-200 dark:ring-white/10' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Inbox size={14} /> Active
              </button>
              <button 
                onClick={() => setViewMode('FINALIZED')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 md:gap-3 px-4 md:px-8 rounded-md md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  viewMode === 'FINALIZED' 
                  ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm md:shadow-lg ring-1 ring-slate-200 dark:ring-white/10' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <CheckCircle size={14} /> Historical
              </button>
            </div>

            {/* SEARCH & ADD GROUP */}
            <div className="flex items-center gap-2 h-10 md:h-14">
              <div className="relative flex-1 sm:w-72 h-full">
                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-full pl-9 md:pl-12 pr-4 bg-white dark:bg-[#0D0E12] border border-slate-200 dark:border-white/10 rounded-lg md:rounded-2xl text-[10px] md:text-[11px] font-bold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm uppercase tracking-tight"
                />
              </div>
              <button 
                onClick={() => setIsNewPanelOpen(true)}
                className="group relative h-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-6 bg-emerald-600 text-white rounded-lg md:rounded-2xl text-[11px] font-[1000] uppercase tracking-widest shadow-md md:shadow-2xl transition-all hover:scale-[1.03] active:scale-95 overflow-hidden w-10 sm:w-auto shrink-0"
              >
                <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Plus size={16} strokeWidth={3} className="relative z-10 md:w-4.5 md:h-4.5" />
                <span className="relative z-10 hidden sm:inline text-nowrap">New Submission</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMMAND CATEGORY CARDS */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:flex md:flex-row md:items-center md:gap-4 overflow-x-auto md:no-scrollbar md:-mx-4 md:px-4 lg:mx-0 lg:px-0">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`w-full md:min-w-45 flex-col items-start gap-1 md:gap-1.5 p-3 md:px-6 md:py-5 rounded-xl md:rounded-4xl border transition-all duration-500 relative
              last:col-span-2 sm:last:col-span-1 md:last:col-span-auto
              ${activeCategory === tab.id 
                ? 'bg-white dark:bg-[#0D0E12] border-emerald-500 shadow-md md:shadow-2xl shadow-emerald-500/10 md:-translate-y-1' 
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/5'}
            `}
          >
            <div className="flex items-center justify-between w-full">
              <div className={`p-1.5 md:p-2.5 rounded-md md:rounded-xl transition-colors ${activeCategory === tab.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                <tab.icon size={14} className="md:w-4.5 md:h-4.5" strokeWidth={2.5} />
              </div>
              <span className={`text-sm md:text-base font-black tabular-nums tracking-tighter ${activeCategory === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {counts[tab.id] || 0}
              </span>
            </div>
            <span className={`text-[9px] md:text-[10px] font-[1000] uppercase tracking-[0.15em] mt-1 md:mt-2 w-full text-left truncate ${activeCategory === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {tab.name}
            </span>
          </button>
        ))}
      </div>

      {/* CONTENT REGISTRY */}
      <div className="bg-white dark:bg-[#0A0B0D] border border-slate-200 dark:border-white/5 rounded-xl md:rounded-[2.5rem] shadow-sm md:shadow-2xl overflow-hidden min-h-75 md:min-h-100">
        
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Date & Detail</th>
                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Client Info</th>
                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Other Information</th>
                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Logistics</th>
                <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredData.map((sub) => (
                <tr 
                  key={sub._id} 
                  onClick={() => { setSelectedSubmissionId(sub._id); setIsDetailOpen(true); }}
                  className="group hover:bg-slate-50/50 dark:hover:bg-white/1 transition-all cursor-pointer"
                >
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Clock size={10} /> {formatDisplayDate(sub.creationDate || sub.createdAt)}
                      </p>
                      <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">
                        {sub.schemeName || sub.subType?.replace(/_/g, ' ')}
                      </div>
                      {sub.type !== 'NON_FINANCIAL' ? (
                        <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sub.amount)}
                        </p>
                      ) : (
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                          <Activity size={10} /> Service Item
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{sub.client?.name}</p>
                    <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">{sub.client?.pan}</p>
                  </td>
                  <td className="px-10 py-6 max-w-50">
                    {sub.metadata && Object.keys(sub.metadata).length > 0 ? (
                      <div className="space-y-1.5">
                        {Object.entries(sub.metadata).slice(0, 2).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest truncate">
                            <span className="text-slate-400 shrink-0">{k}:</span>
                            <span className="text-slate-700 dark:text-slate-300 truncate">{String(v)}</span>
                          </div>
                        ))}
                        {Object.keys(sub.metadata).length > 2 && (
                          <span className="inline-flex items-center gap-1 text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded tracking-widest">
                            <Database size={8} /> +{Object.keys(sub.metadata).length - 2} MORE
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-slate-200 dark:text-white/10 uppercase tracking-widest">—</span>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-white/5 px-2 py-1 rounded">
                      {sub.type === 'NON_FINANCIAL' ? 'DOCS: VERIFIED' : `PAY: ${sub.paymentStatus}`}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest
                      ${sub.status === 'REJECTED' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 
                        sub.status === 'SETTLED' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 
                        'bg-blue-500/5 border-blue-500/20 text-blue-500'}`}>
                      {sub.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
          {filteredData.map((sub) => (
            <div 
              key={sub._id} 
              onClick={() => { setSelectedSubmissionId(sub._id); setIsDetailOpen(true); }}
              className="p-4 active:bg-slate-50 dark:active:bg-white/5 transition-all flex flex-col gap-3 cursor-pointer"
            >
              <div className="flex items-start justify-between w-full gap-2">
                 <div className="flex items-center gap-2 min-w-0">
                    <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${sub.status === 'SETTLED' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">
                      {sub.schemeName || sub.subType?.replace(/_/g, ' ')}
                    </p>
                 </div>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded">
                    {formatDisplayDate(sub.creationDate || sub.createdAt)}
                 </span>
              </div>
              
              <div className="flex justify-between items-end gap-2 pl-3.5">
                 <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 uppercase truncate">{sub.client?.name}</p>
                    {sub.type !== 'NON_FINANCIAL' ? (
                      <p className="text-[13px] font-black text-slate-900 dark:text-white tabular-nums tracking-tighter truncate mt-0.5">
                         {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sub.amount)}
                      </p>
                    ) : (
                      <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">Request Item</p>
                    )}
                 </div>
                 <div className="flex flex-col items-end gap-1.5 shrink-0">
                   <ChevronRight size={14} className="text-slate-300" />
                   <span className={`text-[7px] font-black uppercase tracking-widest ${sub.status === 'SETTLED' ? 'text-emerald-500' : sub.status === 'REJECTED' ? 'text-rose-500' : 'text-blue-500'}`}>
                     {sub.status}
                   </span>
                 </div>
              </div>

              {/* HORIZONTAL METADATA SCROLL FOR MOBILE */}
              {sub.metadata && Object.keys(sub.metadata).length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 pl-3.5 pb-1">
                  {Object.entries(sub.metadata).map(([k, v]) => (
                    <div key={k} className="shrink-0 flex items-center gap-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest max-w-35">
                      <span className="text-slate-400 shrink-0">{k}:</span>
                      <span className="text-slate-700 dark:text-slate-300 truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {filteredData.length === 0 && (
          <div className="px-6 py-16 md:py-24 text-center flex flex-col items-center opacity-20">
            <Landmark size={32} className="mb-3 text-slate-400 md:w-12 md:h-12 md:mb-4" />
            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Registry List Clear</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      <NewSubmission 
        isOpen={isNewPanelOpen} 
        onClose={() => setIsNewPanelOpen(false)} 
        onCreated={(newSub) => { 
          setSubmissions(prev => [newSub, ...prev]); 
          setActiveCategory(newSub.type); 
        }}
      />

      <SubmissionDetail 
        submissionId={selectedSubmissionId}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedSubmissionId(null); }}
        onUpdate={handleRecordUpdate}
        onDelete={handleRecordDelete}
      />
    </div>
  );
};

export default Submissions;