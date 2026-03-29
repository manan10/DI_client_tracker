import React, { useState, useEffect, useRef, Fragment } from 'react';
import { X, Search, Mic, Lock, ChevronDown, Check, Calendar as CalendarIcon, Clock, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useApi } from '../hooks/useApi';

const InteractionModal = ({ isOpen, onClose, onRefresh, initialClient, editingData }) => {
  const { request, loading } = useApi();
  const [clients, setClients] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [originalSummary, setOriginalSummary] = useState('');
  const dropdownRef = useRef(null);

  const getToday = () => new Date().toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    client: '',
    clientName: '',
    date: getToday(),
    type: 'In-Person',
    discussionPoints: [],
    summary: '',
    followUpRequired: false,
    followUpDate: '',
  });

  // --- PRE-POPULATION LOGIC (RELIABLE SYNC) ---
  useEffect(() => {
    if (isOpen) {
      if (editingData) {
        // EDIT MODE: Populate from existing record
        setFormData({
          client: editingData.client?._id || editingData.client || '',
          clientName: editingData.clientName || initialClient?.name || '',
          date: editingData.date ? new Date(editingData.date).toISOString().split('T')[0] : getToday(),
          type: editingData.type || 'In-Person',
          discussionPoints: editingData.discussionPoints || [],
          summary: editingData.summary || '',
          followUpRequired: editingData.followUpRequired || false,
          followUpDate: editingData.followUpDate ? new Date(editingData.followUpDate).toISOString().split('T')[0] : '',
        });
        setSearchTerm(editingData.clientName || initialClient?.name || '');
      } else {
        // NEW MODE: Reset to defaults or initial client
        setFormData({
          client: initialClient?._id || '',
          clientName: initialClient?.name || '',
          date: getToday(),
          type: 'In-Person',
          discussionPoints: [],
          summary: '',
          followUpRequired: false,
          followUpDate: '',
        });
        setSearchTerm(initialClient?.name || '');
      }
    }
  }, [isOpen, editingData, initialClient]);

  const isClientLocked = !!initialClient;

  // Fetch Clients for Search (only if search is enabled)
  useEffect(() => {
    if (isOpen && !isClientLocked) {
      const fetchClients = async () => {
        try {
          const data = await request('/clients/');
          setClients(data);
        } catch (err) { console.error("Failed to load clients", err); }
      };
      fetchClients();
    }
  }, [isOpen, request, isClientLocked]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAiRefine = async () => {
    if (!formData.summary || formData.summary.trim().length < 5) return;
    setIsRefining(true);
    setOriginalSummary(formData.summary);
    try {
      const data = await request('/ai/refine-notes', 'POST', { text: formData.summary });
      if (data?.refinedText) {
        setFormData(prev => ({ ...prev, summary: data.refinedText }));
      }
    } catch (err) {
      console.error("AI Refinement failed", err);
    } finally {
      setIsRefining(false);
    }
  };

  const handleUndoRefinement = () => {
    setFormData(prev => ({ ...prev, summary: originalSummary }));
    setOriginalSummary('');
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ ...prev, summary: prev.summary ? prev.summary + " " + transcript : transcript }));
    };
    recognition.start();
  };

  const toggleDiscussionPoint = (point) => {
    setFormData(prev => ({
      ...prev,
      discussionPoints: prev.discussionPoints.includes(point)
        ? prev.discussionPoints.filter(p => p !== point)
        : [...prev.discussionPoints, point]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRefining) return;
    try {
      const { clientName: _unused, ...payload } = formData;
      const endpoint = editingData ? `/interactions/${editingData._id}` : '/interactions';
      const method = editingData ? 'PUT' : 'POST';

      const res = await request(endpoint, method, payload);
      if (res.success) {
        if (onRefresh) await onRefresh();
        resetAndClose();
      }
    } catch (err) {
      console.error("Submission error", err);
    }
  };

  const resetAndClose = () => {
    setOriginalSummary('');
    onClose();
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.pan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-110" onClose={resetAndClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-110 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-0 sm:p-4 text-center sm:text-left">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="w-full max-w-4xl transform text-left align-middle transition-all bg-white dark:bg-[#1e293b] sm:rounded-xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-700 flex flex-col max-h-screen sm:max-h-[90vh]">
                
                {/* DYNAMIC HEADER */}
                <div className={`px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0 transition-colors duration-500 ${editingData ? 'bg-amber-50/50 dark:bg-amber-950/10' : 'bg-slate-50 dark:bg-slate-900'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-full ${editingData ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                         <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                            {editingData ? 'Edit Audit Entry' : 'Interaction Log'}
                         </h2>
                         <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${editingData ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                            {editingData ? 'Revision Mode' : 'New Entry'}
                         </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-0.5">Corporate Intelligence System</p>
                    </div>
                  </div>
                  <button type="button" onClick={resetAndClose} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column */}
                    <div className="lg:col-span-5 space-y-10">
                      <div className="relative" ref={dropdownRef}>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Client Record</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            {isClientLocked ? <Lock size={14} /> : <Search size={14} />}
                          </div>
                          <input 
                            type="text"
                            disabled={isClientLocked}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all disabled:opacity-60 font-bold"
                            placeholder="Search name or PAN..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                            required
                          />
                        </div>
                        {!isClientLocked && isDropdownOpen && searchTerm.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {filteredClients.map(c => (
                              <div key={c._id} onClick={() => { setFormData({...formData, client: c._id, clientName: c.name}); setSearchTerm(c.name); setIsDropdownOpen(false); }} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono uppercase">{c.pan}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="min-w-0">
                          <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Date of Interaction</label>
                          <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg h-11">
                            <div className="px-4 text-slate-400"><Clock size={14} /></div>
                            <input 
                              type="date"
                              required
                              className="flex-1 h-full pr-9 text-[11px] font-bold bg-transparent outline-none dark:text-white uppercase relative z-10"
                              value={formData.date}
                              onChange={(e) => setFormData({...formData, date: e.target.value})}
                              style={{ colorScheme: 'dark' }}
                            />
                            <CalendarIcon size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-0" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="min-w-0">
                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Channel</label>
                            <div className="relative">
                              <select 
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm appearance-none outline-none focus:border-slate-400 font-bold"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                              >
                                {['In-Person', 'Call', 'WhatsApp', 'Email'].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Follow-up</label>
                            <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden h-11">
                              <div className="px-3 border-r border-slate-200 dark:border-slate-700 flex items-center h-full shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={formData.followUpRequired} 
                                  onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                                  className="w-4 h-4 accent-slate-900 dark:accent-emerald-500 rounded cursor-pointer"
                                />
                              </div>
                              <div className="relative flex-1 h-full min-w-0">
                                <input 
                                  type="date"
                                  disabled={!formData.followUpRequired}
                                  className="w-full h-full px-3 pr-9 text-[11px] font-bold bg-transparent outline-none dark:text-white disabled:opacity-20 uppercase transition-opacity relative z-10"
                                  value={formData.followUpDate}
                                  onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                                  style={{ colorScheme: 'dark' }}
                                />
                                <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-0" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Focus Topics</label>
                        <div className="flex flex-wrap gap-2">
                          {['MF', 'PMS', 'AIF', 'SIF', 'Debt', 'Tax Planning'].map(point => (
                            <button
                              key={point}
                              type="button"
                              onClick={() => toggleDiscussionPoint(point)}
                              className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                                formData.discussionPoints.includes(point) 
                                ? 'bg-slate-900 border-slate-900 text-white dark:bg-emerald-600 dark:border-emerald-600' 
                                : 'bg-white dark:bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                              }`}
                            >
                              {point}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col min-h-87.5">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Notes & Summary</label>
                      
                      <div className="relative flex-1 group">
                        <textarea 
                          required
                          className="w-full h-full min-h-[300px] p-5 pb-16 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-slate-400 dark:focus:border-emerald-500/50 leading-relaxed placeholder:text-slate-400 transition-all resize-none font-medium"
                          placeholder="Detail the key takeaways and proposed actions..."
                          value={formData.summary}
                          onChange={(e) => setFormData({...formData, summary: e.target.value})}
                        />

                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          {originalSummary && !isRefining && (
                            <button 
                              type="button" 
                              onClick={handleUndoRefinement}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-black uppercase bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm tracking-widest"
                            >
                              <RotateCcw size={12} /> UNDO
                            </button>
                          )}

                          <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-md shadow-sm overflow-hidden">
                            <button 
                              type="button" 
                              onClick={handleAiRefine}
                              disabled={isRefining || !formData.summary}
                              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all border-r border-slate-200 dark:border-slate-700 disabled:opacity-40 tracking-widest"
                            >
                              {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {isRefining ? 'POLISHING...' : 'REFINE WITH AI'}
                            </button>

                            <button 
                              type="button" 
                              onClick={handleVoiceInput}
                              className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Mic size={12} /> {isListening ? 'LISTENING' : 'DICTATE'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Submit Button */}
                  <div className="flex justify-end pt-4 shrink-0">
                    <button
                      type="submit"
                      disabled={loading || !formData.client || isRefining}
                      className={`w-full sm:w-auto px-12 py-3.5 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-40 flex items-center justify-center gap-3 shadow-lg ${
                        editingData 
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20' 
                        : 'bg-slate-950 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-700 text-white shadow-emerald-900/20'
                      }`}
                    >
                      {loading ? 'Processing...' : (editingData ? 'Update Ledger' : 'Commit Interaction')}
                      <Check size={16} strokeWidth={4} />
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: transparent; color: transparent; cursor: pointer; height: 100%; width: 100%; position: absolute; top: 0; left: 0; opacity: 0;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        `}</style>
      </Dialog>
    </Transition.Root>
  );
};

export default InteractionModal;