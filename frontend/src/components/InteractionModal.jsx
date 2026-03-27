import React, { useState, useEffect, useRef, Fragment } from 'react';
import { X, Search, Mic, Lock, ChevronDown, Check, Calendar as CalendarIcon, Clock, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useApi } from '../hooks/useApi';

const InteractionModal = ({ isOpen, onClose, onRefresh, initialClient }) => {
  const { request, loading } = useApi();
  const [clients, setClients] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [originalSummary, setOriginalSummary] = useState('');
  const dropdownRef = useRef(null);

  // Helper for today's date in YYYY-MM-DD
  const getToday = () => new Date().toISOString().split('T')[0];

  const [searchTerm, setSearchTerm] = useState(initialClient?.name || '');
  const [formData, setFormData] = useState({
    client: initialClient?._id || '',
    clientName: initialClient?.name || '',
    date: getToday(),
    type: 'In-Person',
    discussionPoints: [],
    summary: '',
    followUpRequired: false,
    followUpDate: '',
  });

  const isClientLocked = !!initialClient;

  // Handle Initial Client Prop Changes
  const [prevClient, setPrevClient] = useState(initialClient);
  if (initialClient?._id !== prevClient?._id) {
    setPrevClient(initialClient);
    setSearchTerm(initialClient?.name || '');
    setFormData(prev => ({
      ...prev,
      client: initialClient?._id || '',
      clientName: initialClient?.name || '',
    }));
  }

  // Fetch Clients for Search
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

  // Click Outside Dropdown Handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AI Refinement Logic
  const handleAiRefine = async () => {
    if (!formData.summary || formData.summary.trim().length < 5) return;
    
    setIsRefining(true);
    setOriginalSummary(formData.summary);

    try {
      // Endpoint logic: This sends the text to your Gemini-powered backend route
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

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.pan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      await request('/interactions', 'POST', payload);
      if (onRefresh) await onRefresh();
      resetAndClose();
    } catch { alert("Error saving interaction."); }
  };

  const resetAndClose = () => {
    setFormData({ 
      client: initialClient?._id || '', 
      clientName: initialClient?.name || '', 
      date: getToday(),
      type: 'In-Person', 
      discussionPoints: [], 
      summary: '', 
      followUpRequired: false, 
      followUpDate: '' 
    });
    setOriginalSummary('');
    setSearchTerm(initialClient?.name || '');
    onClose();
  };

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
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Interaction Log</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-0.5">Corporate Intelligence System</p>
                  </div>
                  <button type="button" onClick={resetAndClose} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: Client & Metadata */}
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
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:border-slate-400 dark:focus:border-slate-500 outline-none transition-all disabled:opacity-60"
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
                            <div className="px-4 text-slate-400">
                                <Clock size={14} />
                            </div>
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
                                className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm appearance-none outline-none focus:border-slate-400"
                                value={formData.type}
                                onChange={(e) => setFormData({...formData, type: e.target.value})}
                              >
                                {['In-Person', 'Call', 'WhatsApp', 'Email'].map(t => <option className='dark: bg-white text-slate-900' key={t} value={t}>{t}</option>)}
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

                    {/* Right Column: Notes with AI Refiner */}
                    <div className="lg:col-span-7 flex flex-col min-h-87.5">
                      <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Notes & Summary</label>
                      
                      <div className="relative flex-1 group">
                        <textarea 
                          required
                          className="w-full h-full min-h-[300px] p-5 pb-16 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-slate-400 dark:focus:border-emerald-500/50 leading-relaxed placeholder:text-slate-400 transition-all resize-none"
                          placeholder="Detail the key takeaways and proposed actions..."
                          value={formData.summary}
                          onChange={(e) => setFormData({...formData, summary: e.target.value})}
                        />

                        {/* Floating Action Bar - Bottom Right */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                          {originalSummary && !isRefining && (
                            <button 
                              type="button" 
                              onClick={handleUndoRefinement}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
                            >
                              <RotateCcw size={12} />
                              UNDO
                            </button>
                          )}

                          <div className="flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-md shadow-sm overflow-hidden">
                            <button 
                              type="button" 
                              onClick={handleAiRefine}
                              disabled={isRefining || !formData.summary}
                              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all border-r border-slate-200 dark:border-slate-700 disabled:opacity-40"
                            >
                              {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              {isRefining ? 'POLISHING...' : 'REFINE WITH AI'}
                            </button>

                            <button 
                              type="button" 
                              onClick={handleVoiceInput}
                              className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold transition-all ${
                                isListening 
                                  ? 'bg-red-50 text-red-600 animate-pulse' 
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <Mic size={12} />
                              {isListening ? 'LISTENING' : 'DICTATE'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 shrink-0">
                    <button
                      type="submit"
                      disabled={loading || !formData.client || isRefining}
                      className="w-full sm:w-auto px-12 py-3.5 bg-slate-900 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {loading ? 'Processing...' : 'Save Interaction'}
                      <Check size={16} strokeWidth={3} />
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: transparent;
            color: transparent;
            cursor: pointer;
            height: 100%;
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
            padding: 0;
            margin: 0;
            opacity: 0;
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