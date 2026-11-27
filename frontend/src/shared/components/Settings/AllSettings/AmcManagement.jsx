import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash2, 
  Edit2, 
  Check, 
  Landmark, 
  Loader2, 
  AlertTriangle, 
  Search, 
  Save, 
  Settings2, 
  Plus, 
  Building2, 
  MapPin, 
  Globe 
} from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { toast } from 'sonner';
import PageHeader from '../../../components/Auth/PageHeader';

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
      } catch {
        toast.error("Failed to load fund house records");
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
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
    if (!newAmc.trim()) return toast.warning("Please provide a fund house name");
    const res = await request('/amcs', 'POST', { name: newAmc.trim(), isLocal: newAmcIsLocal });
    if (res?.data) {
      setAmcs(prev => [...prev, res.data]);
      setNewAmc('');
      setNewAmcIsLocal(false);
      toast.success("Fund house added to company catalog");
    }
  };

  const handleUpdateGlobal = async (id) => {
    if (!editValue.trim()) return;
    const res = await request(`/amcs/${id}`, 'PUT', { name: editValue.trim(), isLocal: editIsLocal });
    if (res?.data) {
      setAmcs(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("Fund house details updated");
    }
  };

  const handleToggleLocalInline = async (e, amcObj) => {
    e.stopPropagation(); 
    const nextLocalState = !amcObj.isLocal;
    const res = await request(`/amcs/${amcObj._id}`, 'PUT', { isLocal: nextLocalState });
    if (res?.data) {
      setAmcs(prev => prev.map(a => a._id === amcObj._id ? res.data : a));
      toast.success(`${amcObj.name} tax rate updated`);
    }
  };

  const executeDeleteGlobal = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/amcs/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setAmcs(prev => prev.filter(a => a._id !== deleteConfirm.id));
      setStagedAmcIds(prev => prev.filter(id => id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("Fund house removed from catalog");
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
        toast.success("Changes saved for this license");
      }
    } catch { 
      toast.error("Failed to save changes"); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const hasChanges = useMemo(() => {
    if (!selectedArn) return false;
    const current = selectedArn.allowedAmcs?.map(a => a._id || a) || [];
    return current.length !== stagedAmcIds.length || !current.every(id => stagedAmcIds.includes(id));
  }, [selectedArn, stagedAmcIds]);

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-sky-500" size={36} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100rem] mx-auto space-y-6 animate-in fade-in duration-300 min-w-0 pb-32">
      
      {/* Universal Page Header */}
      <PageHeader 
        title="Fund Houses"
        accent="& AMCs"
        description="Choose which mutual fund houses are available for each ARN license and configure tax categories."
      />

      {/* SEARCH & CATALOG DRAWER TOGGLE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search fund house by name..." 
            className="w-full bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-xs" 
          />
        </div>
        <button 
          type="button"
          onClick={() => setShowMaster(!showMaster)} 
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all border shadow-xs cursor-pointer active:scale-[0.99]
            ${showMaster 
              ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-500/30' 
              : 'bg-white dark:bg-[#161B26] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-[#1C2230]'
            }`}
        >
          <Settings2 size={15} />
          <span>{showMaster ? 'Close Catalog Editor' : 'Edit Fund Catalog'}</span>
        </button>
      </div>

      {/* MASTER CATALOG DRAWER */}
      {showMaster && (
        <div className="bg-slate-50 dark:bg-[#131720] border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/80 pb-3">
            <Building2 size={18} className="text-sky-600 dark:text-sky-400" />
            <h3 className="sora-font text-xs font-bold tracking-wide">
              Company-Wide Fund House Directory
            </h3>
          </div>
          
          {/* Add New AMC */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input 
              value={newAmc} 
              onChange={e => setNewAmc(e.target.value)} 
              placeholder="Enter new fund house name (e.g. HDFC, Nippon)..." 
              className="w-full bg-white dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold uppercase text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-xs" 
            />
            <button 
              type="button"
              onClick={handleAddGlobal} 
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus size={16} /> 
              <span>Add Fund House</span>
            </button>
          </div>

          {/* AMC Directory Table */}
          <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg overflow-hidden shadow-xs">
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {amcs.map(amc => (
                <div key={amc._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 hover:bg-slate-50 dark:hover:bg-[#1C2230]/50 transition-colors">
                  {editingId === amc._id ? (
                    <div className="flex flex-col sm:flex-row flex-1 items-start sm:items-center gap-3 w-full">
                      <input 
                        autoFocus 
                        value={editValue} 
                        onChange={e => setEditValue(e.target.value)} 
                        className="w-full sm:flex-1 bg-white dark:bg-[#1C2230] border border-sky-500 rounded-md px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-900 dark:text-white outline-none" 
                      />
                      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={editIsLocal} 
                          onChange={e => setEditIsLocal(e.target.checked)} 
                          className="accent-sky-600 w-3.5 h-3.5"
                        /> 
                        Same-State (CGST + SGST)
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide truncate">
                        {amc.name}
                      </span>
                      {amc.isLocal && (
                        <span className="px-1.5 py-0.5 bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 rounded-md text-[10px] font-semibold shrink-0 border border-sky-200 dark:border-sky-500/20">
                          Same-State
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {editingId === amc._id ? (
                      <button 
                        type="button"
                        onClick={() => handleUpdateGlobal(amc._id)} 
                        className="p-1.5 bg-sky-50 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 rounded-md hover:bg-sky-100 transition-colors"
                        title="Save name"
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => { setEditingId(amc._id); setEditValue(amc.name); setEditIsLocal(!!amc.isLocal); }} 
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors"
                        title="Edit name"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => setDeleteConfirm({ id: amc._id, name: amc.name })} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                      title="Delete from catalog"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ARN LICENSE SELECTOR STRIP */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Select ARN License to Map
        </span>
        <div className="flex flex-wrap gap-2">
          {arns.map(arn => (
            <button 
              key={arn._id} 
              type="button"
              onClick={() => handleArnSelect(arn)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all border cursor-pointer active:scale-[0.99]
                ${selectedArn?._id === arn._id 
                  ? 'bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 shadow-xs' 
                  : 'bg-white dark:bg-[#161B26] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
            >
              {arn.nickname || arn.arnCode}
            </button>
          ))}
        </div>
      </div>

      {/* AMC CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAmcs.map(amc => {
          const isLinked = stagedAmcIds.includes(amc._id);
          return (
            <div 
              key={amc._id} 
              onClick={() => toggleStagedAmc(amc._id)} 
              className={`group flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all shadow-xs
                ${isLinked 
                  ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-500/10' 
                  : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#161B26] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors
                  ${isLinked 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'bg-slate-100 dark:bg-[#1C2230] text-slate-400'
                  }`}
                >
                  <Landmark size={16} />
                </div>
                
                <div className="min-w-0 flex-1 pr-2">
                  <span className={`block text-xs font-semibold uppercase tracking-wide truncate mb-1 transition-colors 
                    ${isLinked ? 'text-sky-950 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'}`}
                  >
                    {amc.name}
                  </span>
                  
                  <button 
                    type="button"
                    onClick={(e) => handleToggleLocalInline(e, amc)} 
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors border
                      ${amc.isLocal 
                        ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30' 
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                      }`}
                  >
                    {amc.isLocal ? <MapPin size={10} /> : <Globe size={10} />}
                    <span>{amc.isLocal ? 'In-State (CGST + SGST)' : 'Out-of-State (IGST)'}</span>
                  </button>
                </div>
              </div>
              
              {/* Checkbox Icon */}
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors
                ${isLinked 
                  ? 'bg-sky-600 border-sky-600 text-white' 
                  : 'bg-transparent border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                }`}
              >
                {isLinked && <Check size={12} strokeWidth={3.5} />}
              </div>
            </div>
          );
        })}
        
        {filteredAmcs.length === 0 && (
          <div className="col-span-full p-10 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
            No fund houses found matching "{search}".
          </div>
        )}
      </div>

      {/* UNSAVED CHANGES FLOATING BAR */}
      {hasChanges && (
        <div className="fixed bottom-6 right-4 left-4 md:right-8 md:left-auto z-50 bg-slate-900 dark:bg-[#161B26] text-white border border-slate-800 dark:border-slate-700/80 p-4 rounded-lg flex items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold">Unsaved Changes</span>
            <span className="text-[11px] opacity-75">You have modified fund house assignments.</span>
          </div>
          <button 
            type="button"
            onClick={saveChanges} 
            disabled={isSaving} 
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save License Changes</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 p-6 rounded-lg w-full max-w-sm shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-md flex items-center justify-center shrink-0 border border-rose-200 dark:border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="sora-font text-base font-bold text-slate-900 dark:text-white">Delete Fund House</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Remove from entire system</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirm.name}</strong>? This will detach it from all associated ARN licenses.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button 
                type="button"
                onClick={() => setDeleteConfirm(null)} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2230] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={executeDeleteGlobal} 
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
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

export default AmcManagement;