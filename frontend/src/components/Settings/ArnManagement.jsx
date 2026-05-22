import React, { useState, useEffect } from 'react';
import { Trash2, Shield, Loader2, Edit2, Check, X, AlertTriangle, Building2, Save } from 'lucide-react';
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
      toast.success("ARN Removed");
    }
  };

  if (isInitialLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4 pb-64 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-xl font-bold uppercase tracking-tight">License Registry</h1>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage Distributor Identities & Tally Links</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl border border-slate-200">
        <input placeholder="ARN CODE" value={formData.arnCode} onChange={e => setFormData({...formData, arnCode: e.target.value})} className="md:col-span-4 border border-slate-200 rounded-lg px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-emerald-500" />
        <input placeholder="NICKNAME" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} className="md:col-span-4 border border-slate-200 rounded-lg px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-emerald-500" />
        <button onClick={handleAdd} className="md:col-span-4 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all">Register Client</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {arns.map((arn) => (
          <div key={arn._id} className={`bg-white border rounded-xl p-5 flex flex-col gap-4 transition-all ${editingId === arn._id ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'}`}>
            
            {editingId === arn._id ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">ARN Code</label>
                  <input value={editData.arnCode} onChange={e => setEditData({...editData, arnCode: e.target.value})} className="w-full text-[10px] font-bold border-b border-emerald-500 py-1 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase">Nickname</label>
                  <input value={editData.nickname} onChange={e => setEditData({...editData, nickname: e.target.value})} className="w-full text-[10px] font-bold border-b border-emerald-500 py-1 outline-none" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => handleUpdate(arn._id)} className="flex-1 py-2 bg-emerald-600 text-white rounded text-[9px] font-bold uppercase flex items-center justify-center gap-2"><Check size={12} /> Save</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 py-2 bg-slate-100 rounded text-[9px] font-bold uppercase"><X size={12} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className={arn.gstCompliant ? "text-emerald-600" : "text-slate-300"} />
                    <div>
                      <h4 className="text-[11px] font-bold uppercase">{arn.arnCode}</h4>
                      <p className="text-[9px] text-slate-500 uppercase font-bold">{arn.nickname}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => {setEditingId(arn._id); setEditData({arnCode: arn.arnCode, nickname: arn.nickname, gstCompliant: arn.gstCompliant})}} className="p-2 text-slate-400 hover:text-slate-900"><Edit2 size={16} /></button>
                    <button onClick={() => setDeleteConfirm({id: arn._id, code: arn.arnCode})} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-2 items-center">
                  <button onClick={() => handleToggleGstInline(arn)} className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${arn.gstCompliant ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {arn.gstCompliant ? 'GST Enabled' : 'GST Disabled'}
                  </button>
                  <Building2 size={12} className="text-slate-400 ml-2" />
                  {arn.linkedTallyFirms?.map(firm => (
                    <span key={firm} className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded text-[9px] font-bold uppercase">
                      {firm} <button onClick={() => handleRemoveTallyLink(arn._id, firm)}><X size={10} /></button>
                    </span>
                  ))}
                  <select onChange={(e) => handleTallyLink(arn._id, e.target.value)} value="" className="bg-transparent text-[9px] font-bold uppercase text-emerald-600 outline-none">
                    <option value="" disabled>+ Link Firm</option>
                    {tallyFirms.filter(f => !arn.linkedTallyFirms?.includes(f)).map(firm => <option key={firm} value={firm}>{firm}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xs text-center">
            <AlertTriangle className="mx-auto text-rose-500 mb-4" size={24} />
            <p className="text-[10px] font-bold uppercase mb-6">Remove {deleteConfirm.code}?</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="py-2 bg-slate-100 rounded-lg text-[9px] font-bold uppercase">Cancel</button>
              <button onClick={executeDelete} className="py-2 bg-rose-600 text-white rounded-lg text-[9px] font-bold uppercase">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArnManagement;