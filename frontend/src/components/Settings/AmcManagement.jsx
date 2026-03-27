import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Landmark, Loader2, AlertTriangle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const AmcManagement = () => {
  const { request } = useApi();
  const [amcs, setAmcs] = useState([]);
  const [newAmc, setNewAmc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Stores {id, name}

  useEffect(() => {
    let isMounted = true;
    const fetchAmcs = async () => {
      try {
        const res = await request('/amcs');
        if (isMounted && res?.data) setAmcs(res.data);
      } catch {
        toast.error("Registry Sync Failed");
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };
    fetchAmcs();
    return () => { isMounted = false; };
  }, [request]);

  const handleAdd = async () => {
    if (!newAmc.trim()) return toast.warning("Name Required");
    const res = await request('/amcs', 'POST', { name: newAmc });
    if (res?.data) {
      setAmcs(prev => [...prev, res.data]);
      setNewAmc('');
      toast.success("AMC Registered");
    }
  };

  const handleUpdate = async (id) => {
    if (!editValue.trim()) return;
    const res = await request(`/amcs/${id}`, 'PUT', { name: editValue });
    if (res?.data) {
      setAmcs(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("Update Complete");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/amcs/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setAmcs(prev => prev.filter(a => a._id !== deleteConfirm.id));
      toast.success("AMC Removed");
      setDeleteConfirm(null);
    }
  };

  if (isInitialLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Delete Confirmation Overlay */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h4 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase italic tracking-tighter">Confirm Deletion</h4>
            <p className="text-sm text-slate-500 text-center mt-2 font-medium">Are you sure you want to remove <span className="font-black text-slate-900 dark:text-slate-200 uppercase">{deleteConfirm.name}</span>?</p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 rounded-lg font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tighter">AMC Registry</h3>
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Master Asset Management List</p>
      </div>

      <div className="flex gap-3 bg-white dark:bg-slate-950 p-2 rounded-lg border-2 border-slate-100 dark:border-slate-800 focus-within:border-emerald-500/50 transition-all">
        <input 
          value={newAmc}
          onChange={(e) => setNewAmc(e.target.value)}
          placeholder="New AMC Name"
          className="flex-1 bg-transparent px-5 py-3 text-sm font-black outline-none dark:text-white"
        />
        <button onClick={handleAdd} className="bg-emerald-600 text-white px-8 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-colors">Add AMC</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amcs.map((amc) => (
          <div key={amc._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-transparent hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-4 flex-1">
              <Landmark size={20} className={editingId === amc._id ? "text-emerald-500" : "text-slate-400"} />
              {editingId === amc._id ? (
                <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdate(amc._id)} className="bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-lg px-3 py-1.5 text-sm font-black w-full outline-none dark:text-white" />
              ) : (
                <span className="text-sm font-[1000] text-slate-700 dark:text-slate-200 uppercase tracking-tight">{amc.name}</span>
              )}
            </div>
            <div className="flex gap-1 ml-4">
              {editingId === amc._id ? (
                <button onClick={() => handleUpdate(amc._id)} className="p-2 text-emerald-600 bg-white dark:bg-slate-800 rounded-sm shadow-sm"><Check size={18}/></button>
              ) : (
                <button onClick={() => {setEditingId(amc._id); setEditValue(amc.name)}} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 rounded-sm transition-all"><Edit2 size={18}/></button>
              )}
              <button onClick={() => setDeleteConfirm({id: amc._id, name: amc.name})} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-100/50 dark:hover:bg-rose-900/20 rounded-sm transition-all"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmcManagement;