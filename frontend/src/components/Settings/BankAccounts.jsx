import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trash2, Edit2, Check, Landmark, Loader2, 
  AlertTriangle, ChevronDown, ShieldCheck, X 
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const BankAccounts = () => {
  const { request } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [arns, setArns] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({ accountName: '', accountNumber: '', arn: null });
  const [editData, setEditData] = useState({ accountName: '', accountNumber: '', arn: null });

  const sortAccounts = (data) => [...data].sort((a, b) => a.name.localeCompare(b.name));

  const initRegistry = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([request('/arns'), request('/accounts')]);
      if (arnRes?.data) setArns(arnRes.data);
      if (accRes?.data) setAccounts(sortAccounts(accRes.data));
    } catch { toast.error("Sync Failed"); }
    finally { setIsInitialLoading(false); }
  }, [request]);

  useEffect(() => { 
    initRegistry();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [initRegistry]);

  const handleAdd = async () => {
    if (!formData.accountName) return toast.warning("Bank Name Required");
    const payload = { accountName: formData.accountName, accountNumber: formData.accountNumber, arn: formData.arn?.arnCode || null };
    const res = await request('/accounts', 'POST', payload);
    if (res?.data) {
        setAccounts(prev => sortAccounts([...prev, res.data]));
        setFormData({ accountName: '', accountNumber: '', arn: null });
        toast.success("Account Registered");
    }
  };

  const handleUpdate = async (id) => {
    if (!editData.accountName) return toast.warning("Name Required");
    const payload = { accountName: editData.accountName, accountNumber: editData.accountNumber, arn: editData.arn?.arnCode || null };
    const res = await request(`/accounts/${id}`, 'PUT', payload);
    if (res?.data) {
        setAccounts(prev => sortAccounts(prev.map(a => a._id === id ? res.data : a)));
        setEditingId(null);
        toast.success("Updated Successfully");
    }
  };

  const executeDelete = async () => {
    const res = await request(`/accounts/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
        setAccounts(prev => prev.filter(a => a._id !== deleteConfirm.id));
        setDeleteConfirm(null);
        toast.success("Account Removed");
    }
  };

  if (isInitialLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-white pb-64 px-4 md:px-12">
      
      {/* HEADER */}
      <div className="py-10 border-b border-slate-100 mb-10">
          <h1 className="text-xl font-black uppercase italic tracking-tighter border-l-4 border-emerald-600 pl-4">Bank Registry</h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 pl-5">Treasury Asset Configuration</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* ADD FORM - In a Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Register New Bank</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Bank Name</label>
                    <input value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="w-full bg-slate-50 rounded-lg px-4 py-3 text-[11px] font-black uppercase outline-none focus:ring-1 ring-emerald-500" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">A/C Number</label>
                    <input value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-slate-50 rounded-lg px-4 py-3 text-[11px] font-black uppercase outline-none focus:ring-1 ring-emerald-500" />
                </div>
                <div className="relative space-y-1.5" ref={dropdownRef}>
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Linked ARN</label>
                    <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full h-11.25 flex items-center justify-between bg-slate-50 rounded-lg px-4 text-[10px] font-black uppercase outline-none">
                        {formData.arn ? formData.arn.arnCode : 'SELECT ARN'}
                        <ChevronDown size={14} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 w-full bg-white border border-slate-200 z-50 shadow-xl max-h-40 overflow-y-auto mt-1 rounded-lg">
                            <div onClick={() => { setFormData({...formData, arn: null}); setIsDropdownOpen(false); }} className="px-4 py-3 text-[9px] font-black text-rose-500 uppercase cursor-pointer border-b">NONE</div>
                            {arns.map(arn => (
                                <div key={arn._id} onClick={() => { setFormData({...formData, arn}); setIsDropdownOpen(false); }} className="px-4 py-3 text-[9px] font-black uppercase hover:bg-slate-50 cursor-pointer border-b">{arn.arnCode}</div>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={handleAdd} className="bg-emerald-600 text-white h-11.25 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-700 transition-all">Add Bank</button>
            </div>
        </div>

        {/* REGISTRY LIST - Flat/No Container */}
        <div className="divide-y divide-slate-100">
           {accounts?.map((acc) => {
              const isEditing = editingId === acc._id;
              return (
                <div key={acc._id} className="py-6">
                   {isEditing ? (
                       <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in fade-in">
                           <div className="space-y-1">
                               <label className="text-[9px] font-black text-emerald-700 uppercase ml-1">Name</label>
                               <input value={editData.accountName} onChange={e => setEditData(p => ({...p, accountName: e.target.value}))} className="w-full bg-white rounded-lg px-4 py-3 text-[10px] font-black uppercase outline-none" />
                           </div>
                           <div className="space-y-1">
                               <label className="text-[9px] font-black text-emerald-700 uppercase ml-1">A/C Number</label>
                               <input value={editData.accountNumber} onChange={e => setEditData(p => ({...p, accountNumber: e.target.value}))} className="w-full bg-white rounded-lg px-4 py-3 text-[10px] font-black uppercase outline-none" />
                           </div>
                           <div className="flex gap-2">
                               <button onClick={() => handleUpdate(acc._id)} className="flex-1 bg-emerald-600 text-white text-[9px] font-black uppercase rounded py-3">Save</button>
                               <button onClick={() => setEditingId(null)} className="flex-1 bg-white border border-slate-200 text-slate-500 text-[9px] font-black uppercase rounded py-3">Cancel</button>
                           </div>
                       </div>
                   ) : (
                       <div className="flex items-center justify-between">
                           <div>
                               <h4 className="text-[11px] font-black uppercase text-slate-900">{acc.name}</h4>
                               <p className="text-[9px] font-mono text-slate-400 mt-1">{acc.accountNumber || '——'}</p>
                           </div>
                           <div className="flex items-center gap-8">
                               <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase">
                                   <ShieldCheck size={12} /> {acc.arn || 'UNLINKED'}
                               </div>
                               <div className="flex gap-4">
                                   <button onClick={() => {
                                      setEditingId(acc._id);
                                      setEditData({ accountName: acc.name, accountNumber: acc.accountNumber || '', arn: arns.find(a => a.arnCode === acc.arn) || null });
                                   }} className="text-slate-300 hover:text-emerald-600 transition-colors"><Edit2 size={14} /></button>
                                   <button onClick={() => setDeleteConfirm({id: acc._id, name: acc.name})} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                               </div>
                           </div>
                       </div>
                   )}
                </div>
              );
           })}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/90 backdrop-blur-sm">
            <div className="bg-white border border-slate-100 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
                <AlertTriangle className="mx-auto mb-4 text-rose-500" size={32}/>
                <p className="text-[10px] font-black uppercase mb-6">Confirm removal of {deleteConfirm.name}?</p>
                <div className="flex gap-2">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 rounded-lg text-[9px] font-black uppercase">Abort</button>
                    <button onClick={executeDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;