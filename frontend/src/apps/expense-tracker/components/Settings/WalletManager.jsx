import React, { useState, useEffect, useMemo } from "react";
import {
  Edit3,
  X,
  Loader2,
  Check,
  Trash2,
  Eraser,
  Landmark,
  Globe,
  Wallet as WalletIcon,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Plus,
  ChevronDown,
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
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-lg p-5 shadow-xl border border-slate-200 dark:border-white/10">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-md border shrink-0 ${
              isDanger
                ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
            }`}
          >
            {isDanger ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-serif tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-3.5 py-1.5 rounded-md text-xs font-sans font-semibold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer ${
              isDanger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {loading && <Loader2 className="animate-spin" size={13} />}
            <span>{confirmText}</span>
          </button>
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

  const sortedWallets = useMemo(() => {
    return [...wallets].sort((a, b) => {
      if (a.isGeneralPool) return -1;
      if (b.isGeneralPool) return 1;
      if (a.isVirtual && !b.isVirtual) return 1;
      if (!a.isVirtual && b.isVirtual) return -1;
      return a.walletName.localeCompare(b.walletName);
    });
  }, [wallets]);

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
        toast.success("Wallet configuration updated");
      } else {
        await request("/wallets", "POST", formData);
        toast.success("New wallet added");
      }
      setIsModalOpen(false);
      onUpdate();
    } catch (err) {
      toast.error("Operation failed", { description: err.message });
    }
  };

  const triggerDelete = (id) => {
    setConfirmConfig({
      isOpen: true,
      type: "danger",
      title: "Delete Wallet",
      message:
        "Are you sure? Cash funds will return to the Master Pool, and digital bindings will be removed.",
      onConfirm: async () => {
        try {
          await request(`/wallets/${id}`, "DELETE");
          onUpdate();
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          toast.success("Wallet removed");
        } catch (err) {
          toast.error("Delete failed", { description: err.message });
        }
      },
    });
  };

  const triggerClear = (wallet) => {
    setConfirmConfig({
      isOpen: true,
      type: "warning",
      title: "Sweep Wallet Funds",
      message: `Reset balance for "${wallet.walletName}". Physical cash will transfer to Master Pool.`,
      onConfirm: async () => {
        try {
          await request(`/wallets/${wallet._id}/clear`, "POST");
          onUpdate();
          setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
          toast.success("Balance cleared to Master Pool");
        } catch (err) {
          toast.error("Sweep failed", { description: err.message });
        }
      },
    });
  };

  const getTypeMeta = (w) => {
    if (w.isGeneralPool) {
      return {
        label: "Master",
        badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        icon: <Landmark size={14} className="text-blue-600 dark:text-blue-400" />,
      };
    }
    if (w.isVirtual) {
      return {
        label: "Digital",
        badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
        icon: <Globe size={14} className="text-indigo-600 dark:text-indigo-400" />,
      };
    }
    return {
      label: "Cash",
      badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20",
      icon: <WalletIcon size={14} className="text-emerald-700 dark:text-emerald-400" />,
    };
  };

  const selectedUser = users.find((u) => u._id === formData.user);

  return (
    <div className="space-y-5">
      {/* SECTION TOP BAR */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Wallet <span className="italic font-normal text-emerald-800 dark:text-emerald-400">List</span>
          </h2>
          <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
            Overview and controls for cash allocations, master pools, and digital accounts.
          </p>
        </div>

        <button
          type="button"
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-md text-xs font-sans font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Add Wallet</span>
        </button>
      </div>

      {/* COMPACT WALLET TABLE (DESKTOP) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2 pr-3">Account</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Custodian</th>
              <th className="py-2 px-3 text-right">Target (₹)</th>
              <th className="py-2 px-3 text-right">Balance</th>
              <th className="py-2 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-sans">
            {sortedWallets.map((w) => {
              const meta = getTypeMeta(w);
              const custodianName = w.user?.name || (w.isGeneralPool ? "Master Pool" : "Unassigned");

              return (
                <tr
                  key={w._id}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Account Name */}
                  <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-slate-100 dark:bg-slate-800">
                        {meta.icon}
                      </div>
                      <span>{w.walletName}</span>
                    </div>
                  </td>

                  {/* Type Badge */}
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                  </td>

                  {/* Custodian */}
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {custodianName}
                  </td>

                  {/* Monthly Target */}
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {!w.isVirtual ? (
                      `₹${Number(w.targetAllowance || 0).toLocaleString("en-IN")}`
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>

                  {/* Balance */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {w.isVirtual ? (
                      <span className="text-xs font-sans font-medium text-indigo-600 dark:text-indigo-400">
                        Linked
                      </span>
                    ) : (
                      `₹${Number(w.balance || 0).toLocaleString("en-IN")}`
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {!w.isVirtual && (
                        <button
                          type="button"
                          onClick={() => triggerClear(w)}
                          className="p-1 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded transition-colors cursor-pointer"
                          title="Sweep Funds to Master"
                        >
                          <Eraser size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(w)}
                        className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                        title="Edit Wallet"
                      >
                        <Edit3 size={14} />
                      </button>
                      {!w.isGeneralPool && (
                        <button
                          type="button"
                          onClick={() => triggerDelete(w._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          title="Delete Wallet"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE COMPACT LIST VIEW */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
        {sortedWallets.map((w) => {
          const meta = getTypeMeta(w);
          const custodianName = w.user?.name || (w.isGeneralPool ? "Master Pool" : "Unassigned");

          return (
            <div key={w._id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 shrink-0">
                  {meta.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sans font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {w.walletName}
                    </span>
                    <span className={`text-[9px] font-sans px-1.5 py-0.2 rounded border shrink-0 ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 truncate block">
                    {custodianName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                    {w.isVirtual ? "Linked" : `₹${Number(w.balance || 0).toLocaleString("en-IN")}`}
                  </span>
                  {!w.isVirtual && (
                    <span className="text-[10px] font-mono text-slate-400 block">
                      T: ₹{Number(w.targetAllowance || 0).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => openEdit(w)}
                    className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  {!w.isGeneralPool && (
                    <button
                      type="button"
                      onClick={() => triggerDelete(w._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedWallets.length === 0 && (
        <div className="py-10 text-center text-xs font-sans text-slate-400">
          No wallets configured. Click "Add Wallet" above to create one.
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        loading={loading}
        confirmText="Confirm"
      />

      {/* EDIT / CREATE WALLET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <form
            onSubmit={handleSave}
            className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-lg p-5 shadow-xl border border-slate-200 dark:border-white/10"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-serif tracking-tight text-slate-900 dark:text-white">
                {editingId ? "Edit" : "New"}{" "}
                <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
                  Wallet
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Type Switcher */}
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isGeneralPool: false, isVirtual: false })
                    }
                    className={`py-1 text-xs font-sans font-medium rounded transition-all cursor-pointer ${
                      !formData.isGeneralPool && !formData.isVirtual
                        ? "bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-400 font-semibold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isGeneralPool: false, isVirtual: true })
                    }
                    className={`py-1 text-xs font-sans font-medium rounded transition-all cursor-pointer ${
                      formData.isVirtual
                        ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
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
                    className={`py-1 text-xs font-sans font-medium rounded transition-all cursor-pointer ${
                      formData.isGeneralPool
                        ? "bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-semibold shadow-2xs"
                        : "text-slate-600 dark:text-slate-400 disabled:opacity-30"
                    }`}
                  >
                    Master
                  </button>
                </div>
              </div>

              {!formData.isGeneralPool && (
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.walletName}
                    onChange={(e) =>
                      setFormData({ ...formData, walletName: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-sans text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    placeholder="e.g. Daily Pocket"
                  />
                </div>
              )}

              {!formData.isGeneralPool && (
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Custodian
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-left text-xs font-sans flex justify-between items-center cursor-pointer"
                  >
                    <span className={selectedUser ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
                      {selectedUser ? selectedUser.name : "Unassigned / Shared"}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded shadow-lg z-50 py-1 max-h-40 overflow-y-auto no-scrollbar">
                      {users.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, user: u._id });
                            setShowUserDropdown(false);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs font-sans hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{u.name}</span>
                          {formData.user === u._id && <Check size={12} className="text-emerald-600" />}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, user: "" });
                          setShowUserDropdown(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-xs font-sans text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border-t border-slate-100 dark:border-white/5 cursor-pointer"
                      >
                        Clear Custodian
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!formData.isVirtual ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Monthly Target (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.targetAllowance}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAllowance: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-mono font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/20 rounded">
                  <AlertCircle size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <p className="text-[11px] font-sans text-indigo-900 dark:text-indigo-200">
                    Digital accounts are reconciled separately from monthly cash refills.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-2 rounded text-xs font-sans font-semibold tracking-wide transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={14} /> : (editingId ? "Save Changes" : "Create Wallet")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default WalletManager;