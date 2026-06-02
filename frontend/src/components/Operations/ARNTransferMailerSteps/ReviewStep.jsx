import React, { useState } from "react";
import { Users, AlertCircle, ChevronLeft, Send, Eye, Code, ChevronRight } from "lucide-react";

const ReviewStep = ({
  variables, selectedClientIds, selectedClientsData, 
  template, setTemplate, setCurrentStep, handleProcessMailing
}) => {

  // Compact Local Pagination for Selected Clients
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(selectedClientsData.length / itemsPerPage));
  const paginatedSelectedClients = selectedClientsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Live Preview Logic (using the first selected client)
  const previewClient = selectedClientsData[0] || { name: "John Doe", email: "john@example.com" };
  
  const generatePreview = () => {
    return template
      .replace(/{{CLIENT_NAME}}/g, previewClient.name || '{{CLIENT_NAME}}')
      .replace(/{{TRANSFEROR_NAME}}/g, variables.transferorName || '{{TRANSFEROR_NAME}}')
      .replace(/{{TRANSFEROR_ARN}}/g, variables.transferorARN || '{{TRANSFEROR_ARN}}')
      .replace(/{{TRANSFEREE_NAME}}/g, variables.transfereeName || '{{TRANSFEREE_NAME}}')
      .replace(/{{TRANSFEREE_ARN}}/g, variables.transfereeARN || '{{TRANSFEREE_ARN}}')
      .replace(/{{TRANSFEREE_EMAIL}}/g, variables.transfereeEmail || '{{TRANSFEREE_EMAIL}}')
      .replace(/{{TRANSFEREE_PHONE}}/g, variables.transfereePhone || '{{TRANSFEREE_PHONE}}')
      .replace(/{{TRANSFEREE_ADDRESS}}/g, variables.transfereeAddress || '{{TRANSFEREE_ADDRESS}}')
      .replace(/{{CUTOFF_DATE}}/g, variables.cutoffDate || '{{CUTOFF_DATE}}');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col w-full animate-in slide-in-from-right-8 duration-500">
      
      {/* Header Area */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-black text-lg shrink-0">
            3
          </div>
          <div>
            <h2 className="text-lg font-black italic text-slate-900 uppercase tracking-tight mb-0.5">
              REVIEW & DISPATCH
            </h2>
            <p className="text-emerald-600 font-bold text-[10px] tracking-widest uppercase">
              FINAL AUTHORIZATION REQUIRED
            </p>
          </div>
        </div>
        
        {/* Warning Bar */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200 max-w-md">
          <AlertCircle size={14} className="text-amber-500 shrink-0" />
          <p>Verify the Preview Panel carefully. Actions are irreversible upon dispatch.</p>
        </div>
      </div>

      {/* Main Content: 2x2 Grid Layout */}
      <div className="p-4 flex flex-col gap-6 grow bg-white">
        
        {/* ROW 1: Variables (Left) & Target Audience (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-55 shrink-0">
          
          {/* Variables Summary */}
          <div className="flex flex-col h-full border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest p-3 border-b border-slate-200 bg-white shrink-0">
              Variables Summary
            </h3>
            <div className="p-3 space-y-2 overflow-y-auto custom-scrollbar grow">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Transferor</span>
                <span className="text-[10px] font-bold text-slate-800 text-right">{variables.transferorName || "N/A"} <br/><span className="text-slate-500">{variables.transferorARN}</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Transferee</span>
                <span className="text-[10px] font-bold text-slate-800 text-right">{variables.transfereeName || "N/A"} <br/><span className="text-slate-500">{variables.transfereeARN}</span></span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Contact</span>
                <span className="text-[10px] font-bold text-slate-800 text-right truncate max-w-50">{variables.transfereeEmail || "N/A"} <br/><span className="text-slate-500">{variables.transfereePhone}</span></span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Cutoff Date</span>
                <span className="text-[10px] font-bold text-rose-600">{variables.cutoffDate || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Paginated Target Audience */}
          <div className="flex flex-col h-full border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <span className="flex items-center gap-1.5"><Users size={12} /> Target Audience</span>
              <span className="bg-emerald-100 text-emerald-800 py-0.5 px-2 rounded font-bold text-[9px]">{selectedClientIds.size} Clients</span>
            </h3>
            <div className="overflow-y-auto grow custom-scrollbar">
              {paginatedSelectedClients.map(client => (
                <div key={client._id} className="p-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div className="text-[11px] font-bold text-slate-800 truncate">{client.name}</div>
                  <div className="text-[9px] text-slate-500 truncate">{client.email}</div>
                </div>
              ))}
            </div>
            {/* Internal Pagination */}
            <div className="p-2 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="p-1 rounded bg-white border border-slate-200 disabled:opacity-50 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Pg {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="p-1 rounded bg-white border border-slate-200 disabled:opacity-50 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
        </div>

        {/* ROW 2: Template Editor (Left) & Live Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-100 grow">
          
          {/* Template Editor */}
          <div className="flex flex-col h-full border border-slate-200 rounded-xl bg-[#F8FAFC] shadow-inner focus-within:border-emerald-400 focus-within:bg-white transition-all overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest p-3 border-b border-slate-200 bg-white flex items-center gap-1.5 shrink-0">
              <Code size={12} /> Template Editor
            </h3>
            <textarea 
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full h-full p-4 bg-transparent outline-none resize-none text-slate-800 text-[11px] leading-relaxed custom-scrollbar font-mono"
              placeholder="Start typing your email template here..."
            />
          </div>

          {/* Live Preview */}
          <div className="flex flex-col h-full border border-slate-200 rounded-xl bg-white shadow-md overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5"><Eye size={12} /> Live Client Preview</span>
              <span className="text-[8px] bg-white text-slate-500 px-2 py-1 rounded border border-slate-200">Viewing Data: {previewClient.name}</span>
            </h3>
            <div className="p-4 overflow-y-auto custom-scrollbar grow">
              <div className="whitespace-pre-wrap text-slate-700 text-[11px] leading-relaxed">
                {generatePreview()}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-2xl shrink-0">
        <button onClick={() => setCurrentStep(2)} className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider flex items-center gap-2">
          <ChevronLeft size={16} /> Back
        </button>
        <button 
          onClick={handleProcessMailing}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          Dispatch to Clients <Send size={16} strokeWidth={2.5} />
        </button>
      </div>
      
    </div>
  );
};

export default ReviewStep;