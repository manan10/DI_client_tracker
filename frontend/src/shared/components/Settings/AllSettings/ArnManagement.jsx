import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Shield, 
  Loader2, 
  Edit2, 
  Check, 
  X, 
  AlertTriangle, 
  Building2, 
  Plus, 
  ShieldCheck, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

import { useApi } from '../../../hooks/useApi';
import { tallyTemplates } from '../../../../apps/client-tracker/utils/tallyTemplates';
import PageHeader from '../../../components/Auth/PageHeader';

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
      } catch {
        toast.error("Could not connect to accounting bridge");
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [request]);

  const handleAdd = async () => {
    if (!formData.arnCode.trim() || !formData.nickname.trim()) {
      return toast.warning("Please provide both an ARN code and a display name");
    }
    const res = await request('/arns', 'POST', formData);
    if (res?.data) {
      setArns(prev => [...prev, res.data]);
      setFormData({ arnCode: '', nickname: '', gstCompliant: false });
      toast.success("License registered successfully");
    }
  };

  const handleUpdate = async (id) => {
    if (!editData.arnCode.trim() || !editData.nickname.trim()) {
      return toast.warning("License code and display name cannot be blank");
    }
    const res = await request(`/arns/${id}`, 'PUT', editData);
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === id ? res.data : a));
      setEditingId(null);
      toast.success("License details updated");
    }
  };

  const handleToggleGstInline = async (arnObj) => {
    const updatedStatus = !arnObj.gstCompliant;
    const res = await request(`/arns/${arnObj._id}`, 'PUT', { ...arnObj, gstCompliant: updatedStatus });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnObj._id ? res.data : a));
      toast.success(`${arnObj.nickname}: GST status updated`);
    }
  };

  const handleTallyLink = async (arnId, firmName) => {
    if (!firmName) return;
    const res = await request(`/arns/${arnId}/tally-link`, 'PATCH', { tallyName: firmName });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnId ? res.data : a));
      toast.success(`Connected to ${firmName}`);
    }
  };

  const handleRemoveTallyLink = async (arnId, firmName) => {
    const arn = arns.find(a => a._id === arnId);
    const updatedFirms = (arn.linkedTallyFirms || []).filter(f => f !== firmName);
    const res = await request(`/arns/${arnId}`, 'PUT', { linkedTallyFirms: updatedFirms });
    if (res?.data) {
      setArns(prev => prev.map(a => a._id === arnId ? res.data : a));
      toast.success(`Removed link to ${firmName}`);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const res = await request(`/arns/${deleteConfirm.id}`, 'DELETE');
    if (res?.success) {
      setArns(prev => prev.filter(a => a._id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success("License removed from system");
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
        title="Brokerage"
        accent="Licenses (ARN)"
        description="Register your distributor licenses, manage GST tax eligibility, and link each code to its matching company in Tally."
      />

      {/* QUICK ADD BANNER */}
      <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
          Register New License
        </span>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input 
            placeholder="ARN Number (e.g. ARN-12345)" 
            value={formData.arnCode} 
            onChange={e => setFormData({ ...formData, arnCode: e.target.value })} 
            className="w-full sm:w-1/3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold uppercase text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs" 
          />
          <input 
            placeholder="Owner / Entity Name (e.g. Family Trust, Self)" 
            value={formData.nickname} 
            onChange={e => setFormData({ ...formData, nickname: e.target.value })} 
            className="w-full sm:flex-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs" 
          />
          <button 
            type="button"
            onClick={handleAdd} 
            className="shrink-0 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Plus size={16} />
            <span>Add License</span>
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Compact License Cards */}
      <div className="lg:hidden flex flex-col gap-3">
        {arns.map((arn) => (
          <div 
            key={arn._id} 
            className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl p-4 shadow-xs space-y-4"
          >
            {editingId === arn._id ? (
              <div className="space-y-3">
                <input 
                  value={editData.arnCode} 
                  onChange={e => setEditData({ ...editData, arnCode: e.target.value })} 
                  placeholder="ARN Number"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500 rounded-lg px-3 py-2 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none" 
                />
                <input 
                  value={editData.nickname} 
                  onChange={e => setEditData({ ...editData, nickname: e.target.value })} 
                  placeholder="Entity Name"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-500 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none" 
                />
                <div className="flex items-center gap-2 pt-1">
                  <button 
                    type="button"
                    onClick={() => handleUpdate(arn._id)} 
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
                    <div className={`p-2.5 rounded-xl shrink-0 border ${
                      arn.gstCompliant 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-400 border-slate-200 dark:border-white/5"
                    }`}>
                      <Shield size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        {arn.arnCode}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {arn.nickname}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      type="button"
                      onClick={() => { setEditingId(arn._id); setEditData({ arnCode: arn.arnCode, nickname: arn.nickname, gstCompliant: arn.gstCompliant }); }} 
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                      title="Edit license"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteConfirm({ id: arn._id, code: arn.arnCode })} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg"
                      title="Delete license"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* GST Toggle & Tally Strip */}
                <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Tax Status:
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleToggleGstInline(arn)} 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors border cursor-pointer
                        ${arn.gstCompliant 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30' 
                          : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-white/10'
                        }`}
                    >
                      {arn.gstCompliant ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
                      <span>{arn.gstCompliant ? 'GST Registered' : 'Not Registered'}</span>
                    </button>
                  </div>

                  {/* Connected Tally Firms */}
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      <Building2 size={12} /> Connected Tally Books
                    </span>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {(arn.linkedTallyFirms || []).map(firm => (
                        <div key={firm} className="flex items-center gap-1.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 pl-2 pr-1 py-1 rounded-md shadow-2xs">
                          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-40">{firm}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTallyLink(arn._id, firm)} 
                            className="p-0.5 text-slate-400 hover:text-rose-500"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {/* Add Firm Select */}
                      <div className="relative w-full mt-1">
                        <select 
                          onChange={(e) => { handleTallyLink(arn._id, e.target.value); e.target.value = ""; }} 
                          defaultValue=""
                          className="w-full appearance-none bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 rounded-md outline-none cursor-pointer"
                        >
                          <option value="" disabled>+ Connect Company Book</option>
                          {tallyFirms.filter(f => !arn.linkedTallyFirms?.includes(f)).map(firm => (
                            <option key={firm} value={firm} className="text-slate-900 bg-white dark:bg-slate-900">{firm}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {arns.length === 0 && (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0B1120] rounded-xl border border-slate-200 dark:border-white/10">
            <Shield size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">No licenses registered yet.</p>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: Data Table */}
      <div className="hidden lg:block bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10">
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-1/4">
                License Details
              </th>
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-1/6">
                Tax Eligibility
              </th>
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-5/12">
                Connected Tally Companies
              </th>
              <th className="px-5 py-3.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-1/12 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {arns.map((arn) => (
              <tr key={arn._id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                {editingId === arn._id ? (
                  <td colSpan="4" className="p-3 bg-emerald-50/30 dark:bg-emerald-500/5">
                    <div className="flex items-center gap-3">
                      <input 
                        value={editData.arnCode} 
                        onChange={e => setEditData({ ...editData, arnCode: e.target.value })} 
                        className="w-1/4 bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg px-3 py-1.5 text-xs font-bold uppercase text-slate-900 dark:text-white outline-none" 
                      />
                      <input 
                        value={editData.nickname} 
                        onChange={e => setEditData({ ...editData, nickname: e.target.value })} 
                        className="flex-1 bg-white dark:bg-[#0B1120] border border-emerald-500 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none" 
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          type="button"
                          onClick={() => handleUpdate(arn._id)} 
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
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          {arn.arnCode}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          {arn.nickname}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <button 
                        type="button"
                        onClick={() => handleToggleGstInline(arn)} 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border cursor-pointer
                          ${arn.gstCompliant 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/20' 
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                          }`}
                      >
                        {arn.gstCompliant ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        <span>{arn.gstCompliant ? 'GST Registered' : 'Not Registered'}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {(arn.linkedTallyFirms || []).map(firm => (
                          <div 
                            key={firm} 
                            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 pl-2.5 pr-1.5 py-1 rounded-md"
                          >
                            <Building2 size={13} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 truncate max-w-48">
                              {firm}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleRemoveTallyLink(arn._id, firm)} 
                              className="p-0.5 text-indigo-400 hover:text-rose-500 rounded ml-1"
                              title="Disconnect company"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}

                        <div className="relative inline-flex items-center">
                          <select 
                            onChange={(e) => { handleTallyLink(arn._id, e.target.value); e.target.value = ""; }} 
                            defaultValue="" 
                            className="appearance-none bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 pl-2.5 pr-6 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-md outline-none cursor-pointer border border-slate-200 dark:border-white/10"
                          >
                            <option value="" disabled>+ Connect Company</option>
                            {tallyFirms.filter(f => !arn.linkedTallyFirms?.includes(f)).map(firm => (
                              <option key={firm} value={firm} className="text-slate-900 bg-white dark:bg-slate-900">{firm}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 pointer-events-none text-slate-400" />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          type="button"
                          onClick={() => { setEditingId(arn._id); setEditData({ arnCode: arn.arnCode, nickname: arn.nickname, gstCompliant: arn.gstCompliant }); }} 
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                          title="Edit license"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setDeleteConfirm({ id: arn._id, code: arn.arnCode })} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                          title="Delete license"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
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
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete License</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Permanently remove code</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirm.code}</strong>? Any linked commissions and audit mapping will lose this assignment.
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

export default ArnManagement;