import React, { useState, useEffect } from 'react';
import { Trash2, Shield, Loader2, UserCheck, Edit2, Check, X, AlertTriangle, Building2, Unlink } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { tallyTemplates } from '../../utils/tallyTemplates';
import { toast } from 'sonner';

const ArnManagement = () => {
  const { request } = useApi();
  const [arns, setArns] = useState([]);
  const [tallyFirms, setTallyFirms] = useState([]);
  
  // Explicitly added gstCompliant boolean to the form state
  const [formData, setFormData] = useState({ arnCode: '', nickname: '', gstCompliant: false });
  const [editingId, setEditingId] = useState(null);
  
  // Explicitly added gstCompliant boolean to the editing buffer state
  const [editData, setEditData] = useState({ arnCode: '', nickname: '', gstCompliant: false });
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch ARNs and Tally Companies
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [arnRes, tallyRes] = await Promise.all([
          request('/arns'),
          request('/tally/proxy', 'POST', { xml: tallyTemplates.getCompanies() })
        ]);

        if (isMounted) {
          if (arnRes?.data) setArns(arnRes.data);
          
          if (tallyRes) {
            const matches = [...tallyRes.matchAll(/<NAME[^>]*>(.*?)<\/NAME>/g)].map(m => m[1]);
            const filtered = [...new Set(matches)].filter(n => !n.includes('migrated-to'));
            setTallyFirms(filtered);
          }
        }
      } catch {
        toast.error("Bridge Connection Failed");
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
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

  // Inline toggle shortcut to flip GST compliance state directly from the list view badge
  const handleToggleGstInline = async (arnObj) => {
    const nextGstState = !arnObj.gstCompliant;
    const res = await request(`/arns/${arnObj._id}`, 'PUT', { gstCompliant: nextGstState });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnObj._id ? res.data : a));
      toast.success(`GST status ${nextGstState ? 'enabled' : 'disabled'} successfully`);
    }
  };

  const handleTallyLink = async (arnId, firmName) => {
    if (!firmName) return;
    const res = await request(`/arns/${arnId}/tally-link`, 'PATCH', { tallyName: firmName });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnId ? res.data : a));
      toast.success(`${firmName} linked successfully`);
    }
  };

  const handleRemoveTallyLink = async (arnId, firmName) => {
    const arn = arns.find(a => a._id === arnId);
    const updatedFirms = arn.linkedTallyFirms.filter(f => f !== firmName);
    const res = await request(`/arns/${arnId}`, 'PUT', { linkedTallyFirms: updatedFirms });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnId ? res.data : a));
      toast.info("Link Removed");
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

  if (isInitialLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-20">
      {/* 1. DELETE OVERLAY */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-lg p-8 border border-slate-200 dark:border-slate-800 shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg flex items-center justify-center mx-auto mb-6 text-2xl font-black italic">!</div>
            <h4 className="text-xl font-black text-center text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Confirm Removal</h4>
            <p className="text-[10px] font-black text-slate-400 text-center mt-4 uppercase tracking-widest leading-relaxed px-4">
              Revoking license <span className="text-slate-900 dark:text-white">{deleteConfirm.code}</span> will disconnect all linked Tally audit sessions.
            </p>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all italic">Revoke</button>
            </div>
          </div>
        </div>
      )}

      <header>
        <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">License Registry</h3>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-3">Bridge Context Management</p>
      </header>

      {/* 2. ADD FORM */}
      <div className="flex flex-col lg:flex-row gap-3 bg-slate-50/50 dark:bg-white/2 p-3 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm lg:items-center">
        <input 
          placeholder="ARN CODE"
          value={formData.arnCode}
          onChange={e => setFormData({...formData, arnCode: e.target.value})}
          className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-6 py-4 text-xs font-[1000] outline-none dark:text-white border border-transparent focus:border-emerald-500/40 uppercase italic tracking-widest placeholder:text-slate-300"
        />
        <input 
          placeholder="NICKNAME"
          value={formData.nickname}
          onChange={e => setFormData({...formData, nickname: e.target.value})}
          className="flex-1 bg-white dark:bg-slate-900 rounded-xl px-6 py-4 text-xs font-[1000] outline-none dark:text-white border border-transparent focus:border-emerald-500/40 uppercase italic tracking-widest placeholder:text-slate-300"
        />
        
        {/* Checkbox input field inside creation context layout row */}
        <label className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3.5 rounded-xl border border-slate-200/50 dark:border-white/5 cursor-pointer shrink-0 select-none font-black text-[10px] uppercase tracking-wider text-slate-500">
          <input 
            type="checkbox"
            checked={formData.gstCompliant}
            onChange={e => setFormData({...formData, gstCompliant: e.target.checked})}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-0 outline-none border-slate-200 dark:border-white/10 dark:bg-slate-900 cursor-pointer"
          />
          GST Registered
        </label>

        <button onClick={handleAdd} className="lg:px-10 py-4 bg-slate-950 text-white dark:bg-emerald-500 dark:text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 italic shrink-0">
          <UserCheck size={16} /> Register Client
        </button>
      </div>

      {/* 3. ARN LIST */}
      <div className="grid grid-cols-1 gap-6">
        {arns.map((arn) => (
          <div key={arn._id} className="group bg-white dark:bg-[#0B0C10] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col lg:flex-row lg:items-center gap-10 hover:border-emerald-500/30 transition-all duration-500">
            
            {/* IDENTITY SLAB */}
            <div className="flex items-center gap-8 lg:w-1/4 shrink-0">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${editingId === arn._id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/5 text-emerald-600'}`}>
                <Shield size={32} strokeWidth={1.5} />
              </div>
              
              <div className="flex-1 min-w-0">
                {editingId === arn._id ? (
                  <div className="space-y-2">
                    <input value={editData.arnCode} onChange={e => setEditData({...editData, arnCode: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500 rounded-lg px-3 py-1 text-xs font-black uppercase italic dark:text-white" />
                    <input value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500 rounded-lg px-3 py-1 text-[10px] font-black uppercase dark:text-white" />
                    
                    {/* Checkbox selector inside editing row panel element */}
                    <label className="flex items-center gap-2 pt-1 font-black text-[9px] uppercase tracking-wide text-slate-400 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={editData.gstCompliant}
                        onChange={e => setEditData({...editData, gstCompliant: e.target.checked})}
                        className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-200 dark:border-white/5 focus:ring-0 cursor-pointer"
                      />
                      GST Registered
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none truncate">{arn.arnCode}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-md uppercase tracking-widest">{arn.nickname}</span>
                      
                      {/* Pill Badge toggle component illustrating active GST mapping properties */}
                      <span 
                        onClick={() => handleToggleGstInline(arn)}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider cursor-pointer border select-none transition-colors ${
                          arn.gstCompliant 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/5'
                        }`}
                      >
                        {arn.gstCompliant ? '✓ GST COMPLIANT' : '✕ NO GST'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TALLY LINKS */}
            <div className="flex-1 flex flex-col gap-4 border-l border-slate-100 dark:border-white/5 lg:pl-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Linked Tally Companies</span>
                </div>
                
                <select 
                  className="bg-transparent text-[10px] font-black uppercase text-emerald-500 outline-none cursor-pointer tracking-widest italic"
                  onChange={(e) => handleTallyLink(arn._id, e.target.value)}
                  value=""
                >
                  <option value="" disabled>+ Link New Company</option>
                  {tallyFirms.filter(f => !arn.linkedTallyFirms?.includes(f)).map(firm => (
                    <option key={firm} value={firm}>{firm}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {arn.linkedTallyFirms?.length > 0 ? (
                  arn.linkedTallyFirms.map(firm => (
                    <div key={firm} className="flex items-center gap-3 pl-4 pr-2 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 group/tag">
                      <span className="text-[10px] font-[1000] text-slate-700 dark:text-slate-300 uppercase italic tracking-tight">{firm}</span>
                      <button 
                        onClick={() => handleRemoveTallyLink(arn._id, firm)}
                        className="w-5 h-5 rounded-md hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all text-slate-300"
                      >
                        <Unlink size={10} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-slate-300 uppercase italic">No Tally Link Established</p>
                )}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 lg:ml-auto">
              {editingId === arn._id ? (
                <button onClick={() => handleUpdate(arn._id)} className="w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"><Check size={20} strokeWidth={3}/></button>
              ) : (
                <button onClick={() => {setEditingId(arn._id); setEditData({arnCode: arn.arnCode, nickname: arn.nickname, gstCompliant: !!arn.gstCompliant})}} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-2xl transition-all"><Edit2 size={18}/></button>
              )}
              <button onClick={() => setDeleteConfirm({id: arn._id, code: arn.arnCode})} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all"><Trash2 size={18}/></button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ArnManagement;