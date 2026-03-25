import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Wallet, Loader2, AlertTriangle, Landmark } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const BankAccounts = () => {
  const { request } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({ accountName: '', accountNumber: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ accountName: '', accountNumber: '' });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAccounts = async () => {
      try {
        const res = await request('/accounts');
        if (isMounted && res?.data) setAccounts(res.data);
      } catch {
        toast.error("Account Sync Failed");
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };
    fetchAccounts();
    return () => { isMounted = false; };
  }, [request]);

  const handleAdd = async () => {
    // Only accountName is strictly required now
    if (!formData.accountName) return toast.warning("Bank Name is required");
    
    const res = await request('/accounts', 'POST', formData);
    if (res?.data) {
      setAccounts(prev => [...prev, res.data]);
      setFormData({ accountName: '', accountNumber: '' });
      toast.success("Bank Account Registered");
    }
  };

  const handleUpdate = async (id) => {
    // Only accountName is strictly required for updates
    if (!editData.accountName) return toast.warning("Bank Name is required");

    const res = await request(`/accounts/${id}`, 'PUT', editData);
    if (res?.data) {
      setAccounts(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("Account Details Updated");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/accounts/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setAccounts(prev => prev.filter(a => a._id !== deleteConfirm.id));
      toast.success("Account Removed");
      setDeleteConfirm(null);
    }
  };

  if (isInitialLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Ledgers</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Delete Confirmation Overlay */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-4xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h4 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase italic tracking-tighter text-balance">Remove Account?</h4>
            <p className="text-sm text-slate-500 text-center mt-2 font-medium">This will remove <span className="font-black text-slate-900 dark:text-slate-200 uppercase">{deleteConfirm.name}</span> from the active registry.</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tighter">Bank Accounts</h3>
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Financial Buckets</p>
      </div>

      {/* Registration Header / Input */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 bg-white dark:bg-slate-950 p-3 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm focus-within:border-blue-500/40 transition-all">
        <div className="lg:col-span-3">
          <input 
            placeholder="Account Nickname (Required)"
            value={formData.accountName}
            onChange={e => setFormData({...formData, accountName: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-5 py-4 text-sm font-black outline-none dark:text-white placeholder:text-slate-400"
          />
        </div>
        <div className="lg:col-span-2">
          <input 
            placeholder="A/C Number (Optional)"
            value={formData.accountNumber}
            onChange={e => setFormData({...formData, accountNumber: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-5 py-4 text-sm font-black outline-none dark:text-white placeholder:text-slate-400"
          />
        </div>
        <button onClick={handleAdd} className="lg:col-span-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
          <Landmark size={18} /> Add Account
        </button>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 gap-4">
        {accounts.length === 0 ? (
           <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-4xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No bank accounts configured</p>
           </div>
        ) : accounts.map((acc) => (
          <div key={acc._id} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl hover:border-blue-500/30 transition-all group">
            <div className="flex items-center gap-6 flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${editingId === acc._id ? 'bg-blue-600 text-white animate-pulse' : 'bg-blue-600/10 text-blue-600'}`}>
                <Wallet size={28} />
              </div>
              
              {editingId === acc._id ? (
                <div className="flex gap-4 flex-1 pr-4">
                  <input 
                    value={editData.accountName} 
                    onChange={e => setEditData({...editData, accountName: e.target.value})} 
                    className="bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 rounded-xl px-4 py-2 text-sm font-black dark:text-white w-1/2 outline-none" 
                  />
                  <input 
                    placeholder="Account Number (Optional)"
                    value={editData.accountNumber} 
                    onChange={e => setEditData({...editData, accountNumber: e.target.value})} 
                    className="bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 rounded-xl px-4 py-2 text-sm font-black dark:text-white w-1/2 outline-none" 
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-lg font-[1000] text-slate-800 dark:text-white uppercase italic leading-none">
                    {acc.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {acc.accountNumber && (
                      <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        A/C: {acc.accountNumber}
                      </span>
                    )}
                    <span className="text-[9px] font-bold text-blue-500/50 uppercase tracking-widest">{acc.category || 'Bank'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {editingId === acc._id ? (
                <>
                  <button onClick={() => handleUpdate(acc._id)} className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl transition-all hover:bg-emerald-100"><Check size={20}/></button>
                  <button onClick={() => setEditingId(null)} className="p-3 text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-xl transition-all hover:bg-rose-100"><X size={20}/></button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setEditingId(acc._id); 
                      setEditData({accountName: acc.name, accountNumber: acc.accountNumber || ''});
                    }} 
                    className="p-3 text-slate-400 hover:text-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                  >
                    <Edit2 size={20}/>
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm({id: acc._id, name: acc.name})} 
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-100/50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                  >
                    <Trash2 size={20}/>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankAccounts;