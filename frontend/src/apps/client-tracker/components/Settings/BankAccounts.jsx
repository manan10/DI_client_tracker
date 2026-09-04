import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Edit2, Check, Landmark, Loader2, 
  AlertTriangle, ShieldCheck, X, Plus, CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

import { useApi } from '../../../../shared/hooks/useApi';

const BankAccounts = () => {
  const { request } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [arns, setArns] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Simplified state: using strings instead of objects for native selects
  const [formData, setFormData] = useState({ accountName: '', accountNumber: '', arnCode: '' });
  const [editData, setEditData] = useState({ accountName: '', accountNumber: '', arnCode: '' });

  const sortAccounts = (data) => [...data].sort((a, b) => a.name.localeCompare(b.name));

  const initRegistry = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([request('/arns'), request('/accounts')]);
      if (arnRes?.data) setArns(arnRes.data);
      if (accRes?.data) setAccounts(sortAccounts(accRes.data));
    } catch { 
      toast.error("Failed to synchronize bank registry"); 
    } finally { 
      setIsInitialLoading(false); 
    }
  }, [request]);

  useEffect(() => { 
    initRegistry();
  }, [initRegistry]);

  const handleAdd = async () => {
    if (!formData.accountName) return toast.warning("Bank Name Required");
    const payload = { 
        accountName: formData.accountName, 
        accountNumber: formData.accountNumber, 
        arn: formData.arnCode || null 
    };
    
    const res = await request('/accounts', 'POST', payload);
    if (res?.data) {
        setAccounts(prev => sortAccounts([...prev, res.data]));
        setFormData({ accountName: '', accountNumber: '', arnCode: '' });
        toast.success("Bank Account Registered");
    }
  };

  const handleUpdate = async (id) => {
    if (!editData.accountName) return toast.warning("Bank Name Required");
    const payload = { 
        accountName: editData.accountName, 
        accountNumber: editData.accountNumber, 
        arn: editData.arnCode || null 
    };

    const res = await request(`/accounts/${id}`, 'PUT', payload);
    if (res?.data) {
        setAccounts(prev => sortAccounts(prev.map(a => a._id === id ? res.data : a)));
        setEditingId(null);
        toast.success("Account Details Updated");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/accounts/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
        setAccounts(prev => prev.filter(a => a._id !== deleteConfirm.id));
        setDeleteConfirm(null);
        toast.success("Bank Account Removed");
    }
  };

  if (isInitialLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="w-full pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Bank Accounts</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Treasury Asset Configuration</p>
      </div>

      {/* Control Bar (Registration Form) */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-md p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-end gap-4">
            <div className="w-full lg:w-1/3 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Bank Name</label>
                <input 
                  value={formData.accountName} 
                  onChange={e => setFormData({...formData, accountName: e.target.value})} 
                  placeholder="e.g. HDFC Bank"
                  className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" 
                />
            </div>
            <div className="w-full lg:w-1/3 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">A/C Number</label>
                <input 
                  value={formData.accountNumber} 
                  onChange={e => setFormData({...formData, accountNumber: e.target.value})} 
                  placeholder="Optional"
                  className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" 
                />
            </div>
            <div className="w-full lg:w-1/4 space-y-1.5 relative">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Linked ARN</label>
                <select 
                  value={formData.arnCode} 
                  onChange={e => setFormData({...formData, arnCode: e.target.value})} 
                  className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm appearance-none cursor-pointer"
                >
                    <option value="">-- UNLINKED --</option>
                    {arns.map(arn => (
                        <option key={arn._id} value={arn.arnCode}>{arn.arnCode}</option>
                    ))}
                </select>
            </div>
            <button 
              onClick={handleAdd} 
              className="w-full lg:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 py-2 px-5 shadow-sm"
            >
              <Plus size={16} /> Add Bank
            </button>
        </div>
      </div>

      {/* MOBILE VIEW: Stacked Cards (Zero Horizontal Scroll) */}
      <div className="lg:hidden flex flex-col gap-4">
        {accounts.map((acc) => (
          <div key={acc._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md p-4 shadow-sm flex flex-col gap-4">
            
            {editingId === acc._id ? (
               <div className="flex flex-col gap-3">
                  <input 
                    value={editData.accountName} 
                    onChange={e => setEditData({...editData, accountName: e.target.value})} 
                    placeholder="Bank Name"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500/50 rounded-md px-3 py-2 text-sm font-bold uppercase text-slate-900 dark:text-white outline-none" 
                  />
                  <input 
                    value={editData.accountNumber} 
                    onChange={e => setEditData({...editData, accountNumber: e.target.value})} 
                    placeholder="Account Number"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500/50 rounded-md px-3 py-2 text-sm font-bold uppercase text-slate-900 dark:text-white outline-none" 
                  />
                  <select 
                    value={editData.arnCode} 
                    onChange={e => setEditData({...editData, arnCode: e.target.value})} 
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500/50 rounded-md px-3 py-2 text-sm font-bold uppercase text-slate-900 dark:text-white outline-none appearance-none"
                  >
                      <option value="">-- UNLINKED --</option>
                      {arns.map(arn => (
                          <option key={arn._id} value={arn.arnCode}>{arn.arnCode}</option>
                      ))}
                  </select>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleUpdate(acc._id)} className="flex-1 py-2 bg-emerald-600 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"><Check size={14} /> Save</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"><X size={14} /> Cancel</button>
                  </div>
               </div>
            ) : (
               <>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md shrink-0">
                      <Landmark size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{acc.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono mt-0.5">{acc.accountNumber || '——'}</div>
                    </div>
                  </div>
                  {/* Access Level Badge */}
                  <div className="shrink-0">
                     {acc.arn 
                        ? <span className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded text-[9px] font-bold uppercase tracking-wider"><ShieldCheck size={10}/> {acc.arn}</span>
                        : <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider">UNLINKED</span>
                     }
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
                  <button onClick={() => { setEditingId(acc._id); setEditData({ accountName: acc.name, accountNumber: acc.accountNumber || '', arnCode: acc.arn || '' }); }} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-md transition-colors"><Edit2 size={14}/> Edit Details</button>
                  <button onClick={() => setDeleteConfirm({id: acc._id, name: acc.name})} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-md transition-colors"><Trash2 size={14}/> Delete</button>
                </div>
               </>
            )}
          </div>
        ))}
        {accounts.length === 0 && (
           <div className="p-8 text-center text-slate-500 bg-white dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-white/5">
              <Landmark size={28} className="mx-auto mb-2 opacity-30" />
              <div className="text-sm font-bold">No Banks Registered</div>
           </div>
        )}
      </div>

      {/* DESKTOP VIEW: Data Table */}
      <div className="hidden lg:block bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-2/5">Bank Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-1/4">Account Number</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-1/5">ARN Mapping</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-auto text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {accounts.map((acc) => (
                <tr key={acc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  
                  {editingId === acc._id ? (
                    /* EDIT MODE ROW */
                    <td colSpan="4" className="p-0">
                      <div className="flex items-center gap-4 px-6 py-2.5 bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-emerald-500">
                        <input 
                          value={editData.accountName} 
                          onChange={e => setEditData({...editData, accountName: e.target.value})} 
                          className="w-2/5 bg-white dark:bg-[#0B1120] border border-emerald-200 dark:border-emerald-500/30 rounded-md px-3 py-1.5 text-sm font-semibold uppercase text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm" 
                        />
                        <input 
                          value={editData.accountNumber} 
                          onChange={e => setEditData({...editData, accountNumber: e.target.value})} 
                          className="w-1/4 bg-white dark:bg-[#0B1120] border border-emerald-200 dark:border-emerald-500/30 rounded-md px-3 py-1.5 text-sm font-semibold uppercase text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm" 
                        />
                        <select 
                          value={editData.arnCode} 
                          onChange={e => setEditData({...editData, arnCode: e.target.value})} 
                          className="w-1/5 bg-white dark:bg-[#0B1120] border border-emerald-200 dark:border-emerald-500/30 rounded-md px-3 py-1.5 text-sm font-semibold uppercase text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm appearance-none"
                        >
                            <option value="">-- UNLINKED --</option>
                            {arns.map(arn => (
                                <option key={arn._id} value={arn.arnCode}>{arn.arnCode}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                          <button onClick={() => handleUpdate(acc._id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm">
                            <Check size={14} /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors shadow-sm">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    /* VIEW MODE ROW */
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
                            <Landmark size={16} strokeWidth={2.5} />
                          </div>
                          <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{acc.name}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-mono font-medium">
                            <CreditCard size={14} className="opacity-50" />
                            {acc.accountNumber || '——'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                         {acc.arn ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                <ShieldCheck size={12} /> {acc.arn}
                            </span>
                         ) : (
                            <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                                UNLINKED
                            </span>
                         )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setEditingId(acc._id); setEditData({ accountName: acc.name, accountNumber: acc.accountNumber || '', arnCode: acc.arn || '' }); }} 
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
                            title="Edit Details"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm({id: acc._id, name: acc.name})} 
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              
              {accounts.length === 0 && (
                 <tr>
                   <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <Landmark size={28} className="opacity-30" />
                         <span className="text-sm font-medium">No Bank Accounts Found</span>
                      </div>
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg w-full max-w-sm shadow-xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center shrink-0">
                 <AlertTriangle className="text-rose-600 dark:text-rose-500" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Remove Account?</h3>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to completely delete <span className="font-bold text-slate-900 dark:text-white">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3 flex-col sm:flex-row">
              <button onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-semibold transition-colors shadow-sm">
                Delete Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;