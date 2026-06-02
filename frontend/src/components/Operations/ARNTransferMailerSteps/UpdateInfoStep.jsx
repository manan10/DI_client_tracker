import React from "react";
import { UserMinus, UserPlus, Calendar, ChevronLeft, ArrowRight } from "lucide-react";

const UpdateInfoStep = ({ variables, handleVariableChange, setCurrentStep }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-full animate-in slide-in-from-right-8 duration-500 max-w-6xl mx-auto w-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-full font-black text-xl bg-emerald-100 text-emerald-800 shrink-0">
            1
          </div>
          <div>
            <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tight">UPDATE INFORMATION</h2>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mt-0.5">
              Provide the current and new distributor details
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10 grow">
        {/* Your Details */}
        <div>
          <h4 className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest pb-3 border-b border-slate-200 mb-6">
            <UserMinus size={16} /> Transferor Details (Current)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Your Full Name</label>
              <input type="text" name="transferorName" value={variables.transferorName} onChange={handleVariableChange} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-emerald-500 transition-all" placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Your ARN</label>
              <input type="text" name="transferorARN" value={variables.transferorARN} onChange={handleVariableChange} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-emerald-500 transition-all uppercase" placeholder="ARN-XXXXX" />
            </div>
          </div>
        </div>

        {/* New Distributor Details */}
        <div>
          <h4 className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest pb-3 border-b border-emerald-100 mb-6">
            <UserPlus size={16} /> Transferee Details (New)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New Name</label>
              <input type="text" name="transfereeName" value={variables.transfereeName} onChange={handleVariableChange} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-emerald-500 transition-all" placeholder="New Full Name" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New ARN</label>
              <input type="text" name="transfereeARN" value={variables.transfereeARN} onChange={handleVariableChange} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-emerald-500 transition-all uppercase" placeholder="ARN-YYYYY" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Contact Email</label>
              <input type="email" name="transfereeEmail" value={variables.transfereeEmail} onChange={handleVariableChange} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-emerald-500 transition-all lowercase" placeholder="email@example.com" />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
              <input type="text" name="transfereePhone" value={variables.transfereePhone} onChange={handleVariableChange} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-emerald-500 transition-all" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Office Address</label>
              <input type="text" name="transfereeAddress" value={variables.transfereeAddress} onChange={handleVariableChange} className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-emerald-500 transition-all" placeholder="Full Business Address" />
            </div>
          </div>
        </div>

        {/* Deadline (Datepicker) */}
        <div className="pt-6 border-t border-slate-100 max-w-md">
          <label className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">
            <Calendar size={14} /> Last Date for Objections
          </label>
          <input 
            type="date" 
            name="cutoffDate" 
            value={variables.cutoffDate} 
            onChange={handleVariableChange} 
            className="w-full h-14 px-4 bg-emerald-50/50 border-2 border-emerald-200 rounded-xl text-base font-bold outline-none focus:border-emerald-500 transition-all text-emerald-900 cursor-pointer" 
          />
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center rounded-b-2xl">
        <button onClick={() => setCurrentStep(0)} className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider">
          Cancel
        </button>
        <button 
          onClick={() => setCurrentStep(2)} 
          className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
        >
          Next Step <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default UpdateInfoStep;