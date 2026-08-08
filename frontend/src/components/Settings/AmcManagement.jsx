import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Edit2, Check, Landmark, Loader2, AlertTriangle, Search, Save, X, Settings2, Plus, Building2, MapPin, Globe } from 'lucide-react';
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
      toast.success("Registered to Master Directory");
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
      toast.success(`${amcObj.name} taxation updated`);
    }
  };

  const executeDeleteGlobal = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/amcs/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setAmcs(prev => prev.filter(a => a._id !== deleteConfirm.id));
      setStagedAmcIds(prev => prev.filter(id => id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("Removed from Global Registry");
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
        toast.success("Workspace Synced Successfully");
      }
    } catch { toast.error("Sync Failed"); } finally { setIsSaving(false); }
  };

  const hasChanges = useMemo(() => {
    if (!selectedArn) return false;
    const current = selectedArn.allowedAmcs?.map(a => a._id || a) || [];
    return current.length !== stagedAmcIds.length || !current.every(id => stagedAmcIds.includes(id));
  }, [selectedArn, stagedAmcIds]);

  if (isInitialLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="w-full pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">AMC Registry</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure global AMCs and ARN mappings.</p>
      </div>

      {/* MASTER REGISTRY TOGGLE & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search AMCs..." 
              className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" 
            />
        </div>
        <button 
          onClick={() => setShowMaster(!showMaster)} 
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold uppercase tracking-wider transition-colors border shadow-sm w-full md:w-auto
            ${showMaster 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' 
              : 'bg-white dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
        >
          <Settings2 size={16} />
          {showMaster ? 'Hide Master' : 'Manage Master'}
        </button>
      </div>

      {/* GLOBAL REGISTRY (MASTER CONFIGURATION) */}
      {showMaster && (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-lg p-4 md:p-5 space-y-4 md:space-y-5 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-white/10 pb-3">
             <Building2 size={18} className="text-emerald-600" />
             <h3 className="text-sm font-black uppercase tracking-wider">Global AMC Database</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
              <input 
                value={newAmc} 
                onChange={e => setNewAmc(e.target.value)} 
                placeholder="Enter new AMC name..." 
                className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2 text-sm font-bold uppercase text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm" 
              />
              <button 
                onClick={handleAddGlobal} 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 sm:py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add to Global
              </button>
          </div>

          <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md overflow-hidden shadow-sm">
            <div className="max-h-64 overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-white/5">
                {amcs.map(amc => (
                    <div key={amc._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {editingId === amc._id ? (
                            <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-3 w-full">
                                <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full sm:flex-1 bg-white dark:bg-slate-900 border border-emerald-500 rounded px-2 py-1.5 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none" />
                                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 cursor-pointer shrink-0">
                                    <input type="checkbox" checked={editIsLocal} onChange={e => setEditIsLocal(e.target.checked)} className="accent-emerald-600 w-3.5 h-3.5"/> Is Local (CGST/SGST)
                                </label>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                               <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide truncate block">{amc.name}</span>
                               {amc.isLocal && <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">Local</span>}
                            </div>
                        )}
                        <div className="flex gap-1 shrink-0 self-end sm:self-auto">
                            {editingId === amc._id ? (
                                <button onClick={() => handleUpdateGlobal(amc._id)} className="p-2 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded hover:bg-emerald-100 transition-colors"><Check size={14} /></button>
                            ) : (
                                <button onClick={() => {setEditingId(amc._id); setEditValue(amc.name); setEditIsLocal(!!amc.isLocal)}} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded transition-colors"><Edit2 size={14} /></button>
                            )}
                            <button onClick={() => setDeleteConfirm({id: amc._id, name: amc.name})} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded transition-colors"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ARN TABS (Flex-wrap instead of overflow-x for safe mobile stacking) */}
      <div className="flex flex-wrap gap-2 pb-2">
          {arns.map(arn => (
              <button 
                  key={arn._id} 
                  onClick={() => handleArnSelect(arn)}
                  className={`px-4 md:px-5 py-2 md:py-2.5 rounded-md text-[11px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border
                    ${selectedArn?._id === arn._id 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md' 
                      : 'bg-white dark:bg-[#0B1120] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-400'
                    }`}
              >
                  {arn.nickname}
              </button>
          ))}
      </div>

      {/* MAPPING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredAmcs.map(amc => {
              const isLinked = stagedAmcIds.includes(amc._id);
              return (
                  <div 
                    key={amc._id} 
                    onClick={() => toggleStagedAmc(amc._id)} 
                    className={`group flex items-center justify-between p-4 border rounded-md cursor-pointer transition-all shadow-sm
                      ${isLinked 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/5' 
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B1120] hover:border-slate-300'
                      }`}
                  >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors
                            ${isLinked ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                          >
                              <Landmark size={14} />
                          </div>
                          
                          {/* CRITICAL: min-w-0 allows the inner flex-col to truncate its children */}
                          <div className="min-w-0 flex-1">
                              <span className={`block text-xs font-black uppercase tracking-wide truncate mb-1 transition-colors ${isLinked ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                {amc.name}
                              </span>
                              
                              <button 
                                onClick={(e) => handleToggleLocalInline(e, amc)} 
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-colors
                                  ${amc.isLocal ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'}`}
                              >
                                  {amc.isLocal ? <MapPin size={10} /> : <Globe size={10} />}
                                  {amc.isLocal ? 'Intrastate (CGST)' : 'Interstate (IGST)'}
                              </button>
                          </div>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 ml-3 transition-colors
                        ${isLinked ? 'bg-emerald-600 border-emerald-600' : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-slate-400'}`}
                      >
                         {isLinked && <Check size={12} className="text-white" strokeWidth={4} />}
                      </div>
                  </div>
              )
          })}
          
          {filteredAmcs.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
               No AMCs match your search query.
            </div>
          )}
      </div>

      {/* COMMIT BAR */}
      {hasChanges && (
          <div className="fixed bottom-6 right-4 left-4 md:right-10 md:left-auto z-50 bg-slate-900/95 dark:bg-white/95 backdrop-blur-md border border-slate-800 dark:border-white p-4 rounded-xl flex items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-bottom-8">
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-black uppercase tracking-widest text-slate-100 dark:text-slate-900">Unsaved Mappings</span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600">Modifications detected.</span>
              </div>
              <button 
                onClick={saveChanges} 
                disabled={isSaving} 
                className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 py-3 md:py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                  {isSaving ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16} /> Commit</>}
              </button>
          </div>
      )}
      
      {/* STRUCTURED DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center shrink-0">
                 <AlertTriangle className="text-rose-600 dark:text-rose-500" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete AMC?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to completely delete <span className="font-bold text-slate-900 dark:text-white">{deleteConfirm.name}</span>?</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-sm font-semibold">Cancel</button>
              <button onClick={executeDeleteGlobal} className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-rose-600 text-white rounded-md text-sm font-semibold shadow-sm">Delete AMC</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmcManagement;