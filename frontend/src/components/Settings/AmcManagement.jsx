import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, Edit2, Check, Landmark, Loader2, 
  AlertTriangle, Search, Save, X, Settings2 
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
  const [newAmcIsLocal, setNewAmcIsLocal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editIsLocal, setEditIsLocal] = useState(false);
  
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

  const handleAddGlobal = async () => {
    if (!newAmc.trim()) return toast.warning("Name Required");
    const res = await request('/amcs', 'POST', { name: newAmc.trim(), isLocal: newAmcIsLocal });
    if (res?.data) {
      setAmcs(prev => [...prev, res.data]);
      setNewAmc('');
      setNewAmcIsLocal(false);
      toast.success("Registered to Master");
    }
  };

  const handleUpdateGlobal = async (id) => {
    if (!editValue.trim()) return;
    const res = await request(`/amcs/${id}`, 'PUT', { name: editValue.trim(), isLocal: editIsLocal });
    if (res?.data) {
      setAmcs(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("Registry Updated");
    }
  };

  const handleToggleLocalInline = async (e, amcObj) => {
    e.stopPropagation(); 
    const nextLocalState = !amcObj.isLocal;
    const res = await request(`/amcs/${amcObj._id}`, 'PUT', { isLocal: nextLocalState });
    if (res?.data) {
      setAmcs(prev => prev.map(a => a._id === amcObj._id ? res.data : a));
      toast.success(`${amcObj.name} updated`);
    }
  };

  const executeDeleteGlobal = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/amcs/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setAmcs(prev => prev.filter(a => a._id !== deleteConfirm.id));
      setStagedAmcIds(prev => prev.filter(id => id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("Removed from Registry");
    }
  };

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
        const updatedArns = arns.map(arn => arn._id === selectedArn._id ? { ...arn, allowedAmcs: res.data.allowedAmcs } : arn);
        setArns(updatedArns);
        setSelectedArn({ ...selectedArn, allowedAmcs: res.data.allowedAmcs });
        toast.success("Workspace Synced");
      }
    } catch { toast.error("Sync Failed"); } finally { setIsSaving(false); }
  };

  const hasChanges = useMemo(() => {
    if (!selectedArn) return false;
    const current = selectedArn.allowedAmcs?.map(a => a._id || a) || [];
    return current.length !== stagedAmcIds.length || !current.every(id => stagedAmcIds.includes(id));
  }, [selectedArn, stagedAmcIds]);

  if (isInitialLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-white pb-64 px-4 md:px-8">
      
      {/* HEADER */}
      <div className="py-8 flex items-center justify-between border-b border-slate-100">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-slate-900 border-l-4 border-emerald-600 pl-4">AMC Directory</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 pl-5">Infrastructure Configuration</p>
          </div>
          <button onClick={() => setShowMaster(!showMaster)} className="text-slate-500 hover:text-emerald-600">
            <Settings2 size={18} />
          </button>
      </div>

      <main className="max-w-7xl mx-auto mt-10">
        
        {/* MASTER REGISTRY */}
        {showMaster && (
            <div className="mb-12 border-b border-slate-100 pb-12 space-y-6">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Registry</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input value={newAmc} onChange={e => setNewAmc(e.target.value)} placeholder="NEW AMC NAME" className="flex-1 border-b border-slate-300 py-2 text-[10px] font-black uppercase outline-none focus:border-emerald-600" />
                    <button onClick={handleAddGlobal} className="bg-emerald-600 text-white px-8 py-2 rounded text-[10px] font-black uppercase">Add</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold">
                    {amcs.map(amc => (
                        <div key={amc._id} className="flex items-center justify-between py-2 border-b border-slate-50">
                            {editingId === amc._id ? (
                                <div className="flex flex-col gap-1 w-full mr-2">
                                    <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full bg-slate-50 text-[10px] uppercase font-black" />
                                    <label className="flex items-center gap-1 text-[8px] uppercase font-black text-slate-400">
                                        <input type="checkbox" checked={editIsLocal} onChange={e => setEditIsLocal(e.target.checked)} /> Local
                                    </label>
                                </div>
                            ) : <span className="text-[10px] font-bold uppercase truncate">{amc.name}</span>}
                            <div className="flex gap-2 shrink-0">
                                {editingId === amc._id ? <button onClick={() => handleUpdateGlobal(amc._id)}><Check size={12} className="text-emerald-600"/></button> : <button onClick={() => {setEditingId(amc._id); setEditValue(amc.name); setEditIsLocal(!!amc.isLocal)}}><Edit2 size={12} className="text-slate-400"/></button>}
                                <button onClick={() => setDeleteConfirm({id: amc._id, name: amc.name})}><Trash2 size={12} className="text-rose-500"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* WORKSPACE SELECTION (2-COLUMN GRID) */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
            {arns.map(arn => (
                <button 
                    key={arn._id} 
                    onClick={() => handleArnSelect(arn)}
                    className={`px-4 py-3 rounded font-bold text-[9px] uppercase border transition-all ${selectedArn?._id === arn._id ? 'border-emerald-600 text-emerald-600' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
                >
                    {arn.nickname}
                </button>
            ))}
        </div>

        {/* SEARCH */}
        <div className="relative mb-8">
            <Search className="absolute left-0 top-3 text-slate-300" size={16}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="FILTER AMC LIST..." className="w-full pl-8 py-3 border-b border-slate-200 text-[10px] font-black uppercase outline-none focus:border-emerald-600" />
        </div>

        {/* MAPPING LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAmcs.map(amc => {
                const isLinked = stagedAmcIds.includes(amc._id);
                return (
                    <div key={amc._id} onClick={() => toggleStagedAmc(amc._id)} className={`flex items-center justify-between p-4 border rounded ${isLinked ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded flex items-center justify-center ${isLinked ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <Landmark size={12} />
                            </div>
                            <div>
                                <span className={`block text-[10px] font-black uppercase ${isLinked ? 'text-emerald-800' : 'text-slate-900'}`}>{amc.name}</span>
                                <span onClick={(e) => handleToggleLocalInline(e, amc)} className="text-[8px] font-black uppercase text-slate-400 hover:text-emerald-600 cursor-pointer">
                                    {amc.isLocal ? '📍 Intrastate' : '🌐 Interstate'}
                                </span>
                            </div>
                        </div>
                        <div className={`w-4 h-4 rounded border-2 ${isLinked ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`} />
                    </div>
                )
            })}
        </div>
      </main>

      {/* COMMIT BAR */}
      {hasChanges && (
          <div className="fixed bottom-12 right-6 left-6 md:right-12 md:left-auto md:w-auto z-50 bg-white border border-slate-200 shadow-2xl p-4 rounded-lg flex items-center justify-between gap-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 hidden md:block">Unsaved</span>
              <button onClick={saveChanges} disabled={isSaving} className="bg-emerald-600 text-white px-8 py-3 rounded text-[9px] font-black uppercase hover:bg-emerald-700 transition-all">
                  {isSaving ? <Loader2 className="animate-spin" size={14}/> : "Commit Changes"}
              </button>
          </div>
      )}
      
      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/90 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-xs w-full text-center shadow-2xl">
                <AlertTriangle className="mx-auto mb-4 text-rose-500" size={24}/>
                <p className="text-[10px] font-black uppercase mb-6">Confirm deletion of {deleteConfirm.name}?</p>
                <div className="flex gap-2">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 rounded-lg text-[9px] font-black uppercase">Abort</button>
                    <button onClick={executeDeleteGlobal} className="flex-1 py-3 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AmcManagement;