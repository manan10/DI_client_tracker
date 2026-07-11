import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Clock, Inbox, CheckCircle, 
  Repeat, Wallet, LogOut, Layers, FileText, 
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Activity, Landmark, ArrowUpDown, Copy, Check,
  Hash, Fingerprint, MapPin, CreditCard, AlertOctagon, 
  Paperclip, MessageSquare
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

  // Sort & Pagination State
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 
  const [prevFilters, setPrevFilters] = useState({ searchTerm, activeCategory, viewMode });

  // Panel Control & Copy State
  const [isNewPanelOpen, setIsNewPanelOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [copiedId, setCopiedId] = useState(null); // Tracks which element was just copied

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

  // 2. Render-phase state reset for Pagination
  if (
    searchTerm !== prevFilters.searchTerm || 
    activeCategory !== prevFilters.activeCategory || 
    viewMode !== prevFilters.viewMode
  ) {
    setCurrentPage(1);
    setPrevFilters({ searchTerm, activeCategory, viewMode });
  }

  // 3. Generate Counts for Command Tabs
  const counts = useMemo(() => {
    const map = { PURCHASE_SIP: 0, PURCHASE_LUMPSUM: 0, REDEMPTION: 0, SWP: 0, NON_FINANCIAL: 0 };
    submissions.forEach(sub => {
      const isMatch = viewMode === 'FINALIZED' ? sub.isFinalized : !sub.isFinalized;
      if (isMatch && map[sub.type] !== undefined) map[sub.type]++;
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

  // 4. Pipeline: Filter -> Sort -> Paginate
  const processedData = useMemo(() => {
    let result = submissions.filter(sub => {
      const matchesView = viewMode === 'FINALIZED' ? sub.isFinalized : !sub.isFinalized;
      const matchesCategory = sub.type === activeCategory;
      const matchesSearch = 
        sub.schemeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.client?.pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.folioNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.rtaReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesView && matchesCategory && matchesSearch;
    });

    result.sort((a, b) => {
      if (sortConfig.key === 'date') {
        const dateA = new Date(a.creationDate || a.createdAt).getTime();
        const dateB = new Date(b.creationDate || b.createdAt).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      if (sortConfig.key === 'client') {
        const nameA = (a.client?.name || '').toLowerCase();
        const nameB = (b.client?.name || '').toLowerCase();
        return sortConfig.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      return 0;
    });

    return result;
  }, [activeCategory, submissions, searchTerm, viewMode, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // Event Handlers
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleRecordUpdate = (updatedRecord) => {
    setSubmissions(prev => prev.map(s => s._id === updatedRecord._id ? updatedRecord : s));
  };
  const handleRecordDelete = (deletedId) => {
    setSubmissions(prev => prev.filter(s => s._id !== deletedId));
  };

  const handleCopy = (e, text, id) => {
    e.stopPropagation(); // Prevents row click
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // UI Helpers
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-emerald-500" /> : <ChevronDown size={12} className="text-emerald-500" />;
  };

  // Reusable Copy Button Component
  const CopyBtn = ({ text, id }) => {
    const isCopied = copiedId === id;
    return (
      <button
        onClick={(e) => handleCopy(e, text, id)}
        className="ml-1.5 p-0.5 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
        title="Copy to clipboard"
      >
        {isCopied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
      </button>
    );
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* COMMAND HEADER */}
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-6 relative z-10">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-2 md:p-3 bg-emerald-500/10 rounded-lg md:rounded-xl border border-emerald-500/20 shadow-inner">
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
            <div className="inline-flex p-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg md:rounded-lg shadow-inner h-10 md:h-14">
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
                  placeholder="Search (Client, Scheme, Folio...)" 
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
            className={`w-full md:min-w-45 flex-col items-start gap-1 md:gap-1.5 p-3 md:px-6 md:py-5 rounded-xl md:rounded-2xl border transition-all duration-500 relative
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
      <div className="bg-white dark:bg-[#0A0B0D] border border-slate-200 dark:border-white/5 rounded-xl md:rounded-2xl shadow-sm md:shadow-2xl overflow-hidden flex flex-col min-h-100">
        
        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                <th onClick={() => handleSort('client')} className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors w-1/5">
                  <div className="flex items-center gap-2">Client Info {renderSortIcon('client')}</div>
                </th>
                <th onClick={() => handleSort('date')} className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors w-1/4">
                  <div className="flex items-center gap-2">Transaction Details {renderSortIcon('date')}</div>
                </th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left w-1/4">Execution & Logistics</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Notes & Meta</th>
                <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {paginatedData.map((sub) => (
                <tr 
                  key={sub._id} 
                  onClick={() => { setSelectedSubmissionId(sub._id); setIsDetailOpen(true); }}
                  className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  {/* CLIENT INFO */}
                  <td className="px-8 py-5 align-top">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{sub.client?.name}</p>
                    {sub.client?.pan && (
                      <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase mt-1 flex items-center">
                        {sub.client.pan} <CopyBtn text={sub.client.pan} id={`${sub._id}-pan`} />
                      </p>
                    )}
                  </td>

                  {/* TRANSACTION DETAILS */}
                  <td className="px-8 py-5 align-top">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Clock size={10} /> {formatDisplayDate(sub.creationDate)}
                      </p>
                      <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight max-w-50 truncate" title={sub.schemeName || sub.subType}>
                        {sub.schemeName || sub.subType?.replace(/_/g, ' ')}
                      </div>
                      
                      <div className="flex flex-col items-start gap-1.5 mt-2">
                        {sub.type !== 'NON_FINANCIAL' ? (
                          <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sub.amount)}
                          </p>
                        ) : (
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={10} /> Service
                          </p>
                        )}
                        
                        {/* UPGRADED FOLIO NUMBER BLOCK */}
                        <div className="flex items-center">
                          <span className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest bg-slate-200/60 dark:bg-white/10 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700">
                            FOLIO: {sub.folioNumber || 'NEW'}
                          </span>
                          {sub.folioNumber && <CopyBtn text={sub.folioNumber} id={`${sub._id}-folio`} />}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* EXECUTION & LOGISTICS */}
                  <td className="px-8 py-5 align-top">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${sub.submissionMode === 'PHYSICAL' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                          {sub.submissionMode === 'PHYSICAL' ? <MapPin size={8} /> : <Fingerprint size={8} />}
                          {sub.submissionMode}
                        </span>
                      </div>
                      
                      {sub.rtaReference && (
                        <div className="flex items-center">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/10">
                            <Hash size={10} /> {sub.rtaReference}
                          </span>
                          <CopyBtn text={sub.rtaReference} id={`${sub._id}-rta`} />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Pay:</span>
                        <span className={
                          sub.paymentStatus === 'VERIFIED' ? 'text-emerald-500' : 
                          sub.paymentStatus === 'WAITING' ? 'text-amber-500' : 
                          'text-slate-500 dark:text-slate-300'
                        }>
                          {sub.paymentStatus} {sub.paymentMode && `• ${sub.paymentMode.replace('_', ' ')}`}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* NOTES & METADATA (FULL LIST) */}
                  <td className="px-8 py-5 align-top">
                    <div className="space-y-2 max-w-50">
                      {/* Status Icons Row */}
                      <div className="flex items-center gap-2 mb-1">
                        {sub.attachments?.length > 0 && (
                          <span className="text-slate-400 hover:text-emerald-500 transition-colors" title={`${sub.attachments.length} Attachments`}>
                            <Paperclip size={12} />
                          </span>
                        )}
                        {sub.internalNotes && (
                          <span className="text-slate-400 hover:text-blue-500 transition-colors" title="Internal Notes Present">
                            <MessageSquare size={12} />
                          </span>
                        )}
                      </div>

                      {/* Explicitly mapping all metadata */}
                      {sub.metadata && Object.keys(sub.metadata).length > 0 ? (
                        <div className="space-y-1.5">
                          {Object.entries(sub.metadata).map(([k, v]) => (
                            <div key={k} className="flex items-start gap-1.5 text-[9px] font-black uppercase tracking-widest">
                              <span className="text-slate-400 shrink-0 mt-0.5">{k}:</span>
                              <span className="text-slate-700 dark:text-slate-300 break-all">{String(v)}</span>
                              <CopyBtn text={String(v)} id={`${sub._id}-meta-${k}`} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-slate-200 dark:text-white/10 uppercase tracking-widest">—</span>
                      )}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-8 py-5 align-top">
                    <div className="flex flex-col items-start gap-1">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest
                        ${sub.status === 'REJECTED' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500' : 
                          sub.status === 'SETTLED' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 
                          'bg-blue-500/5 border-blue-500/20 text-blue-500'}`}>
                        {sub.status}
                      </div>
                      {sub.status === 'REJECTED' && sub.rejectionReason && (
                        <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1 mt-0.5 ml-1 max-w-30 truncate" title={sub.rejectionReason.replace(/_/g, ' ')}>
                          <AlertOctagon size={8} /> {sub.rejectionReason.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5 flex-1">
          {paginatedData.map((sub) => (
            <div 
              key={sub._id} 
              onClick={() => { setSelectedSubmissionId(sub._id); setIsDetailOpen(true); }}
              className="p-4 active:bg-slate-50 dark:active:bg-white/5 transition-all flex flex-col gap-3 cursor-pointer relative overflow-hidden"
            >
              {/* Background Status Indicator for Mobile */}
              {sub.status === 'REJECTED' && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full -z-10" />}

              {/* TOP ROW: Client & Date */}
              <div className="flex items-start justify-between w-full gap-2">
                 <div className="flex items-center gap-2 min-w-0">
                    <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${sub.status === 'SETTLED' ? 'bg-emerald-500' : sub.status === 'REJECTED' ? 'bg-rose-500' : 'bg-blue-500 animate-pulse'}`} />
                    <div>
                      <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate">
                        {sub.client?.name}
                      </p>
                      {sub.client?.pan && (
                        <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5 flex items-center">
                          {sub.client.pan} <CopyBtn text={sub.client.pan} id={`${sub._id}-mob-pan`} />
                        </p>
                      )}
                    </div>
                 </div>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded">
                    {formatDisplayDate(sub.creationDate)}
                 </span>
              </div>
              
              {/* SECOND ROW: Scheme & Details */}
              <div className="flex justify-between items-end gap-2 pl-3.5">
                 <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 uppercase truncate">
                      {sub.schemeName || sub.subType?.replace(/_/g, ' ')}
                    </p>
                    <div className="flex flex-col items-start gap-1.5 mt-1">
                      {sub.type !== 'NON_FINANCIAL' ? (
                        <p className="text-[13px] font-black text-slate-900 dark:text-white tabular-nums tracking-tighter truncate">
                           {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(sub.amount)}
                        </p>
                      ) : (
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Request Item</p>
                      )}
                      
                      {/* LARGE MOBILE FOLIO */}
                      <div className="flex items-center">
                        <span className="text-[10px] font-mono font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest bg-slate-200/60 dark:bg-white/10 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                          FOLIO: {sub.folioNumber || 'NEW'}
                        </span>
                        {sub.folioNumber && <CopyBtn text={sub.folioNumber} id={`${sub._id}-mob-folio`} />}
                      </div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-end gap-1 shrink-0">
                   <ChevronRight size={14} className="text-slate-300" />
                   <span className={`text-[7px] font-black uppercase tracking-widest ${sub.status === 'SETTLED' ? 'text-emerald-500' : sub.status === 'REJECTED' ? 'text-rose-500' : 'text-blue-500'}`}>
                     {sub.status}
                   </span>
                 </div>
              </div>

              {/* METADATA ACCORDION / FULL LIST FOR MOBILE */}
              {sub.metadata && Object.keys(sub.metadata).length > 0 && (
                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5 mt-1 pl-3.5">
                  {Object.entries(sub.metadata).map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded border border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest">
                      <span className="text-slate-400 shrink-0 w-1/3 truncate mt-0.5">{k}:</span>
                      <div className="flex items-start gap-1 justify-end w-2/3">
                        <span className="text-slate-700 dark:text-slate-300 text-right break-all mt-0.5">{String(v)}</span>
                        <CopyBtn text={String(v)} id={`${sub._id}-mob-meta-${k}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HORIZONTAL BADGES (Logistics & Rejections) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pl-3.5 pb-1 mt-1">
                {sub.status === 'REJECTED' && sub.rejectionReason && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[8px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded uppercase tracking-widest">
                    <AlertOctagon size={8} /> {sub.rejectionReason.replace(/_/g, ' ')}
                  </span>
                )}
                <span className={`shrink-0 inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${sub.submissionMode === 'PHYSICAL' ? 'bg-amber-500/5 text-amber-600 border-amber-500/20' : 'bg-indigo-500/5 text-indigo-600 border-indigo-500/20'}`}>
                  {sub.submissionMode === 'PHYSICAL' ? <MapPin size={8} /> : <Fingerprint size={8} />}
                  {sub.submissionMode}
                </span>
                {sub.rtaReference && (
                  <div className="shrink-0 flex items-center bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded pr-1">
                    <span className="inline-flex items-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-widest px-2 py-1">
                      <Hash size={8} /> RTA: {sub.rtaReference}
                    </span>
                    <CopyBtn text={sub.rtaReference} id={`${sub._id}-mob-rta`} />
                  </div>
                )}
                {sub.paymentStatus !== 'NOT_APPLICABLE' && (
                  <span className="shrink-0 inline-flex items-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-2 py-1 rounded">
                    <CreditCard size={8} /> {sub.paymentStatus}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {processedData.length === 0 && (
          <div className="px-6 py-16 md:py-24 text-center flex flex-col items-center justify-center opacity-20 flex-1">
            <Landmark size={32} className="mb-3 text-slate-400 md:w-12 md:h-12 md:mb-4" />
            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Registry List Clear</p>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {processedData.length > 0 && (
          <div className="bg-slate-50 dark:bg-[#0D0E12] border-t border-slate-200 dark:border-white/5 p-4 flex items-center justify-between mt-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Showing <span className="text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, processedData.length)}</span> of <span className="text-slate-900 dark:text-white">{processedData.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 px-2">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
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