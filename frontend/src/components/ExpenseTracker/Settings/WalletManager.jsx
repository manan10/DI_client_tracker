import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus, Edit3, CreditCard, X, Loader2, ShieldCheck, ChevronDown,
  Check, Trash2, Eraser, Landmark, Globe, TrendingUp, WalletIcon,
  ShieldAlert, AlertTriangle, AlertCircle
} from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { toast } from "sonner";

// --- CUSTOM CONFIRMATION MODAL ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = "danger", loading }) => {
  if (!isOpen) return null;
  const themes = {
    danger: "bg-red-500 shadow-red-500/20 text-red-500 border-red-500/20",
    warning: "bg-orange-500 shadow-orange-500/20 text-orange-500 border-orange-500/20",
  };
  const theme = themes[type] || themes.danger;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
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

// --- MAIN WALLET MANAGER ---
const WalletManager = ({ wallets, onUpdate }) => {
  const { request, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false, type: "danger", title: "", message: "", onConfirm: () => {},
  });

  const [formData, setFormData] = useState({
    walletName: "", balance: 0, targetAllowance: 0, isGeneralPool: false, isVirtual: false, user: "",
  });

  const sections = useMemo(() => ({
    drawer: wallets.filter(w => w.isGeneralPool),
    cash: wallets.filter(w => !w.isGeneralPool && !w.isVirtual),
    virtual: wallets.filter(w => w.isVirtual)
  }), [wallets]);

  const poolExists = wallets.find((w) => w.isGeneralPool);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await request("/users");
        setUsers(data || []);
      } catch (err) { console.error("User fetch failed", err); }
    };
    if (isModalOpen) fetchUsers();
  }, [request, isModalOpen]);

  const openEdit = (wallet) => {
    setEditingId(wallet._id);
    setFormData({
      walletName: wallet.walletName,
      balance: wallet.balance,
      targetAllowance: wallet.targetAllowance,
      isGeneralPool: wallet.isGeneralPool,
      isVirtual: wallet.isVirtual || false,
      user: wallet.user?._id || wallet.user || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await request(`/wallets/${editingId}`, "PUT", formData);
        toast.success("Configuration Updated");
      } else {
        await request("/wallets", "POST", formData);
        toast.success("Wallet Authorized");
      }
      setIsModalOpen(false);
      onUpdate();
    } catch (err) { toast.error("Process Failed", { description: err.message }); }
  };

  const triggerDelete = (id) => {
    setConfirmConfig({
      isOpen: true, type: "danger", title: "Terminate Wallet",
      message: "Are you sure? Standard funds will return to the Master Pool. Digital assets will be purged.",
      onConfirm: async () => {
        try {
          await request(`/wallets/${id}`, "DELETE");
          onUpdate();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          toast.success("Wallet Terminated");
        } catch (err) { toast.error("Delete Failed", { description: err.message }); }
      }
    });
  };

  const triggerClear = (wallet) => {
    setConfirmConfig({
      isOpen: true, type: "warning", title: "Authorize Sweep",
      message: `Resetting balance for ${wallet.walletName}. Physical funds will move to the Master Pool.`,
      onConfirm: async () => {
        try {
          await request(`/wallets/${wallet._id}/clear`, "POST");
          onUpdate();
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          toast.success("Balance Cleared");
        } catch (err) { toast.error("Clear Failed", { description: err.message }); }
      }
    });
  };

  const WalletCard = ({ w }) => (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-[#0B1120] rounded-4xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm">
      <div className="flex items-center gap-4 text-left">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
          w.isGeneralPool ? "bg-blue-600 shadow-blue-500/20" : w.isVirtual ? "bg-indigo-600 shadow-indigo-500/20" : "bg-emerald-600 shadow-emerald-500/20"
        }`}>
          {w.isGeneralPool ? <Landmark size={20} /> : w.isVirtual ? <Globe size={20} /> : <WalletIcon size={20} />}
        </div>
        <div className="leading-tight">
          <p className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase tracking-tight">{w.walletName}</p>
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
            {w.isVirtual ? "External Link" : `Bal: ₹${w.balance.toLocaleString('en-IN')}`}
          </p>
        </div>
      </div>
      {/* ALWAYS VISIBLE ACTIONS */}
      <div className="flex items-center gap-1 transition-opacity">
        {!w.isVirtual && (
          <button 
            onClick={() => triggerClear(w)} 
            className="p-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:text-orange-500 transition-colors rounded-xl border border-slate-100 dark:border-slate-800"
            title="Sweep Funds"
          >
            <Eraser size={14} />
          </button>
        )}
        <button 
          onClick={() => openEdit(w)} 
          className="p-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:text-emerald-500 transition-colors rounded-xl border border-slate-100 dark:border-slate-800"
          title="Edit Config"
        >
          <Edit3 size={14} />
        </button>
        {!w.isGeneralPool && (
          <button 
            onClick={() => triggerDelete(w._id)} 
            className="p-2.5 bg-slate-50 dark:bg-slate-900/50 text-slate-400 hover:text-red-500 transition-colors rounded-xl border border-slate-100 dark:border-slate-800"
            title="Terminate"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );

  const selectedUser = users.find((u) => u._id === formData.user);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="text-left">
          <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Wallet Hub</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Wallet Configurations</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ walletName: "", balance: 0, targetAllowance: 0, isGeneralPool: false, isVirtual: false, user: "" });
            setIsModalOpen(true);
          }}
          className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <UserPlus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="space-y-10">
        {/* Master Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">General Pool</span>
          </div>
          <div className="grid grid-cols-1">
            {sections.drawer.map(w => <WalletCard key={w._id} w={w} />)}
          </div>
        </div>

        {/* Physical Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cash Wallets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sections.cash.map(w => <WalletCard key={w._id} w={w} />)}
          </div>
        </div>

        {/* Digital Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Globe size={14} className="text-indigo-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Digital & UPI Wallets</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sections.virtual.map(w => <WalletCard key={w._id} w={w} />)}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        loading={loading}
        confirmText="Authorize"
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-130 flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSave} className="relative w-full max-w-xl bg-white dark:bg-[#0B1120] rounded-t-[3.5rem] p-10 pb-14 shadow-2xl animate-in slide-in-from-bottom-full border-t border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[95vh]">
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-10" />
            
            <div className="flex justify-between items-start mb-10 text-left">
              <div>
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{editingId ? "Update Wallet" : "New Wallet"}</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic mt-2">Configure your wallet settings</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full"><X size={24} strokeWidth={3} /></button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Type</label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setFormData({ ...formData, isGeneralPool: false, isVirtual: false })} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!formData.isGeneralPool && !formData.isVirtual ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-400"}`}>CASH</button>
                  <button type="button" onClick={() => setFormData({ ...formData, isGeneralPool: false, isVirtual: true })} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.isVirtual ? "bg-indigo-600 text-white" : "text-slate-400"}`}>Bank/UPI</button>
                  <button type="button" disabled={poolExists && !formData.isGeneralPool} onClick={() => setFormData({ ...formData, isGeneralPool: true, isVirtual: false, walletName: "The Drawer", user: "" })} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.isGeneralPool ? "bg-blue-600 text-white" : "text-slate-400 disabled:opacity-20"}`}>GENERAL</button>
                </div>
              </div>

              {!formData.isGeneralPool && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Wallet Nickname</label>
                  <input type="text" required value={formData.walletName} onChange={(e) => setFormData({ ...formData, walletName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all placeholder:text-slate-700" placeholder="e.g. UPI Pocket" />
                </div>
              )}

              {!formData.isGeneralPool && (
                <div className="space-y-3 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 leading-none">Family Member</label>
                  <button type="button" onClick={() => setShowUserDropdown(!showUserDropdown)} className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-left border border-slate-100 dark:border-slate-800 flex justify-between items-center transition-all">
                    <span className={`text-xs font-black uppercase tracking-widest ${selectedUser ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{selectedUser ? selectedUser.name : "Unassigned / Shared"}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${showUserDropdown ? "rotate-180" : ""}`} />
                  </button>
                  {showUserDropdown && (
                    <div className="absolute top-[105%] left-0 w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden">
                      <div className="max-h-48 overflow-y-auto no-scrollbar">
                        {users.map((u) => (
                          <button key={u._id} type="button" onClick={() => { setFormData({ ...formData, user: u._id }); setShowUserDropdown(false); }} className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 border-b dark:border-slate-800/50">
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{u.name}</span>
                            {formData.user === u._id && <Check size={16} className="text-emerald-500" />}
                          </button>
                        ))}
                        <button type="button" onClick={() => { setFormData({ ...formData, user: "" }); setShowUserDropdown(false); }} className="w-full p-5 text-left text-[11px] font-black uppercase text-rose-500 hover:bg-rose-500/5 transition-colors">Clear Binding</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!formData.isVirtual ? (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">Monthly Target (₹)</label>
                  <input type="number" required value={formData.targetAllowance} onChange={(e) => setFormData({ ...formData, targetAllowance: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-2xl font-[1000] text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all" />
                </div>
              ) : (
                <div className="flex items-start gap-3 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                   <AlertCircle size={16} className="text-indigo-500 shrink-0" />
                   <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-relaxed">Virtual assets bypass the refill protocol. Balances are tracked independently of the Master Pool.</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white h-24 rounded-[2.5rem] font-[1000] uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                {editingId ? "Confirm Update" : "Add Wallet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WalletManager;