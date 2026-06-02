import React from "react";
import { CheckCircle, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";

const StatusStep = ({
  isProcessing, selectedClientIds, selectedClientsData, emailStatuses, resetWizard
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-4xl mx-auto flex flex-col h-175 animate-in fade-in duration-500">
      <div className="text-center mb-8 mt-4 shrink-0">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 transition-colors duration-500">
          {isProcessing ? (
             <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
               <RefreshCw size={32} className="text-amber-600 animate-spin" />
             </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-[1000] text-slate-900 uppercase tracking-tight italic">
          {isProcessing ? "Transmitting Emails" : "Operation Complete"}
        </h2>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">
          {isProcessing 
            ? `Dispatching to ${selectedClientIds.size} recipients...` 
            : `Successfully notified ${selectedClientIds.size} clients.`}
        </p>
      </div>

      {/* Live Status Tracker */}
      <div className="grow border border-slate-200 rounded-xl overflow-hidden flex flex-col bg-slate-50">
        <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Status Feed</span>
          <span className="text-[10px] font-bold text-slate-400">
            {Object.values(emailStatuses).filter(s => s === 'sent').length} / {selectedClientIds.size} Completed
          </span>
        </div>
        <div className="overflow-y-auto p-2 grow custom-scrollbar bg-slate-50 space-y-1">
          {selectedClientsData.map(client => {
            const status = emailStatuses[client._id];
            return (
              <div key={client._id} className="bg-white border border-slate-100 p-3 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">{client.name}</span>
                  <span className="text-[11px] text-slate-500">{client.email}</span>
                </div>
                <div>
                  {status === 'pending' && (
                    <span className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-500 rounded uppercase tracking-wider">Pending</span>
                  )}
                  {status === 'sending' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-700 rounded uppercase tracking-wider">
                      <Loader2 size={10} className="animate-spin" /> Sending...
                    </span>
                  )}
                  {status === 'sent' && (
                    <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded uppercase tracking-wider">
                      <CheckCircle2 size={12} /> Sent
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-center shrink-0">
        <button 
          onClick={resetWizard}
          disabled={isProcessing}
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StatusStep;