import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Edit2, Check, Landmark, Loader2, 
  AlertTriangle, Search, Globe, Settings2, Link as LinkIcon, 
  Save, X, Activity
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';

const AmcManagement = () => {
  const { request } = useApi();
  const [amcs, setAmcs] = useState([]);
  const [arns, setArns] = useState([]);
  const [selectedArn, setSelectedArn] = useState(null);
  const [stagedAmcIds, setStagedAmcIds] = useState([]);
  
  const [showMaster, setShowMaster] = useState(false);
  const [newAmc, setNewAmc] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [amcRes, arnRes] = await Promise.all([request('/amcs'), request('/arns')]);
        if (isMounted) {
          setAmcs(amcRes?.data || []);
          const fetchedArns = arnRes?.data || [];
          setArns(fetchedArns);
          if (fetchedArns.length > 0) {
            setSelectedArn(fetchedArns[0]);
            setStagedAmcIds(fetchedArns[0].allowedAmcs?.map(a => a._id || a) || []);
          }
        }
      } catch { toast.error("Sync Error"); }
      finally { if (isMounted) setIsInitialLoading(false); }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [request]);

  const filteredAmcs = useMemo(() => {
    return [...amcs]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [amcs, search]);

  // Master Actions
  const handleAddGlobal = async () => {
    if (!newAmc.trim()) return toast.warning("Name Required");
    const res = await request('/amcs', 'POST', { name: newAmc });
    if (res?.data) {
      setAmcs(prev => [...prev, res.data]);
      setNewAmc('');
      toast.success("Registered to Master");
    }
  };

  const handleUpdateGlobal = async (id) => {
    if (!editValue.trim()) return;
    const res = await request(`/amcs/${id}`, 'PUT', { name: editValue });
    if (res?.data) {
      setAmcs(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("Master Name Updated");
    }
  };

  const executeDeleteGlobal = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/amcs/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setAmcs(prev => prev.filter(a => a._id !== deleteConfirm.id));
      setStagedAmcIds(prev => prev.filter(id => id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("Removed from Infrastructure");
    }
  };

  // Mapping Actions
  const toggleStagedAmc = (id) => {
    setStagedAmcIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleArnSelect = (arn) => {
    setSelectedArn(arn);
    setStagedAmcIds(arn.allowedAmcs?.map(a => a._id || a) || []);
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const res = await request(`/arns/${selectedArn._id}/amcs/batch`, 'PUT', { amcIds: stagedAmcIds });
      if (res?.success) {
        const updatedArns = arns.map(arn => 
          arn._id === selectedArn._id ? { ...arn, allowedAmcs: res.data.allowedAmcs } : arn
        );
        setArns(updatedArns);
        setSelectedArn({ ...selectedArn, allowedAmcs: res.data.allowedAmcs });
        toast.success("Workspace Synced");
      }
    } catch { 
      toast.error("Sync Failed"); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const hasChanges = useMemo(() => {
    if (!selectedArn) return false;
    const current = selectedArn.allowedAmcs?.map(a => a._id || a) || [];
    return current.length !== stagedAmcIds.length || !current.every(id => stagedAmcIds.includes(id));
  }, [selectedArn, stagedAmcIds]);

  if (isInitialLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* 1. TOP NAV */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          
          {/* Header Title Section - Always on Top */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">AMC Registry</h1>
              <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1">Infrastructure Configuration</p>
            </div>
            
            <button 
              onClick={() => setShowMaster(!showMaster)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  showMaster ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Globe size={14} /> <span className="hidden sm:inline">Master List</span>
            </button>
          </div>

          {/* Tab Selection Row */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            <div className="p-2 bg-emerald-500 text-white rounded-lg hidden md:block"><Settings2 size={18}/></div>
            {arns.map(arn => (
              <button 
                key={arn._id} onClick={() => handleArnSelect(arn)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 whitespace-nowrap ${
                  selectedArn?._id === arn._id 
                  ? 'bg-slate-950 border-slate-950 text-white dark:bg-emerald-600 dark:border-emerald-600 shadow-lg' 
                  : 'bg-white border-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700 hover:border-emerald-500/30'
                }`}
              >
                {arn.nickname}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        
        {/* 2. MASTER DIRECTORY PANEL */}
        {showMaster && (
            <div className="mb-10 p-6 bg-white dark:bg-slate-900 rounded-4xl border-2 border-emerald-500/20 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900 dark:text-white italic">Global AMC Management</h3>
                    <button onClick={() => setShowMaster(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={18}/></button>
                </div>
                <div className="flex gap-3 mb-8 max-w-md">
                    <input 
                      value={newAmc} onChange={e => setNewAmc(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddGlobal()}
                      placeholder="Add AMC name..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                    />
                    <button onClick={handleAddGlobal} className="bg-emerald-600 text-white px-6 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all">Register</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {amcs.sort((a,b) => a.name.localeCompare(b.name)).map(amc => (
                        <div key={amc._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group">
                            <div className="flex-1 min-w-0">
                                {editingId === amc._id ? (
                                    <input 
                                        autoFocus value={editValue} 
                                        onChange={e => setEditValue(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleUpdateGlobal(amc._id)}
                                        className="bg-white dark:bg-slate-700 text-[10px] font-black p-1 w-full outline-none border-b-2 border-emerald-500 dark:text-white"
                                    />
                                ) : (
                                    <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 truncate pr-2">{amc.name}</span>
                                )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                                {editingId === amc._id ? (
                                    <button onClick={() => handleUpdateGlobal(amc._id)} className="p-1 text-emerald-500"><Check size={14}/></button>
                                ) : (
                                    <button onClick={() => {setEditingId(amc._id); setEditValue(amc.name)}} className="p-1 text-slate-400 hover:text-emerald-500"><Edit2 size={12}/></button>
                                )}
                                <button onClick={() => setDeleteConfirm({id: amc._id, name: amc.name})} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 size={12}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 3. SEARCH & STATUS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`Filter workspace for ${selectedArn?.nickname}...`}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/20 rounded-2xl text-xs font-black uppercase outline-none shadow-sm transition-all dark:text-white"
                />
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-900 dark:text-white">{stagedAmcIds.length} Linked</span>
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-800" />
                <span>{amcs.length} Global Total</span>
            </div>
        </div>

        {/* 4. MULTI-COLUMN MAPPING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredAmcs.map((amc) => {
                const isLinked = stagedAmcIds.includes(amc._id);
                return (
                    <div 
                        key={amc._id}
                        onClick={() => toggleStagedAmc(amc._id)}
                        className={`flex items-center justify-between p-4 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
                            isLinked 
                            ? 'bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-500 shadow-xl shadow-emerald-500/5' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isLinked ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                            }`}>
                                {isLinked ? <Check size={18} strokeWidth={3} /> : <Landmark size={18} />}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-[11px] font-black uppercase tracking-tight truncate ${isLinked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                    {amc.name}
                                </p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {isLinked ? 'Registry Active' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-500 flex items-center px-1 ${
                            isLinked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                        }`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${isLinked ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* 5. FLOATING SAVE */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
          <div className="bg-slate-950 dark:bg-emerald-600 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-10">
            <div className="pl-2">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Configuration Staged</p>
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-emerald-400 animate-pulse" />
                <p className="text-xs font-black text-white uppercase italic">Commit Workspace Changes</p>
              </div>
            </div>
            <button 
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-emerald-50 active:scale-95 transition-all"
            >
              {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* 6. DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-4xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <AlertTriangle className="text-rose-500 mx-auto mb-4" size={32} />
            <h4 className="text-lg font-black text-center text-slate-900 dark:text-white uppercase italic">Critical Redaction</h4>
            <p className="text-[10px] text-slate-500 text-center mt-3 font-bold uppercase tracking-widest leading-relaxed">
              Deleting <span className="text-rose-500">{deleteConfirm.name}</span> will break mappings across all workspaces.
            </p>
            <div className="flex gap-2 mt-8">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl font-black text-[9px] uppercase text-slate-400 hover:bg-slate-100 transition-colors">Abort</button>
              <button onClick={executeDeleteGlobal} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[9px] uppercase hover:bg-rose-700 transition-all">Redact</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmcManagement;