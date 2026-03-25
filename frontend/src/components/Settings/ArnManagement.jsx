import React, { useState, useEffect } from 'react';
import { Trash2, Shield, Loader2, UserCheck, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const ArnManagement = () => {
  const { request } = useApi();
  const [arns, setArns] = useState([]);
  const [formData, setFormData] = useState({ arnCode: '', nickname: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ arnCode: '', nickname: '' });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchArns = async () => {
      try {
        const res = await request('/arns');
        if (isMounted && res?.data) setArns(res.data);
      } catch {
        toast.error("Fetch Failed");
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };
    fetchArns();
    return () => { isMounted = false; };
  }, [request]);

  const handleAdd = async () => {
    if (!formData.arnCode || !formData.nickname) return toast.warning("Missing Fields");
    const res = await request('/arns', 'POST', formData);
    if (res?.data) {
      setArns(prev => [...prev, res.data]);
      setFormData({ arnCode: '', nickname: '' });
      toast.success("License Registered");
    }
  };

  const handleUpdate = async (id) => {
    const res = await request(`/arns/${id}`, 'PUT', editData);
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("License Updated");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/arns/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setArns(prev => prev.filter(a => a._id !== deleteConfirm.id));
      toast.success("ARN Removed");
      setDeleteConfirm(null);
    }
  };

  if (isInitialLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Delete Confirmation Overlay */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-4xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h4 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase italic tracking-tighter">Remove ARN?</h4>
            <p className="text-sm text-slate-500 text-center mt-2 font-medium">Permanently delete license <span className="font-black text-slate-900 dark:text-slate-200 uppercase">{deleteConfirm.code}</span>?</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all">Revoke</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tighter">ARN List</h3>
        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Distributor Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 bg-white dark:bg-slate-950 p-3 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm focus-within:border-amber-500/40 transition-all">
        <div className="lg:col-span-3">
          <input 
            placeholder="ARN Code"
            value={formData.arnCode}
            onChange={e => setFormData({...formData, arnCode: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-5 py-4 text-sm font-black outline-none dark:text-white"
          />
        </div>
        <div className="lg:col-span-2">
          <input 
            placeholder="Nickname"
            value={formData.nickname}
            onChange={e => setFormData({...formData, nickname: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl px-5 py-4 text-sm font-black outline-none dark:text-white"
          />
        </div>
        <button onClick={handleAdd} className="lg:col-span-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all">
          <UserCheck size={18} /> Register
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {arns.map((arn) => (
          <div key={arn._id} className="flex items-center justify-between p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-4xl hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-6 flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${editingId === arn._id ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-600'}`}>
                <Shield size={28} />
              </div>
              
              {editingId === arn._id ? (
                <div className="flex gap-4 flex-1">
                  <input value={editData.arnCode} onChange={e => setEditData({...editData, arnCode: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border-2 border-amber-500 rounded-xl px-4 py-2 text-sm font-black dark:text-white w-1/2" />
                  <input value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border-2 border-amber-500 rounded-xl px-4 py-2 text-sm font-black dark:text-white w-1/2" />
                </div>
              ) : (
                <div>
                  <p className="text-lg font-[1000] text-slate-800 dark:text-white uppercase italic leading-none">{arn.arnCode}</p>
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase mt-2 inline-block bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{arn.nickname}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {editingId === arn._id ? (
                <button onClick={() => handleUpdate(arn._id)} className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl transition-all"><Check size={20}/></button>
              ) : (
                <button onClick={() => {setEditingId(arn._id); setEditData({arnCode: arn.arnCode, nickname: arn.nickname})}} className="p-3 text-slate-400 hover:text-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-xl transition-all"><Edit2 size={20}/></button>
              )}
              <button onClick={() => setDeleteConfirm({id: arn._id, code: arn.arnCode})} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-100/50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArnManagement;