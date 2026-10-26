import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  Edit2, 
  Check, 
  Landmark, 
  Loader2, 
  AlertTriangle, 
  X, 
  Plus, 
  CreditCard,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

import { useApi } from '../../../hooks/useApi';
import PageHeader from '../../../components/Auth/PageHeader';

const BankAccounts = () => {
  const { request } = useApi();
  const [accounts, setAccounts] = useState([]);
  const [arns, setArns] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({ accountName: '', accountNumber: '', arnCode: '' });
  const [editData, setEditData] = useState({ accountName: '', accountNumber: '', arnCode: '' });

  const sortAccounts = (data) => [...data].sort((a, b) => a.name.localeCompare(b.name));

  const initRegistry = useCallback(async () => {
    try {
      const [arnRes, accRes] = await Promise.all([request('/arns'), request('/accounts')]);
      if (arnRes?.data) setArns(arnRes.data);
      if (accRes?.data) setAccounts(sortAccounts(accRes.data));
    } catch { 
      toast.error("Failed to load bank accounts"); 
    } finally { 
      setIsInitialLoading(false); 
    }
  }, [request]);

  useEffect(() => { 
    initRegistry();
  }, [initRegistry]);

  const handleAdd = async () => {
    if (!formData.accountName.trim()) return toast.warning("Please enter a bank name");
    const payload = { 
      accountName: formData.accountName.trim(), 
      accountNumber: formData.accountNumber.trim(), 
      arn: formData.arnCode || null 
    };
    
    const res = await request('/accounts', 'POST', payload);
    if (res?.data) {
      setAccounts(prev => sortAccounts([...prev, res.data]));
      setFormData({ accountName: '', accountNumber: '', arnCode: '' });
      toast.success("Bank account added successfully");
    }
  };

  const handleUpdate = async (id) => {
    if (!editData.accountName.trim()) return toast.warning("Bank name cannot be blank");
    const payload = { 
      accountName: editData.accountName.trim(), 
      accountNumber: editData.accountNumber.trim(), 
      arn: editData.arnCode || null 
    };

    const res = await request(`/accounts/${id}`, 'PUT', payload);
    if (res?.data) {
      setAccounts(prev => sortAccounts(prev.map(a => a._id === id ? res.data : a)));
      setEditingId(null);
      toast.success("Bank account updated");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/accounts/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setAccounts(prev => prev.filter(a => a._id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("Bank account removed");
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-emerald-500" size={36} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100rem] mx-auto space-y-6 animate-in fade-in duration-300 min-w-0 pb-32">
      
      {/* Universal Page Header */}
      <PageHeader 
        title="Bank"
        accent="Accounts"
        description="Add firm bank accounts, record account numbers, and assign each bank to its primary ARN license."
      />

      {/* QUICK ADD BOX */}
      <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Add New Bank Account
        </span>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <input 
            value={formData.accountName} 
            onChange={e => setFormData({ ...formData, accountName: e.target.value })} 
            placeholder="Bank Name (e.g. HDFC Bank, ICICI)" 
            className="w-full lg:w-1/3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold uppercase text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs" 
          />
          <input 
            value={formData.accountNumber} 
            onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} 
            placeholder="Account Number (Optional)" 
            className="w-full lg:w-1/3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs" 
          />
          
          <div className="relative w-full lg:w-1/4">
            <select 
              value={formData.arnCode} 
              onChange={e => setFormData({ ...formData, arnCode: e.target.value })} 
              className="w-full appearance-none bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold uppercase text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs cursor-pointer"
            >
              <option value="">No License Linked</option>
              {arns.map(arn => (
                <option key={arn._id} value={arn.arnCode}>
                  {arn.arnCode} ({arn.nickname})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>

          <button 
            type="button"
            onClick={handleAdd} 
            className="shrink-0 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Plus size={16} />
            <span>Add Bank</span>
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Cards */}
      <div className="lg:hidden flex flex-col gap-3">
        {accounts.map((acc) => (
          <div 
            key={acc._id} 
            className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-xs space-y-4"
          >
            {editingId === acc._id ? (
              <div className="space-y-3">
                <input 
                  value={editData.accountName} 
                  onChange={e => setEditData({ ...editData, accountName: e.target.value })} 
                  placeholder="Bank Name"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500 rounded-lg px-3 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none" 
                />
                <input 
                  value={editData.accountNumber} 
                  onChange={e => setEditData({ ...editData, accountNumber: e.target.value })} 
                  placeholder="Account Number"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none" 
                />
                <div className="relative">
                  <select 
                    value={editData.arnCode} 
                    onChange={e => setEditData({ ...editData, arnCode: e.target.value })} 
                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-emerald-500 rounded-lg px-3 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">No License Linked</option>
                    {arns.map(arn => (
                      <option key={arn._id} value={arn.arnCode}>
                        {arn.arnCode} ({arn.nickname})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button 
                    type="button"
                    onClick={() => handleUpdate(acc._id)} 
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check size={14} /> Save
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingId(null)} 
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-white/5">
                      <Landmark size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        {acc.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {acc.accountNumber || 'No A/C Number'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {acc.arn ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck size={11} /> {acc.arn}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Unlinked
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingId(acc._id);
                      setEditData({ accountName: acc.name, accountNumber: acc.accountNumber || '', arnCode: acc.arn || '' });
                    }} 
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200/80 dark:border-white/5"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDeleteConfirm({ id: acc._id, name: acc.name })} 
                    className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-200/60 dark:border-rose-500/20"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/10">
            <Landmark size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">No bank accounts registered yet.</p>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: Data Table */}
      <div className="hidden lg:block bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10">
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-1/3">
                Bank Name
              </th>
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-1/4">
                Account Number
              </th>
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-1/4">
                Linked License
              </th>
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {accounts.map((acc) => (
              <tr key={acc._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                {editingId === acc._id ? (
                  <td colSpan="4" className="p-3 bg-emerald-50/30 dark:bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                      <input 
                        value={editData.accountName} 
                        onChange={e => setEditData({ ...editData, accountName: e.target.value })} 
                        className="w-1/3 bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg px-3 py-1.5 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none" 
                      />
                      <input 
                        value={editData.accountNumber} 
                        onChange={e => setEditData({ ...editData, accountNumber: e.target.value })} 
                        placeholder="Optional Account #"
                        className="w-1/4 bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-white outline-none" 
                      />
                      <div className="relative w-1/4">
                        <select 
                          value={editData.arnCode} 
                          onChange={e => setEditData({ ...editData, arnCode: e.target.value })} 
                          className="w-full appearance-none bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg px-3 py-1.5 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none cursor-pointer"
                        >
                          <option value="">No License Linked</option>
                          {arns.map(arn => (
                            <option key={arn._id} value={arn.arnCode}>
                              {arn.arnCode}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                      </div>

                      <div className="flex items-center gap-2 ml-auto shrink-0">
                        <button 
                          type="button"
                          onClick={() => handleUpdate(acc._id)} 
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                        >
                          <Check size={14} /> Save
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditingId(null)} 
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          <Landmark size={15} />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {acc.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                        <CreditCard size={13} className="text-slate-400" />
                        <span>{acc.accountNumber || '——'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {acc.arn ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck size={12} /> {acc.arn}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-md text-[10px] font-semibold uppercase tracking-wider">
                          Unlinked
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingId(acc._id);
                            setEditData({ accountName: acc.name, accountNumber: acc.accountNumber || '', arnCode: acc.arn || '' });
                          }} 
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                          title="Edit account"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDeleteConfirm({ id: acc._id, name: acc.name })} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}

            {accounts.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Landmark size={28} className="opacity-30" />
                    <span className="text-xs font-semibold">No bank accounts registered yet.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Bank Account</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Remove account from records</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirm.name}</strong>? Any past transactions linked to this account will retain their data, but this entry will be removed from your active accounts.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setDeleteConfirm(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={executeDelete} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BankAccounts;