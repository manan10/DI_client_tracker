import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle2, Search, Mic, MicOff } from 'lucide-react';
import { useApi } from '../hooks/useApi';

const InteractionModal = ({ isOpen, onClose, onRefresh }) => {
  const { request, loading } = useApi();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    client: '',
    clientName: '',
    type: 'In-Person',
    discussionPoints: [],
    summary: '',
    followUpRequired: false,
    followUpDate: '',
    complianceCheck: false
  });

  // Fetch clients for selection when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchClients = async () => {
        try {
          const data = await request('/clients/');
          setClients(data);
        } catch (err) {
          console.error("Failed to load clients", err);
        }
      };
      fetchClients();
    }
  }, [isOpen, request]);

  // Handle clicks outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Voice-to-Text Logic
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Optimized for Indian accents
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => ({ 
        ...prev, 
        summary: prev.summary ? prev.summary + " " + transcript : transcript 
      }));
    };

    recognition.start();
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.pan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectClient = (client) => {
    setFormData({ ...formData, client: client._id, clientName: client.name });
    setSearchTerm(client.name);
    setIsDropdownOpen(false);
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
    try {
      const { clientName: _unused, ...payload } = formData;
      await request('/interactions', 'POST', payload);
      
      if (onRefresh) onRefresh();
      resetAndClose();
    } catch {
      alert("Error saving interaction. Please check all fields.");
    }
  };

  const resetAndClose = () => {
    setFormData({
      client: '',
      clientName: '',
      type: 'In-Person',
      discussionPoints: [],
      summary: '',
      followUpRequired: false,
      followUpDate: '',
      complianceCheck: false
    });
    setSearchTerm('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Log Interaction</h2>
            <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Unified Recording System</p>
          </div>
          <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600 p-2 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[85vh] sm:max-h-[75vh] overflow-y-auto">
          
          {/* Searchable Client Selection */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Client Selection (Name or PAN)
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Type to search clients..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-amber-600 transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                required
              />
            </div>

            {isDropdownOpen && searchTerm.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
                {filteredClients.length > 0 ? (
                  filteredClients.map(c => (
                    <div 
                      key={c._id}
                      onClick={() => selectClient(c)}
                      className="p-4 hover:bg-amber-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <p className="text-sm font-black text-slate-800 uppercase">{c.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{c.pan}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs font-bold uppercase italic">No clients found</div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
              <select 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-amber-600 transition-all appearance-none"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {['In-Person', 'Call', 'WhatsApp', 'Email'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Follow-up Required?</label>
              <div className="flex items-center h-[54px] gap-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl">
                 <input 
                  type="checkbox" 
                  checked={formData.followUpRequired} 
                  onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                  className="w-5 h-5 accent-amber-600 cursor-pointer"
                 />
                 {formData.followUpRequired && (
                   <input 
                    type="date" 
                    className="flex-1 bg-transparent text-xs font-bold outline-none text-slate-700"
                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                    required
                   />
                 )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Discussion Points</label>
            <div className="flex flex-wrap gap-2">
              {['MF', 'PMS', 'AIF', 'Equity', 'Insurance', 'Tax Planning'].map(point => (
                <button
                  key={point}
                  type="button"
                  onClick={() => toggleDiscussionPoint(point)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                    formData.discussionPoints.includes(point) 
                    ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-100' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'
                  }`}
                >
                  {point}
                </button>
              ))}
            </div>
          </div>

          {/* Voice-to-Text Summary Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interaction Summary</label>
              <button 
                type="button" 
                onClick={handleVoiceInput}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black transition-all ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isListening ? <MicOff size={10}/> : <Mic size={10}/>}
                {isListening ? 'LISTENING...' : 'VOICE-TO-TEXT'}
              </button>
            </div>
            <textarea 
              required
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium outline-none focus:border-amber-600 transition-all h-36 resize-none"
              placeholder="Tap the mic to dictate or type your notes here..."
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
            />
          </div>

          {/* Compliance Checkbox */}
          <div className={`p-5 rounded-3xl border flex items-start gap-4 transition-all ${formData.complianceCheck ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
            <input 
              type="checkbox" 
              required
              checked={formData.complianceCheck}
              onChange={(e) => setFormData({...formData, complianceCheck: e.target.checked})}
              className="mt-1 w-5 h-5 accent-emerald-500 cursor-pointer" 
            />
            <div>
              <p className="text-[11px] font-black text-slate-800 uppercase leading-none mb-1">Compliance Confirmation</p>
              <p className="text-[10px] text-slate-500 font-medium">I verify that disclaimers were provided as a Financial Product Distributor.</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.client}
            className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all flex items-center justify-center gap-2 ${
                !formData.client ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Logging...' : 'Save Interaction'}
            <CheckCircle2 size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default InteractionModal;