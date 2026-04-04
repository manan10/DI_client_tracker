import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, Check, X, Wallet, Loader2, 
  AlertTriangle, Landmark, ShieldCheck, Hash, User, ChevronDown, ShieldAlert, RefreshCw
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const BankAccounts = () => {
  const { request } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [arns, setArns] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const dropdownRef = useRef(null);
  const editDropdownRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({ accountName: '', accountNumber: '', arn: null });
  const [editData, setEditData] = useState({ accountName: '', accountNumber: '', arn: null });

  // Helper to sort accounts alphabetically by name
  const sortAccounts = (data) => {
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  };

  const initRegistry = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([request('/arns'), request('/accounts')]);
      if (arnRes?.data) setArns(arnRes.data);
      if (accRes?.data) {
        // Sort initial fetch
        setAccounts(sortAccounts(accRes.data));
      }
    } catch {
      toast.error("Registry Sync Failed");
    } finally {
      setIsInitialLoading(false);
    }
  }, [request]);

  useEffect(() => { 
    initRegistry();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
      if (editDropdownRef.current && !editDropdownRef.current.contains(e.target)) setIsEditDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [initRegistry]);

  const simulateReload = async (callback) => {
    setIsSyncing(true);
    await callback();
    setTimeout(() => setIsSyncing(false), 600);
  };

  const handleAdd = async () => {
    if (!formData.accountName) return toast.warning("Bank Name Required");
    const payload = { 
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      arn: formData.arn?.arnCode || null 
    };
    
    await simulateReload(async () => {
      const res = await request('/accounts', 'POST', payload);
      if (res?.data) {
        // Add and re-sort
        setAccounts(prev => sortAccounts([...prev, res.data]));
        setFormData({ accountName: '', accountNumber: '', arn: null });
        toast.success("Account Registered");
      }
    });
  };

  const handleUpdate = async (id) => {
    if (!editData.accountName) return toast.warning("Name Required");
    const payload = {
      accountName: editData.accountName,
      accountNumber: editData.accountNumber,
      arn: editData.arn?.arnCode || null
    };

    await simulateReload(async () => {
      const res = await request(`/accounts/${id}`, 'PUT', payload);
      if (res?.data) {
        // Update and re-sort
        setAccounts(prev => sortAccounts(prev.map(a => a._id === id ? res.data : a)));
        setEditingId(null);
        toast.success("Updated Successfully");
      }
    });
  };

  const executeDelete = async () => {
    await simulateReload(async () => {
      const res = await request(`/accounts/${deleteConfirm.id}`, 'DELETE');
      if (res?.success) {
        setAccounts(prev => prev.filter(a => a._id !== deleteConfirm.id));
        setDeleteConfirm(null);
        toast.success("Account Removed");
      }
    });
  };

  if (isInitialLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#FDFDFD] dark:bg-slate-950 pb-20 relative">
      
      {/* SYNC OVERLAY */}
      {isSyncing && (
        <div className="fixed inset-0 z-300 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-200">
           <div className="flex flex-col items-center gap-4">
              <RefreshCw className="animate-spin text-slate-950 dark:text-white" size={40} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-950 dark:text-white">Syncing Registry...</span>
           </div>
        </div>
      )}

      {/* HEADER */}
      <div className="px-6 py-10 md:px-12 md:pt-16 md:pb-10 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tighter italic">
            Bank <span className="text-emerald-500">Registry</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Multi-ARN Treasury Manager</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* ADD FORM */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-950 dark:border-slate-800 shadow-[8px_8px_0px_rgba(0,0,0,0.05)] mb-12 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
          <input 
            placeholder="BANK NAME"
            value={formData.accountName}
            onChange={e => setFormData({...formData, accountName: e.target.value})}
            className="w-full lg:flex-1 h-14 bg-slate-50 dark:bg-slate-800 px-6 text-[11px] font-black uppercase tracking-widest outline-none transition-all"
          />
          <input 
            placeholder="A/C NUMBER"
            value={formData.accountNumber}
            onChange={e => setFormData({...formData, accountNumber: e.target.value})}
            className="w-full lg:w-44 h-14 bg-slate-50 dark:bg-slate-800 px-6 text-[11px] font-black outline-none transition-all"
          />

          {/* Add Dropdown */}
          <div className="w-full lg:w-64 relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-14 bg-slate-50 dark:bg-slate-800 px-6 flex items-center justify-between text-[10px] font-black uppercase tracking-widest group"
            >
              <span className={formData.arn ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                {formData.arn ? formData.arn.arnCode : 'LINK ARN'}
              </span>
              <ChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-slate-950 z-100 shadow-2xl max-h-60 overflow-y-auto py-2">
                <div onClick={() => { setFormData({...formData, arn: null}); setIsDropdownOpen(false); }} className="px-6 py-4 hover:bg-slate-50 text-[10px] font-black text-rose-500 uppercase cursor-pointer italic border-b">No ARN</div>
                {arns?.map(arn => (
                  <div key={arn._id} onClick={() => { setFormData({...formData, arn: arn}); setIsDropdownOpen(false); }} className="px-6 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer border-b last:border-0">
                    <p className="text-[11px] font-black uppercase">{arn.arnCode}</p>
                    <p className="text-[9px] font-bold text-slate-400 italic">{arn.nickname}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleAdd} className="w-full lg:w-auto h-14 px-10 bg-slate-950 dark:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all">
            ADD
          </button>
        </div>

        {/* REGISTRY LIST */}
        <div className="space-y-6">
           {accounts?.map((acc) => {
             const arnInfo = acc.arn ? arns.find(a => a.arnCode === acc.arn) : null;
             const isEditing = editingId === acc._id;

             return (
               <div key={acc._id} className={`bg-white dark:bg-slate-900 border-2 transition-all p-6 ${isEditing ? 'border-emerald-500 shadow-xl' : 'border-slate-100 dark:border-slate-800'}`}>
                  {isEditing ? (
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-emerald-500 uppercase ml-1">Bank Nickname</label>
                             <input value={editData.accountName} onChange={e => setEditData(p => ({...p, accountName: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 p-4 text-sm font-black uppercase outline-none border-b-2 border-emerald-500" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-emerald-500 uppercase ml-1">A/C Number</label>
                             <input value={editData.accountNumber} onChange={e => setEditData(p => ({...p, accountNumber: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 p-4 text-sm font-black outline-none border-b-2 border-emerald-500" />
                          </div>
                       </div>
                       
                       <div className="relative space-y-1" ref={editDropdownRef}>
                          <label className="text-[9px] font-black text-emerald-500 uppercase ml-1">Linked ARN Entity</label>
                          <button type="button" onClick={() => setIsEditDropdownOpen(!isEditDropdownOpen)} className="w-full h-14 flex items-center justify-between bg-slate-50 dark:bg-slate-800 px-4 text-xs font-black uppercase border-b-2 border-emerald-500">
                             {editData.arn ? editData.arn.arnCode : 'NO ARN LINKED'}
                             <ChevronDown size={16} />
                          </button>
                          {isEditDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border-2 border-slate-950 z-110 shadow-2xl max-h-48 overflow-y-auto py-2">
                               <div onClick={() => { setEditData(p => ({...p, arn: null})); setIsEditDropdownOpen(false); }} className="px-6 py-3 hover:bg-slate-50 text-[10px] font-black text-rose-500 uppercase italic cursor-pointer border-b">Unlink ARN</div>
                               {arns?.map(arn => (
                                 <div key={arn._id} onClick={() => { setEditData(p => ({...p, arn: arn})); setIsEditDropdownOpen(false); }} className="px-6 py-3 hover:bg-emerald-50 cursor-pointer border-b last:border-0">
                                   <p className="text-[11px] font-black uppercase">{arn.arnCode}</p>
                                   <p className="text-[9px] font-bold text-slate-400 italic">{arn.nickname}</p>
                                 </div>
                               ))}
                            </div>
                          )}
                       </div>

                       <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <button onClick={() => handleUpdate(acc._id)} className="flex-1 h-12 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                             <Check size={16} strokeWidth={3} /> SAVE CHANGES
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-6 h-12 bg-slate-100 text-slate-500 font-black text-[10px] uppercase tracking-widest">
                             CANCEL
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 flex items-center justify-center bg-slate-950 text-white shrink-0">
                             <Landmark size={20} />
                          </div>
                          <div className="min-w-0">
                             <h4 className="text-xl font-[1000] text-slate-950 dark:text-white uppercase italic tracking-tighter leading-none mb-2 truncate">{acc.name}</h4>
                             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                <Hash size={12} className="text-emerald-500" /> {acc.accountNumber || '—— —— ——'}
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                          <div className="text-right">
                             {acc.arn ? (
                               <div className="flex flex-col items-end">
                                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] uppercase tracking-widest italic">
                                     <ShieldCheck size={14} strokeWidth={3} /> {acc.arn}
                                  </div>
                                  <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">{arnInfo?.nickname}</p>
                               </div>
                             ) : (
                               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic opacity-50">No ARN Link</span>
                             )}
                          </div>
                          
                          <div className="flex gap-1">
                             <button onClick={() => {
                               setEditingId(acc._id);
                               const currentArn = acc.arn ? arns.find(a => a.arnCode === acc.arn) : null;
                               setEditData({ accountName: acc.name, accountNumber: acc.accountNumber || '', arn: currentArn || null });
                             }} className="p-3 text-slate-300 hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                             <button onClick={() => setDeleteConfirm({id: acc._id, name: acc.name})} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
             )
           })}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-8 border-4 border-slate-950 shadow-[12px_12px_0px_rgba(0,0,0,0.1)]">
            <AlertTriangle className="text-rose-600 mb-6 mx-auto" size={40} />
            <h4 className="text-xl font-[1000] uppercase tracking-tighter italic text-center mb-4 leading-tight">Confirm Removal?</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase text-center mb-8 tracking-widest leading-relaxed">
              Unlinking <span className="text-slate-950 underline">{deleteConfirm.name}</span> will clear its registry entry.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={executeDelete} className="w-full py-4 bg-rose-600 text-white font-black uppercase text-[10px] tracking-widest">REMOVE ACCOUNT</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;