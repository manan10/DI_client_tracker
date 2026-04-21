import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Edit3,
  CreditCard,
  X,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Check,
  Trash2,
  Eraser,
  AlertTriangle,
  ShieldAlert,
  AlertCircle
} from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { toast } from "sonner";

// --- CUSTOM CONFIRMATION MODAL COMPONENT ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = "danger", loading }) => {
  if (!isOpen) return null;

  const themes = {
    danger: "bg-red-500 shadow-red-500/20 text-red-500 border-red-500/20",
    warning: "bg-orange-500 shadow-orange-500/20 text-orange-500 border-orange-500/20",
  };

  const theme = themes[type] || themes.danger;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center">
          <div className={`p-4 rounded-3xl mb-6 ${theme.split(' ')[0]} bg-opacity-10 border ${theme.split(' ')[2]}`}>
            {type === "danger" ? <ShieldAlert size={32} /> : <AlertTriangle size={32} />}
          </div>
          <h3 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic mb-3">{title}</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">{message}</p>
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all active:scale-95 shadow-xl disabled:opacity-50 ${theme.split(' ')[0]}`}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : confirmText}
            </button>
            <button onClick={onClose} className="w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-200 transition-colors">Cancel Request</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN WALLET MANAGER COMPONENT ---
const WalletManager = ({ wallets, onUpdate }) => {
  const { request, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    type: "danger",
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    walletName: "",
    balance: 0,
    targetAllowance: 0,
    isGeneralPool: false,
    user: "",
  });

  const poolExists = wallets.find((w) => w.isGeneralPool);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await request("/users");
        setUsers(data || []);
      } catch (err) { console.error("User fetch failed", err); }
    };
    fetchUsers();
  }, [request]);

  const openEdit = (wallet) => {
    setEditingId(wallet._id);
    setFormData({
      walletName: wallet.walletName,
      balance: wallet.balance,
      targetAllowance: wallet.targetAllowance,
      isGeneralPool: wallet.isGeneralPool,
      user: wallet.user || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.isGeneralPool && poolExists && editingId !== poolExists._id) {
      toast.error("Constraint Violation", { description: "A General Pool already exists." });
      return;
    }
    try {
      if (editingId) {
        await request(`/wallets/${editingId}`, "PUT", formData);
        toast.success("Wallet Updated Successfully");
      } else {
        await request("/wallets", "POST", { ...formData, balance: 0 });
        toast.success("New Wallet Authorized");
      }
      setIsModalOpen(false);
      onUpdate();
    } catch (err) { toast.error("Process Failed", { description: err.message }); }
  };

  const triggerDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      type: "danger",
      title: "Terminate Wallet",
      message: "Are you sure? All remaining funds will be permanently moved back to the Master Pool.",
      onConfirm: async () => {
        try {
          await request(`/wallets/${id}`, "DELETE");
          toast.success("Wallet Terminated");
          onUpdate();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) { toast.error("Delete Failed", { description: err.message }); }
      }
    });
  };

  const triggerClear = (wallet) => {
    const isMaster = wallet.isGeneralPool;
    setConfirmConfig({
      isOpen: true,
      type: "warning",
      title: isMaster ? "Reset Master Pool" : "Sweep Wallet Balance",
      message: isMaster 
        ? "Warning: This will set the total vault balance to zero. This action is irreversible."
        : `Moving all funds from ${wallet.walletName} back to the Master Pool drawer.`,
      onConfirm: async () => {
        try {
          await request(`/wallets/${wallet._id}/clear`, "POST");
          toast.success("Funds Swept Successfully");
          onUpdate();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) { toast.error("Clear Failed", { description: err.message }); }
      }
    });
  };

  const selectedUser = users.find((u) => u._id === formData.user);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500 text-left">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="text-left">
          <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Wallets</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Members & Monthly Limits</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ walletName: "", balance: 0, targetAllowance: 0, isGeneralPool: false, user: "" });
            setIsModalOpen(true);
          }}
          className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <UserPlus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Wallet List */}
      <div className="grid grid-cols-1 gap-4">
        {wallets.map((w) => (
          <div key={w._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50 dark:bg-[#161B22]/50 rounded-4xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all gap-4">
            <div className="flex items-center gap-5 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${w.isGeneralPool ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "bg-white dark:bg-slate-800"} text-white border border-slate-100 dark:border-slate-700`}>
                <CreditCard size={24} className={w.isGeneralPool ? "text-white" : "text-slate-400"} />
              </div>
              <div className="text-left leading-none">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{w.walletName}</p>
                  {w.isGeneralPool && <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[7px] font-black text-blue-500 uppercase tracking-widest">Master</span>}
                </div>
                <div className="flex gap-4 items-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bal: ₹{w.balance.toLocaleString('en-IN')}</p>
                  <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Goal: ₹{w.targetAllowance.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={() => triggerClear(w)} className="flex-1 sm:flex-none p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-orange-500 transition-colors active:scale-90"><Eraser size={18} /></button>
              <button onClick={() => openEdit(w)} className="flex-1 sm:flex-none p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-emerald-500 transition-colors active:scale-90"><Edit3 size={18} /></button>
              {!w.isGeneralPool && <button onClick={() => triggerDelete(w._id)} className="flex-1 sm:flex-none p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-red-500 transition-colors active:scale-90"><Trash2 size={18} /></button>}
            </div>
          </div>
        ))}
      </div>

      {/* Auth Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        loading={loading}
        confirmText={confirmConfig.type === "danger" ? "Authorize Deletion" : "Authorize Sweep"}
      />

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSave} className="relative w-full max-w-xl bg-white dark:bg-[#0B1120] rounded-t-[3.5rem] p-10 pb-14 shadow-2xl animate-in slide-in-from-bottom-full border-t border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[95vh]">
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-10" />
            <div className="flex justify-between items-start mb-10 text-left">
              <div>
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{editingId ? "Edit Wallet" : "New Wallet"}</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic mt-2">Authorization Required</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full"><X size={24} strokeWidth={3} /></button>
            </div>
            <div className="space-y-8">
              {/* Type Switcher */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 leading-none">Wallet Type</label>
                <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setFormData({ ...formData, isGeneralPool: false, walletName: editingId ? formData.walletName : "" })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isGeneralPool ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm border border-slate-100" : "text-slate-400"}`}>Individual Member</button>
                  <button type="button" disabled={poolExists && !formData.isGeneralPool} onClick={() => setFormData({ ...formData, isGeneralPool: true, walletName: "The Drawer", user: "" })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isGeneralPool ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 disabled:opacity-20"}`}>General Pool</button>
                </div>
              </div>

              {/* Wallet Name Input - Added here */}
              {!formData.isGeneralPool && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2 leading-none">Wallet Name / Alias</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daily Allowance, Vacation Fund"
                    value={formData.walletName}
                    onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>
              )}

              {/* Member Selector */}
              {!formData.isGeneralPool && (
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 leading-none">Linked Member</label>
                  <button type="button" onClick={() => setShowUserDropdown(!showUserDropdown)} className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-left border border-slate-100 dark:border-slate-800 flex justify-between items-center group transition-all">
                    <span className={`text-xs font-black uppercase tracking-widest ${selectedUser ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{selectedUser ? selectedUser.name : "Choose family member..."}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute top-[105%] left-0 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden">
                      <div className="max-h-48 overflow-y-auto no-scrollbar">
                        {users.map((u) => (
                          <button key={u._id} type="button" onClick={() => { setFormData({ ...formData, user: u._id }); setShowUserDropdown(false); }} className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b dark:border-slate-800/50">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{u.name}</span>
                            {formData.user === u._id && <Check size={16} className="text-emerald-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {editingId && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <AlertCircle size={16} className="text-amber-500 shrink-0" />
                  <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-tight leading-normal">Current Balance (₹{formData.balance.toLocaleString()}) is locked. Use the "Clear" or "Top-up" tools to move funds.</p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2 leading-none">Monthly Allowance Goal (₹)</label>
                <input type="number" required value={formData.targetAllowance} onChange={(e) => setFormData({ ...formData, targetAllowance: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-2xl font-[1000] text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all" onKeyDown={(e) => (e.key === "ArrowUp" || e.key === "ArrowDown") && e.preventDefault()} onWheel={(e) => e.target.blur()} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white h-24 rounded-[2.5rem] font-[1000] uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-4">
                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                {editingId ? "Update Configuration" : "Authorize Wallet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WalletManager;