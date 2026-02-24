import React, { useState, useEffect } from "react";
import { X, Calendar, MessageSquare, User } from "lucide-react";
import { useApi } from "../../hooks/useApi";

const QuickLogModal = ({ isOpen, onClose }) => {
  const { request } = useApi();
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({ clientId: "", type: "In-Person", notes: "", tags: "" });

  // Fetch clients for the dropdown
  useEffect(() => {
    if (isOpen) {
      request("/clients/").then(data => setClients(data || []));
    }
  }, [isOpen, request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await request("/interactions/add", "POST", {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim())
      });
      onClose(); // Close and refresh would happen here
      window.location.reload(); // Simple refresh to update timeline
    } catch (err) {
      console.error("Failed to save interaction", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600">New Interaction</h2>
            <button onClick={onClose} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                <User size={12} /> Select Client
              </label>
              <select 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-amber-500 focus:outline-none appearance-none"
                onChange={(e) => setFormData({...formData, clientId: e.target.value})}
              >
                <option value="">Choose a client...</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                <MessageSquare size={12} /> Key Discussion Points
              </label>
              <textarea 
                required
                rows="3"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-amber-500 focus:outline-none"
                placeholder="e.g., Discussed AIF opportunities..."
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <button type="submit" className="w-full bg-amber-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-amber-200 hover:bg-amber-700 transition-all">
              Save to Timeline
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickLogModal;