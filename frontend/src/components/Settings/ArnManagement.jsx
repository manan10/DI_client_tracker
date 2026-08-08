import React, { useState, useEffect } from 'react';
import { Trash2, Shield, Loader2, Edit2, Check, X, AlertTriangle, Building2, Plus, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates';
import { toast } from 'sonner';

const ArnManagement = () => {
  const { request } = useApi();
  const [arns, setArns] = useState([]);
  const [tallyFirms, setTallyFirms] = useState([]);
  const [formData, setFormData] = useState({ arnCode: '', nickname: '', gstCompliant: false });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ arnCode: '', nickname: '', gstCompliant: false });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [arnRes, tallyRes] = await Promise.all([
          request('/arns'),
          request('/tally/proxy', 'POST', { xml: tallyTemplates.getCompanies() }).catch(() => null)
        ]);
        if (isMounted) {
          if (arnRes?.data) setArns(arnRes.data);
          if (tallyRes) {
            const matches = [...tallyRes.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            setTallyFirms([...new Set(matches)].filter(n => !n.includes('migrated-to')));
          }
        }
      } catch { toast.error("Bridge Connection Failed"); } 
      finally { if (isMounted) setIsInitialLoading(false); }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [request]);

  const handleAdd = async () => {
    if (!formData.arnCode || !formData.nickname) return toast.warning("Missing Fields");
    const res = await request('/arns', 'POST', formData);
    if (res?.data) {
      setArns(prev => [...prev, res.data]);
      setFormData({ arnCode: '', nickname: '', gstCompliant: false });
      toast.success("ARN Registered Successfully");
    }
  };

  const handleUpdate = async (id) => {
    const res = await request(`/arns/${id}`, 'PUT', editData);
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("ARN Updated Successfully");
    }
  };

  const handleToggleGstInline = async (arnObj) => {
    const res = await request(`/arns/${arnObj._id}`, 'PUT', { ...arnObj, gstCompliant: !arnObj.gstCompliant });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnObj._id ? res.data : a));
    }
  };

  const handleTallyLink = async (arnId, firmName) => {
    if (!firmName) return;
    const res = await request(`/arns/${arnId}/tally-link`, 'PATCH', { tallyName: firmName });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnId ? res.data : a));
    }
  };

  const handleRemoveTallyLink = async (arnId, firmName) => {
    const arn = arns.find(a => a._id === arnId);
    const updatedFirms = arn.linkedTallyFirms.filter(f => f !== firmName);
    const res = await request(`/arns/${arnId}`, 'PUT', { linkedTallyFirms: updatedFirms });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnId ? res.data : a));
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/arns/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setArns(prev => prev.filter(a => a._id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("ARN Deleted");
    }
  };

  if (isInitialLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  return (
    <div className="w-full pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">ARN Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage ARN codes and Tally ERP links.</p>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-md p-3 flex flex-col lg:flex-row items-center gap-3">
        <div className="flex-1 w-full flex flex-col lg:flex-row items-center gap-3">
          <input 
            placeholder="Enter ARN Code (e.g. ARN-12345)" 
            value={formData.arnCode} 
            onChange={e => setFormData({...formData, arnCode: e.target.value})} 
            className="w-full lg:w-1/3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" 
          />
          <input 
            placeholder="Enter Nickname / Entity Name" 
            value={formData.nickname} 
            onChange={e => setFormData({...formData, nickname: e.target.value})} 
            className="w-full lg:flex-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm" 
          />
        </div>
        <button 
          onClick={handleAdd} 
          className="w-full lg:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 py-2.5 px-5 shadow-sm"
        >
          <Plus size={16} /> Add ARN
        </button>
      </div>

      {/* MOBILE VIEW: Stacked Cards (Zero Horizontal Scroll) */}
      <div className="lg:hidden flex flex-col gap-4">
        {arns.map((arn) => (
          <div key={arn._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md p-4 shadow-sm flex flex-col gap-4">
            
            {editingId === arn._id ? (
               <div className="flex flex-col gap-3">
                  <input 
                    value={editData.arnCode} 
                    onChange={e => setEditData({...editData, arnCode: e.target.value})} 
                    placeholder="ARN Code"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500/50 rounded-md px-3 py-2 text-sm font-bold uppercase text-slate-900 dark:text-white outline-none" 
                  />
                  <input 
                    value={editData.nickname} 
                    onChange={e => setEditData({...editData, nickname: e.target.value})} 
                    placeholder="Nickname"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500/50 rounded-md px-3 py-2 text-sm font-bold uppercase text-slate-900 dark:text-white outline-none" 
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => handleUpdate(arn._id)} className="flex-1 py-2 bg-emerald-600 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"><Check size={14} /> Save</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"><X size={14} /> Cancel</button>
                  </div>
               </div>
            ) : (
               <>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${arn.gstCompliant ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                      <Shield size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{arn.arnCode}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{arn.nickname}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => {setEditingId(arn._id); setEditData({arnCode: arn.arnCode, nickname: arn.nickname, gstCompliant: arn.gstCompliant})}} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-md text-slate-500 active:scale-95 transition-transform"><Edit2 size={16} /></button>
                    <button onClick={() => setDeleteConfirm({id: arn._id, code: arn.arnCode})} className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-md text-rose-500 active:scale-95 transition-transform"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-3">
                  <button 
                    onClick={() => handleToggleGstInline(arn)} 
                    className={`self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border
                      ${arn.gstCompliant 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                        : 'bg-slate-50 dark:bg-[#0B1120] text-slate-500 border-slate-200 dark:border-white/10'
                      }`}
                  >
                    {arn.gstCompliant ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                    {arn.gstCompliant ? 'GST Active' : 'No GST'}
                  </button>

                  <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 mb-1"><Building2 size={12}/> Tally Links</span>
                    <div className="flex flex-wrap gap-2">
                      {arn.linkedTallyFirms?.map(firm => (
                        <div key={firm} className="flex items-center gap-1.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 pl-2 pr-1 py-1 rounded-sm shadow-sm">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-50">{firm}</span>
                          <button onClick={() => handleRemoveTallyLink(arn._id, firm)} className="p-1 text-slate-400 hover:text-rose-500"><X size={12} strokeWidth={2.5} /></button>
                        </div>
                      ))}
                      <select 
                        onChange={(e) => { handleTallyLink(arn._id, e.target.value); e.target.value = ""; }} 
                        defaultValue=""
                        className="appearance-none bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 rounded-sm outline-none w-full mt-1"
                      >
                        <option value="" disabled>+ Connect Firm</option>
                        {tallyFirms.filter(f => !arn.linkedTallyFirms?.includes(f)).map(firm => (
                          <option key={firm} value={firm} className="text-slate-900 dark:text-slate-900">{firm}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
               </>
            )}
          </div>
        ))}
        {arns.length === 0 && (
           <div className="p-8 text-center text-slate-500 bg-white dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-white/5">
              <Shield size={28} className="mx-auto mb-2 opacity-30" />
              <div className="text-sm font-bold">No ARNs Found</div>
           </div>
        )}
      </div>

      {/* DESKTOP VIEW: Data Table */}
      <div className="hidden lg:block bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5">
                <th className="px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-1/4">ARN Details</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-1/6">GST Status</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-5/12">Linked Tally Firms</th>
                <th className="px-5 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-1/12 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {arns.map((arn) => (
                <tr key={arn._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  {editingId === arn._id ? (
                    <td colSpan="4" className="p-0">
                      <div className="flex items-center gap-4 px-5 py-2.5 bg-emerald-50/50 dark:bg-emerald-900/10 border-l-4 border-emerald-500">
                        <input value={editData.arnCode} onChange={e => setEditData({...editData, arnCode: e.target.value})} className="w-1/4 bg-white dark:bg-[#0B1120] border border-emerald-200 dark:border-emerald-500/30 rounded-md px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none" />
                        <input value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} className="flex-1 bg-white dark:bg-[#0B1120] border border-emerald-200 dark:border-emerald-500/30 rounded-md px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white outline-none" />
                        <div className="flex items-center gap-2 ml-auto shrink-0">
                          <button onClick={() => handleUpdate(arn._id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"><Check size={14} /> Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-md"><X size={14} /></button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{arn.arnCode}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{arn.nickname}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                         <button onClick={() => handleToggleGstInline(arn)} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors border ${arn.gstCompliant ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-white dark:bg-[#0B1120] text-slate-500 border-slate-200 dark:border-white/10'}`}>
                          {arn.gstCompliant ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                          {arn.gstCompliant ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {arn.linkedTallyFirms?.map(firm => (
                            <div key={firm} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 pl-2 pr-1 py-1 rounded-sm">
                              <Building2 size={12} className="text-indigo-400" />
                              <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 truncate max-w-45">{firm}</span>
                              <button onClick={() => handleRemoveTallyLink(arn._id, firm)} className="p-0.5 text-indigo-400 hover:text-rose-500 rounded ml-1"><X size={12} strokeWidth={2.5} /></button>
                            </div>
                          ))}
                          <div className="relative flex items-center group">
                            <select onChange={(e) => { handleTallyLink(arn._id, e.target.value); e.target.value = ""; }} defaultValue="" className="appearance-none bg-transparent pl-2 pr-5 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 outline-none cursor-pointer border border-dashed border-transparent hover:border-slate-300 rounded-sm">
                              <option value="" disabled>+ Add Firm</option>
                              {tallyFirms.filter(f => !arn.linkedTallyFirms?.includes(f)).map(firm => <option key={firm} value={firm} className="text-slate-900">{firm}</option>)}
                            </select>
                            <ArrowRight size={12} className="absolute right-1 text-slate-300 pointer-events-none" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => {setEditingId(arn._id); setEditData({arnCode: arn.arnCode, nickname: arn.nickname, gstCompliant: arn.gstCompliant})}} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => setDeleteConfirm({id: arn._id, code: arn.arnCode})} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Structured Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="text-rose-600 dark:text-rose-500" size={20} /></div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete ARN?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to completely delete <span className="font-bold text-slate-900 dark:text-white">{deleteConfirm.code}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 flex-col sm:flex-row">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-sm font-semibold w-full sm:w-auto">Cancel</button>
              <button onClick={executeDelete} className="px-4 py-2.5 sm:py-2 bg-rose-600 text-white rounded-md text-sm font-semibold shadow-sm w-full sm:w-auto">Delete ARN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArnManagement;