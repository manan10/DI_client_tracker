import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Key,
  X,
  Shield,
  Loader2,
  User,
  Trash2,
  Mail,
  Fingerprint,
  Phone,
  Edit3,
  Monitor,
  Wallet,
  Check,
  ShieldCheck,
  AlertTriangle,
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
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-2xl mb-4 bg-rose-50 text-rose-500 dark:bg-rose-500/10">
            <AlertTriangle size={24} />
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
              className="flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center bg-rose-500 hover:bg-rose-600"
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

const UserManager = () => {
  const { request, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // For Password Reset
  const [updatingUser, setUpdatingUser] = useState(null); // For Profile Edit
  const [deleteConfig, setDeleteConfig] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  const initialForm = {
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    isAdmin: false,
    allowedApps: ["CLIENT_TRACKER"],
  };
  const [formData, setFormData] = useState(initialForm);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const len = phoneNumber.length;
    if (len <= 2) return `+${phoneNumber}`;
    if (len <= 7) return `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2)}`;
    return `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 7)} ${phoneNumber.slice(7, 12)}`;
  };

  const fetchUsers = useCallback(async () => {
    try {
      const data = await request("/users");
      setUsers(data || []);
    } catch (err) {
      console.error("Sync Failure", err);
    }
  }, [request]);

  useEffect(() => {
    let isMounted = true;
    const loadRegistry = async () => {
      try {
        const data = await request("/users");
        if (isMounted) setUsers(data || []);
      } catch (err) {
        console.error("Initial Load Failure", err);
      }
    };
    loadRegistry();
    return () => {
      isMounted = false;
    };
  }, [request]);

  const handleOpenEdit = (user) => {
    setUpdatingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone || "+91 ",
      isAdmin: user.isAdmin || false,
      allowedApps: user.allowedApps || [],
    });
    setIsModalOpen(true);
  };

  const toggleApp = (appId) => {
    const current = formData.allowedApps || [];
    const updated = current.includes(appId)
      ? current.filter((a) => a !== appId)
      : [...current, appId];
    setFormData({ ...formData, allowedApps: updated });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (updatingUser) {
        await request(`/users/${updatingUser._id}`, "PUT", formData);
        toast.success("Profile Updated");
      } else {
        await request("/users/register", "POST", formData);
        toast.success("Member Authorized");
      }
      setIsModalOpen(false);
      setUpdatingUser(null);
      setFormData(initialForm);
      fetchUsers();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await request(`/users/${editingUser._id}/reset-password`, "PATCH", {
        password: formData.password,
      });
      toast.success("Security Key Updated");
      setEditingUser(null);
      setFormData(initialForm);
    } catch {
      toast.error("Update failed");
    }
  };

  const executeDelete = async () => {
    try {
      await request(`/users/${deleteConfig.id}`, "DELETE");
      toast.success("Member Removed");
      fetchUsers();
      setDeleteConfig({ isOpen: false, id: null, name: "" });
    } catch {
      toast.error("Deletion Failed");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 text-left">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">
            Members
          </h2>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
            Registry & Access Protocol
          </p>
        </div>
        <button
          onClick={() => {
            setUpdatingUser(null);
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl active:scale-95 transition-all shadow-sm"
        >
          <UserPlus size={14} strokeWidth={3} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Add Member
          </span>
        </button>
      </div>

      {/* USER LIST */}
      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white dark:bg-[#0B1120] rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-4 text-left min-w-0">
              {/* Premium Avatar sizing */}
              <div
                className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300 ${u.isAdmin ? "bg-linear-to-br from-emerald-400 to-emerald-600 text-white" : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 border border-slate-100 dark:border-slate-700"}`}
              >
                {u.isAdmin ? (
                  <ShieldCheck size={20} strokeWidth={2.5} />
                ) : (
                  <User size={20} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-[1000] text-slate-900 dark:text-white uppercase tracking-tight truncate">
                    {u.name}
                  </p>
                  {u.isAdmin && (
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-500/20">
                      <Shield size={8} fill="currentColor" /> Admin
                    </span>
                  )}
                  {u.allowedApps?.map((app) => (
                    <span
                      key={app}
                      className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700"
                    >
                      {app === "CLIENT_TRACKER" ? "CLIENTS" : "EXPENSE"}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    @{u.username}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    {u.phone || "No contact"}
                  </span>
                </div>
              </div>
            </div>

            {/* Upgraded Mobile Action Bar using Grid instead of Flex-1 */}
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-5 mt-4 sm:mt-0">
              <button
                onClick={() => handleOpenEdit(u)}
                className="flex items-center justify-center gap-1.5 py-3 sm:py-2.5 sm:px-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-colors bg-slate-50 sm:bg-transparent dark:bg-slate-800/50 sm:dark:bg-transparent"
                title="Edit Profile"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => setEditingUser(u)}
                className="flex items-center justify-center gap-1.5 py-3 sm:py-2.5 sm:px-3 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors bg-slate-50 sm:bg-transparent dark:bg-slate-800/50 sm:dark:bg-transparent"
                title="Reset Key"
              >
                <Key size={16} />
              </button>
              <button
                onClick={() =>
                  setDeleteConfig({ isOpen: true, id: u._id, name: u.name })
                }
                className="flex items-center justify-center gap-1.5 py-3 sm:py-2.5 sm:px-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors bg-slate-50 sm:bg-transparent dark:bg-slate-800/50 sm:dark:bg-transparent"
                title="Remove"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmationModal
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        title="Revoke Access"
        message={`Are you sure you want to permanently remove ${deleteConfig.name} from the system?`}
        confirmText="Remove Member"
        loading={loading}
      />

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <form
            onSubmit={handleSaveUser}
            className="relative w-full sm:max-w-lg bg-white dark:bg-[#0B1120] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 border border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[85vh] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-left"
          >
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden" />

            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic">
                  {updatingUser ? "Update Profile" : "New Member"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    required
                    placeholder="ENTER NAME..."
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all uppercase placeholder:text-slate-400"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Username
                  </label>
                  <input
                    required
                    placeholder="SET ID..."
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/\s/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="email"
                      required
                      placeholder="name@family.com"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 pl-10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 pl-10 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: formatPhoneNumber(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ADMIN OVERRIDE TOGGLE */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Role Configuration
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isAdmin: !formData.isAdmin })
                  }
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${formData.isAdmin ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/50 shadow-sm" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-colors ${formData.isAdmin ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"}`}
                    >
                      <ShieldCheck size={16} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-widest ${formData.isAdmin ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-300"}`}
                      >
                        System Administrator
                      </p>
                      <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest">
                        Grant full system oversight
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full relative transition-all duration-300 ${formData.isAdmin ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.isAdmin ? "left-5" : "left-1"}`}
                    />
                  </div>
                </button>
              </div>

              {/* TOOL ACCESS */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Application Privileges
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: "CLIENT_TRACKER",
                      label: "Client Tracker",
                      icon: Monitor,
                    },
                    {
                      id: "EXPENSE_TRACKER",
                      label: "Expense App",
                      icon: Wallet,
                    },
                  ].map((app) => {
                    const isSelected = formData.allowedApps?.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => toggleApp(app.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          isSelected
                            ? "bg-white dark:bg-slate-800 border-emerald-500 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" : "bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"}`}
                        >
                          <app.icon
                            size={14}
                            strokeWidth={isSelected ? 2.5 : 2}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}
                          >
                            {app.label}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700"}`}
                        >
                          {isSelected && <Check size={10} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!updatingUser && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Initial Security Key
                  </label>
                  <div className="relative">
                    <Fingerprint
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 pl-10 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Check size={16} strokeWidth={3} />
                )}
                {updatingUser ? "Update Registry" : "Authorize Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-150 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setEditingUser(null)}
          />
          <form
            onSubmit={handlePasswordReset}
            className="relative w-full sm:max-w-sm bg-white dark:bg-[#0B1120] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-8 duration-300 text-left [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="w-12 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden" />

            <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic">
                  Security Key
                </h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Reset for {editingUser.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-50 dark:bg-slate-800 transition-colors"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  New Access Key
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 p-3 pl-10 rounded-xl text-lg font-black text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-800 focus:border-blue-500 transition-all placeholder:text-slate-400/50"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3.5 rounded-xl font-bold uppercase text-[10px] tracking-widest active:scale-95 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Shield size={16} />
                )}
                Confirm Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManager;
