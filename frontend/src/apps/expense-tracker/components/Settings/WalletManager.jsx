import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Edit3,
  X,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Check,
  Trash2,
  Eraser,
  Landmark,
  Globe,
  TrendingUp,
  WalletIcon,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useApi } from "../../../../shared/hooks/useApi";
import { toast } from "sonner";

// --- COMPACT CONFIRMATION MODAL ---
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  type = "danger",
  loading,
}) => {
  if (!isOpen) return null;
  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div
            className={`p-3 rounded-2xl mb-4 ${isDanger ? "bg-rose-50 text-rose-500 dark:bg-rose-500/10" : "bg-amber-50 text-amber-500 dark:bg-amber-500/10"}`}
          >
            {isDanger ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-2">
            {title}
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex w-full gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center ${isDanger ? "bg-rose-500 hover:bg-rose-600" : "bg-amber-500 hover:bg-amber-600"}`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                confirmText
              )}
            </button>
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
    isVirtual: false,
    user: "",
  });

  const sections = useMemo(
    () => ({
      drawer: wallets.filter((w) => w.isGeneralPool),
      cash: wallets.filter((w) => !w.isGeneralPool && !w.isVirtual),
      virtual: wallets.filter((w) => w.isVirtual),
    }),
    [wallets],
  );

  const poolExists = wallets.find((w) => w.isGeneralPool);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await request("/users");
        setUsers(data || []);
      } catch (err) {
        console.error("User fetch failed", err);
      }
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
    } catch (err) {
      toast.error("Process Failed", { description: err.message });
    }
  };

  const triggerDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      type: "danger",
      title: "Terminate Wallet",
      message:
        "Are you sure? Standard funds will return to the Master Pool. Digital assets will be purged.",
      onConfirm: async () => {
        try {
          await request(`/wallets/${id}`, "DELETE");
          onUpdate();
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          toast.success("Wallet Terminated");
        } catch (err) {
          toast.error("Delete Failed", { description: err.message });
        }
      },
    });
  };

  const triggerClear = (wallet) => {
    setConfirmConfig({
      isOpen: true,
      type: "warning",
      title: "Authorize Sweep",
      message: `Resetting balance for ${wallet.walletName}. Physical funds will move to the Master Pool.`,
      onConfirm: async () => {
        try {
          await request(`/wallets/${wallet._id}/clear`, "POST");
          onUpdate();
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          toast.success("Balance Cleared");
        } catch (err) {
          toast.error("Clear Failed", { description: err.message });
        }
      },
    });
  };

  const WalletCard = ({ w }) => {
    const isMaster = w.isGeneralPool;
    const isDigital = w.isVirtual;

    const theme = isMaster
      ? {
          text: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-500/10",
          icon: <Landmark size={18} />,
        }
      : isDigital
        ? {
            text: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-500/10",
            icon: <Globe size={18} />,
          }
        : {
            text: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            icon: <WalletIcon size={18} />,
          };

    return (
      <div className="flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${theme.bg} ${theme.text}`}
          >
            {theme.icon}
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              {w.walletName}
            </p>
            <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {isDigital ? (
                <span className="text-sm text-indigo-500/80 italic">
                  Linked Asset
                </span>
              ) : (
                <>₹{w.balance.toLocaleString("en-IN")}</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-100 dark:border-slate-800 pl-3">
          {!isDigital && (
            <button
              onClick={() => triggerClear(w)}
              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
              title="Sweep Funds"
            >
              <Eraser size={14} />
            </button>
          )}
          <button
            onClick={() => openEdit(w)}
            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
            title="Edit Config"
          >
            <Edit3 size={14} />
          </button>
          {!isMaster && (
            <button
              onClick={() => triggerDelete(w._id)}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Terminate"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const selectedUser = users.find((u) => u._id === formData.user);

  return (
    <div className="animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">
            Wallets
          </h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
            Registry & Configuration
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              walletName: "",
              balance: 0,
              targetAllowance: 0,
              isGeneralPool: false,
              isVirtual: false,
              user: "",
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl active:scale-95 transition-all shadow-sm"
        >
          <Plus size={14} strokeWidth={3} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Add Wallet
          </span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Master Section */}
        {sections.drawer.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Master Pool
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.drawer.map((w) => (
                <WalletCard key={w._id} w={w} />
              ))}
            </div>
          </div>
        )}

        {/* Physical Section */}
        {sections.cash.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Cash Allocations
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.cash.map((w) => (
                <WalletCard key={w._id} w={w} />
              ))}
            </div>
          </div>
        )}

        {/* Digital Section */}
        {sections.virtual.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Globe size={14} className="text-indigo-500" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Digital Assets
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sections.virtual.map((w) => (
                <WalletCard key={w._id} w={w} />
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        loading={loading}
        confirmText="Authorize"
      />

      {/* NEW/EDIT MODAL - Compact and Scrollbar hidden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative w-full sm:max-w-md bg-white dark:bg-[#0B1120] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[85vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden" />

            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic">
                  {editingId ? "Update Config" : "New Wallet"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-50 dark:bg-slate-800 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Type Segmented Control */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Entity Type
                </label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 rounded-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isGeneralPool: false,
                        isVirtual: false,
                      })
                    }
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${!formData.isGeneralPool && !formData.isVirtual ? "bg-white dark:bg-slate-800 text-emerald-500 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                  >
                    Physical
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isGeneralPool: false,
                        isVirtual: true,
                      })
                    }
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${formData.isVirtual ? "bg-white dark:bg-slate-800 text-indigo-500 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                  >
                    Digital
                  </button>
                  <button
                    type="button"
                    disabled={poolExists && !formData.isGeneralPool}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isGeneralPool: true,
                        isVirtual: false,
                        walletName: "Master Pool",
                        user: "",
                      })
                    }
                    className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${formData.isGeneralPool ? "bg-white dark:bg-slate-800 text-blue-500 shadow-sm" : "text-slate-400 disabled:opacity-30 hover:text-slate-600 dark:hover:text-slate-300"}`}
                  >
                    Master
                  </button>
                </div>
              </div>

              {!formData.isGeneralPool && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Wallet Nickname
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.walletName}
                    onChange={(e) =>
                      setFormData({ ...formData, walletName: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    placeholder="e.g. Daily Pocket"
                  />
                </div>
              )}

              {!formData.isGeneralPool && (
                <div className="space-y-1.5 relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Assigned Custodian
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-left border border-slate-200 dark:border-slate-800 flex justify-between items-center transition-all focus:border-emerald-500"
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${selectedUser ? "text-slate-900 dark:text-white" : "text-slate-400"}`}
                    >
                      {selectedUser ? selectedUser.name : "Unassigned / Shared"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-300 ${showUserDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {users.map((u) => (
                          <button
                            key={u._id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, user: u._id });
                              setShowUserDropdown(false);
                            }}
                            className="w-full p-3 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                              {u.name}
                            </span>
                            {formData.user === u._id && (
                              <Check size={14} className="text-emerald-500" />
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, user: "" });
                            setShowUserDropdown(false);
                          }}
                          className="w-full p-3 text-left text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          Clear Binding
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!formData.isVirtual ? (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.targetAllowance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAllowance: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-lg font-black text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all"
                  />
                </div>
              ) : (
                <div className="flex items-start gap-2 p-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl mt-2">
                  <AlertCircle
                    size={14}
                    className="text-indigo-500 shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    Digital assets bypass the standard refill protocol. Balances
                    are tracked independently of the Master Pool.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}
                {editingId ? "Confirm Update" : "Authorize Wallet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WalletManager;
