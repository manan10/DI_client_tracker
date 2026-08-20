import React, { useState, useEffect, useRef, Fragment } from 'react';
import { X, Search, Mic, Lock, ChevronDown, Check, Calendar as CalendarIcon, Clock, Sparkles, Loader2, RotateCcw, CornerDownLeft, Activity } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useApi } from '../hooks/useApi';
import DateTimePicker from './DateTimePicker';

const InteractionModal = ({ isOpen, onClose, onRefresh, initialClient, editingData }) => {
  const { request, loading } = useApi();
  const [clients, setClients] = useState([]);
  
  // Existing States Preserved
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [originalSummary, setOriginalSummary] = useState('');
  const dropdownRef = useRef(null);

  // New States for Custom SaaS Dropdowns (Replacing Native UI)
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const channelRef = useRef(null);

  // Helper to get current local date and time in YYYY-MM-DDTHH:mm format
  const getNowLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  // Format existing date to YYYY-MM-DDTHH:mm for datetime-local input/DateTimePicker
  const formatForDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    client: '',
    clientName: '',
    date: getNowLocal(),
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
        setFormData({
          client: editingData.client?._id || editingData.client || '',
          clientName: editingData.clientName || initialClient?.name || '',
          date: editingData.date ? formatForDateTimeLocal(editingData.date) : getNowLocal(),
          type: editingData.type || 'In-Person',
          discussionPoints: editingData.discussionPoints || [],
          summary: editingData.summary || '',
          followUpRequired: editingData.followUpRequired || false,
          // Upgrade followUpDate to full datetime to support custom DateTimePicker safely
          followUpDate: editingData.followUpDate ? formatForDateTimeLocal(editingData.followUpDate) : '',
        });
        setSearchTerm(editingData.clientName || initialClient?.name || '');
      } else {
        setFormData({
          client: initialClient?._id || '',
          clientName: initialClient?.name || '',
          date: getNowLocal(),
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

  // Fetch Clients for Search
  useEffect(() => {
    if (isOpen && !isClientLocked) {
      const fetchClients = async () => {
        try {
          const res = await request('/clients/');
          if (res && typeof res === 'object') {
            const clientData = res.data || (Array.isArray(res) ? res : []);
            setClients(clientData);
          } else {
            setClients([]);
          }
        } catch (err) { 
          console.error("Failed to load clients", err); 
          setClients([]); 
        }
      };
      fetchClients();
    }
  }, [isOpen, request, isClientLocked]);

  // Combined Outside Click Handler for Custom Dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
      if (channelRef.current && !channelRef.current.contains(e.target)) setIsChannelOpen(false);
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
      <Dialog as="div" className="relative z-9999" onClose={resetAndClose}>
        <Transition.Child 
          as={Fragment} 
          enter="ease-out duration-300" 
          enterFrom="opacity-0" 
          enterTo="opacity-100" 
          leave="ease-in duration-200" 
          leaveFrom="opacity-100" 
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-[#0B1120]/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            <Transition.Child 
              as={Fragment} 
              enter="transform transition ease-in-out duration-500 sm:duration-500" 
              enterFrom="translate-x-full" 
              enterTo="translate-x-0" 
              leave="transform transition ease-in-out duration-500 sm:duration-500" 
              leaveFrom="translate-x-0" 
              leaveTo="translate-x-full"
            >
              {/* ZERO SCROLL, FULL HEIGHT SAAS DRAWER */}
              <Dialog.Panel className="pointer-events-auto w-screen lg:w-250 transform text-left align-middle transition-all bg-white dark:bg-[#0B1120] shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col h-dvh">
                
                {/* --- VIBRANT HEADER --- */}
                <div className={`px-6 py-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center shrink-0 transition-colors duration-500 ${editingData ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl shadow-sm ${editingData ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      <Activity size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                         <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            {editingData ? 'Modify Interaction' : 'Log Interaction'}
                         </h2>
                         <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${editingData ? 'bg-amber-200 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>
                            {editingData ? 'Revision Mode' : 'New Entry'}
                         </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        Client Intelligence & Action Mapping
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={resetAndClose} 
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-900 shadow-sm">
                      ESC
                    </kbd>
                    <X size={24} className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
                  </button>
                </div>

                {/* --- DUAL COLUMN WORKSPACE --- */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden bg-slate-50/30 dark:bg-[#0B1120]">
                    
                    {/* LEFT COLUMN: Metadata & Configuration */}
                    <div className="w-full lg:w-105 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/20 p-6 sm:p-8 flex flex-col gap-8 lg:overflow-y-auto custom-scrollbar relative">
                      
                      {/* CSS Relational Focus Magic Wrapper */}
                      <div className="flex flex-col gap-6 [&_.form-field:focus-within+.form-field_.tab-hint]:opacity-100 [&_.form-field:focus-within+.form-field_.tab-hint]:translate-y-0">
                        
                        {/* Client Search */}
                        <div className="form-field relative" ref={dropdownRef}>
                          <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                            <span>Client</span>
                            <Lock size={12} className={isClientLocked ? "text-amber-500" : "opacity-0"} />
                          </label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                              {isClientLocked ? <Lock size={16} /> : <Search size={16} />}
                            </div>
                            <input 
                              type="text"
                              disabled={isClientLocked}
                              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all disabled:opacity-60 font-bold text-slate-900 dark:text-white shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                              placeholder="Search by name or PAN..."
                              value={searchTerm}
                              onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                              required
                            />
                          </div>
                          
                          {/* Custom Dropdown List */}
                          {!isClientLocked && isDropdownOpen && searchTerm.length > 0 && (
                            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                              {filteredClients.length > 0 ? filteredClients.map(c => (
                                <div 
                                  key={c._id} 
                                  onClick={() => { setFormData({...formData, client: c._id, clientName: c.name}); setSearchTerm(c.name); setIsDropdownOpen(false); }} 
                                  className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors"
                                >
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</p>
                                  <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase mt-0.5">{c.pan}</p>
                                </div>
                              )) : (
                                <div className="px-4 py-6 text-center text-sm font-bold text-slate-400">No clients found.</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Date & Time */}
                        <div className="form-field relative">
                          <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Interaction Time
                            </label>
                            <span className="tab-hint opacity-0 translate-y-1 transition-all duration-300 inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold rounded">
                              Tab <CornerDownLeft size={10} />
                            </span>
                          </div>
                          <DateTimePicker 
                            value={formData.date} 
                            onChange={(newDate) => setFormData({...formData, date: newDate})} 
                          />
                        </div>

                        {/* Channel (Custom Dropdown replacing Native Select) */}
                        <div className="form-field relative" ref={channelRef}>
                           <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Channel
                            </label>
                            <span className="tab-hint opacity-0 translate-y-1 transition-all duration-300 inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold rounded">
                              Tab <CornerDownLeft size={10} />
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setIsChannelOpen(!isChannelOpen)}
                            className={`w-full flex items-center justify-between pl-4 pr-4 py-3.5 bg-white dark:bg-slate-900 border ${isChannelOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-slate-200 dark:border-white/10'} rounded-xl text-sm outline-none transition-all font-bold text-slate-900 dark:text-white shadow-sm`}
                          >
                            <span>{formData.type}</span>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isChannelOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                          </button>
                          
                          {/* Custom Options */}
                          {isChannelOpen && (
                            <div className="absolute z-40 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {['In-Person', 'Call', 'WhatsApp', 'Email'].map(t => (
                                <div 
                                  key={t}
                                  onClick={() => { setFormData({...formData, type: t}); setIsChannelOpen(false); }}
                                  className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-300 cursor-pointer transition-colors"
                                >
                                  {t}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Follow Up Requirement */}
                        <div className="form-field relative">
                           <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                              Follow-Up Required
                            </label>
                            <span className="tab-hint opacity-0 translate-y-1 transition-all duration-300 inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[9px] font-bold rounded">
                              Tab <CornerDownLeft size={10} />
                            </span>
                          </div>
                          
                          {/* SaaS Custom Toggle & Date Container */}
                          <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-1.5 rounded-2xl border transition-all ${formData.followUpRequired ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm'}`}>
                            
                            {/* The Pill Toggle */}
                            <button 
                              type="button"
                              onClick={() => setFormData({...formData, followUpRequired: !formData.followUpRequired})}
                              className={`relative w-16 h-8 rounded-full transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 shrink-0 ${formData.followUpRequired ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                              <div className={`absolute top-1 bottom-1 w-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData.followUpRequired ? 'left-9' : 'left-1'}`} />
                            </button>

                            {/* The Custom Date Picker (Replacing Native Input) */}
                            <div className={`flex-1 transition-all duration-300 ${formData.followUpRequired ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
                               <DateTimePicker 
                                 value={formData.followUpDate || getNowLocal()} 
                                 onChange={(newDate) => setFormData({...formData, followUpDate: newDate})} 
                               />
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Focus Topics (Pills) */}
                      <div className="mt-4">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
                          <Sparkles size={14} className="text-amber-500" /> Topic Tags
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {['MF', 'PMS', 'AIF', 'SIF', 'Debt', 'Tax Planning'].map(point => (
                            <button
                              key={point}
                              type="button"
                              onClick={() => toggleDiscussionPoint(point)}
                              className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                                formData.discussionPoints.includes(point) 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-600' 
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-500/50'
                              }`}
                            >
                              {point}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: The Summary Engine */}
                    <div className="flex-1 bg-white dark:bg-[#0B1120] p-6 sm:p-8 flex flex-col relative">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Mic size={14} className="text-indigo-500" />
                        Executive Summary & Notes
                      </label>
                      
                      {/* Deep Focus Textarea */}
                      <div className="relative flex-1 flex flex-col group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white dark:focus-within:bg-[#0B1120] transition-all shadow-sm">
                        
                        <textarea 
                          required
                          className="w-full h-full min-h-75 p-6 bg-transparent text-sm text-slate-900 dark:text-white outline-none leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none font-medium custom-scrollbar"
                          placeholder="Detail the key takeaways, client sentiment, and required follow-up actions..."
                          value={formData.summary}
                          onChange={(e) => setFormData({...formData, summary: e.target.value})}
                        />

                        {/* Floating Command Bar inside the Textarea */}
                        <div className="absolute bottom-4 right-4 left-4 flex justify-end items-center gap-3 z-10 pointer-events-none">
                          
                          {originalSummary && !isRefining && (
                            <button 
                              type="button" 
                              onClick={handleUndoRefinement}
                              className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-lg tracking-widest active:translate-y-px"
                            >
                              <RotateCcw size={14} /> Revert AI
                            </button>
                          )}

                          <div className="pointer-events-auto flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden p-1 gap-1">
                            
                            <button 
                              type="button" 
                              onClick={handleAiRefine}
                              disabled={isRefining || !formData.summary}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all disabled:opacity-40 tracking-widest active:translate-y-px"
                            >
                              {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                              {isRefining ? 'Polishing...' : 'Refine Notes'}
                            </button>

                            <button 
                              type="button" 
                              onClick={handleVoiceInput}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:translate-y-px ${
                                isListening 
                                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Mic size={14} /> {isListening ? 'Recording' : 'Dictate'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- STICKY FOOTER COMMAND BAR --- */}
                  <div className="px-6 py-5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 z-20 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:block">
                      Fields marked with an asterisk are mandatory.
                    </p>
                    <div className="flex w-full sm:w-auto items-center gap-3">
                      <button 
                        type="button"
                        onClick={resetAndClose}
                        className="w-full sm:w-auto px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors outline-none"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !formData.client || isRefining}
                        className={`group w-full sm:w-auto px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${
                          editingData 
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:translate-y-px disabled:opacity-50' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 active:translate-y-px disabled:opacity-50'
                        }`}
                      >
                        {loading ? (
                           <>Processing...</>
                        ) : (
                           <>
                             {editingData ? 'Update Record' : 'Commit Entry'}
                             <Check size={18} strokeWidth={3} className={!loading && formData.client ? "text-white/80" : ""} />
                           </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default InteractionModal;