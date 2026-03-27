import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, Mail, Activity, Files, Users, 
  CreditCard, TrendingUp, Clock, Plus, Lock, Calendar, Filter, X, ChevronDown
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useApi } from '../hooks/useApi';
import Navbar from '../components/Navbar';
import InteractionModal from '../components/InteractionModal';
import ClientDocumentManager from '../components/ClientDetail/ClientDocumentManager';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading } = useApi();
  
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('interactions');
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [filterDate, setFilterDate] = useState(null);

  useEffect(() => {
    let isMounted = true; 
    const loadInitialData = async () => {
      try {
        const data = await request(`/clients/${id}`);
        if (isMounted) setClient(data);
      } catch (err) {
        if (isMounted) console.error("Failed to load client details", err);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, [id, request]);

  const refreshClientData = async () => {
    try {
      const data = await request(`/clients/${id}`);
      setClient(data);
    } catch (err) {
      console.error("Failed to refresh client details", err);
    }
  };

  const interactions = client?.interactions;

  const filteredInteractions = useMemo(() => {
    if (!interactions) return [];
    if (!filterDate) return interactions;

    return interactions.filter(log => {
      const logDate = new Date(log.date);
      const isSameMonth = logDate.getMonth() === filterDate.getMonth();
      const isSameYear = logDate.getFullYear() === filterDate.getFullYear();
      return isSameMonth && isSameYear;
    });
  }, [interactions, filterDate]);

  if (loading && !client) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar />
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-500">
            Decrypting Client Profile...
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-300">
      <Navbar />

      {/* Header Section */}
      <div className="bg-slate-900 pt-8 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-360 mx-auto px-6 lg:px-12 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Directory
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                  {client.category || 'General'}
                </span>
                <span className="text-slate-400 text-xs font-mono tracking-wider">{client.pan}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                {client.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {client.contactDetails?.phoneNo && (
                <a href={`tel:${client.contactDetails.phoneNo}`} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm">
                  <Phone size={18} />
                </a>
              )}
              {client.contactDetails?.email && (
                <a href={`mailto:${client.contactDetails.email}`} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-sm">
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-360 mx-auto px-6 lg:px-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 transition-colors duration-300">
              <h3 className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CreditCard size={12} /> Account Intelligence
              </h3>
              <div className="space-y-5">
                <div>
                  <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Total AUM</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">
                    ₹{client.aum?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Wealth Elite ID</p>
                    <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{client.wealthEliteId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">ARN</p>
                    <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{client.arn || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 transition-colors duration-300">
              <h3 className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={12} /> Family Structure
              </h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 mb-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Role in Family</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded ${client.isFamilyHead ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-500' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                  {client.isFamilyHead ? 'Head' : 'Member'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto custom-scrollbar">
              {[
                { id: 'interactions', label: 'Interactions', icon: <Activity size={14} /> },
                { id: 'documents', label: 'Documents', icon: <Files size={14} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-emerald-500 text-white dark:text-white' 
                      : 'border-transparent text-white dark:text-white'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button disabled className="flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed">
                <TrendingUp size={14} /> Portfolio <Lock size={10} className="ml-1" />
              </button>
            </div>

            {activeTab === 'interactions' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 flex items-center gap-4 bg-white dark:bg-slate-800 p-2 pl-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Filter size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Filter Period</span>
                    </div>

                    <div className="relative flex-1 group">
                      <DatePicker
                        selected={filterDate}
                        onChange={(date) => setFilterDate(date)}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        dropdownMode="select"
                        placeholderText="ALL HISTORY"
                        className="w-full bg-slate-50 dark:bg-slate-900 text-[11px] font-black uppercase tracking-tighter text-slate-800 dark:text-emerald-400 px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-emerald-500/50 transition-all cursor-pointer text-center"
                        calendarClassName="custom-emerald-calendar"
                      />
                      {filterDate ? (
                        <button 
                          onClick={() => setFilterDate(null)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      ) : (
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsInteractionModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-slate-950 dark:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-md active:scale-95"
                  >
                    <Plus size={14} /> Log Interaction
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-10 transition-colors duration-300">
                  {filteredInteractions.length > 0 ? (
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-4 space-y-12">
                      {filteredInteractions.map((log) => (
                        <div key={log._id} className="relative pl-8 sm:pl-12 group">
                          <div className="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-800 border-4 border-emerald-500 shadow-sm group-hover:scale-125 transition-transform" />
                          <div className="flex flex-col gap-3.5">
                            <div className="flex flex-wrap items-center gap-4">
                              <time className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest">
                                {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </time>
                              <span className="px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {log.type}
                              </span>
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
                              <div className="flex items-center gap-2 mt-2 text-[10.5px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest">
                                <Calendar size={12} /> Follow up due: {new Date(log.followUpDate).toLocaleDateString('en-IN')}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <Clock className="mx-auto text-slate-300 dark:text-slate-600 mb-5" size={48} />
                      <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-widest mb-2.5">Timeline is Quiet</h3>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                        Adjust your filters or log a new interaction to populate this view.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ClientDocumentManager client={client} onRefresh={refreshClientData} />
              </div>
            )}
          </div>
        </div>
      </div>

      <InteractionModal 
        isOpen={isInteractionModalOpen} 
        onClose={() => setIsInteractionModalOpen(false)} 
        onRefresh={refreshClientData} 
        initialClient={client} 
      />

      <style>{`
        /* --- GENERAL CALENDAR OVERRIDES --- */
        .custom-emerald-calendar {
          border-radius: 1.25rem !important;
          border: none !important;
          overflow: hidden !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4) !important;
          font-family: inherit !important;
        }

        .react-datepicker__header {
          padding-top: 1.25rem !important;
          border-bottom: 1px solid rgba(0,0,0,0.05) !important;
        }

        /* LIGHT MODE (Default) */
        .custom-emerald-calendar {
          background-color: #ffffff !important;
        }
        .react-datepicker__header {
          background-color: #f8fafc !important; /* light slate */
          border-bottom: 1px solid #e2e8f0 !important;
        }
        .react-datepicker__current-month {
          color: #0f172a !important; /* dark slate */
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 0.9rem !important;
          padding-bottom: 0.5rem !important;
          display: block !important;
        }
        .react-datepicker__month-text {
          color: #64748b !important;
          font-weight: 700 !important;
          padding: 0.75rem 0 !important;
          border-radius: 0.75rem !important;
          font-size: 0.75rem !important;
          text-transform: uppercase !important;
        }
        .react-datepicker__month-text:hover {
          background-color: #f1f5f9 !important;
          color: #10b981 !important;
        }
        .react-datepicker__month-text--selected {
          background-color: #10b981 !important;
          color: white !important;
        }

        /* DARK MODE OVERRIDES */
        .dark .custom-emerald-calendar {
          background-color: #020617 !important;
          border: 1px solid #1e293b !important;
        }
        .dark .react-datepicker__header {
          background-color: #0f172a !important;
          border-bottom: 1px solid #1e293b !important;
        }
        .dark .react-datepicker__current-month {
          color: #ffffff !important;
        }
        .dark .react-datepicker__month-text {
          color: #94a3b8 !important;
        }
        .dark .react-datepicker__month-text:hover {
          background-color: #1e293b !important;
          color: #10b981 !important;
        }
        .dark .react-datepicker__month-text--selected {
          background-color: #10b981 !important;
          color: white !important;
        }

        /* Fix for navigation arrows */
        .react-datepicker__navigation {
          top: 1.1rem !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #64748b !important;
          border-width: 2px 2px 0 0 !important;
        }
        .dark .react-datepicker__navigation-icon::before {
          border-color: #94a3b8 !important;
        }
      `}</style>
    </div>
  );
};

export default ClientDetail;