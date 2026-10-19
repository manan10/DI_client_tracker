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
  Clapperboard,
} from "lucide-react";
import { useApi } from "../../../../shared/hooks/useApi";
import { toast } from "sonner";

const APP_ENTITLEMENTS = [
  {
    id: "CLIENT_TRACKER",
    label: "Client Tracker",
    icon: Monitor,
    badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
    activeCard: "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-900 dark:text-indigo-200",
    checkBg: "bg-indigo-600 border-indigo-600 text-white",
  },
  {
    id: "EXPENSE_TRACKER",
    label: "Expense Tracker",
    icon: Wallet,
    badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20",
    activeCard: "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
    checkBg: "bg-emerald-600 border-emerald-600 text-white",
  },
  {
    id: "SHOW_RATER",
    label: "Show Rater",
    icon: Clapperboard,
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
    activeCard: "border-rose-500/50 bg-rose-50/50 dark:bg-rose-500/10 text-rose-900 dark:text-rose-200",
    checkBg: "bg-rose-600 border-rose-600 text-white",
  },
];

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
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-lg p-5 shadow-xl border border-slate-200 dark:border-white/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-md border shrink-0 bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            <AlertTriangle size={18} />
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
            className="px-3.5 py-1.5 rounded-md text-xs font-sans font-semibold text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer bg-rose-600 hover:bg-rose-700 shadow-2xs"
          >
            {loading && <Loader2 className="animate-spin" size={13} />}
            <span>{confirmText}</span>
          </button>
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
      password: "",
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
        toast.success("Profile updated successfully");
      } else {
        await request("/users/register", "POST", formData);
        toast.success("New member authorized");
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
    if (!formData.password) return toast.error("Enter a new password");
    try {
      await request(`/users/${editingUser._id}/reset-password`, "PATCH", {
        password: formData.password,
      });
      toast.success("Security key updated");
      setEditingUser(null);
      setFormData(initialForm);
    } catch {
      toast.error("Update failed");
    }
  };

  const executeDelete = async () => {
    try {
      await request(`/users/${deleteConfig.id}`, "DELETE");
      toast.success("Member removed");
      fetchUsers();
      setDeleteConfig({ isOpen: false, id: null, name: "" });
    } catch {
      toast.error("Deletion failed");
    }
  };

  const getAppBadge = (appId) => {
    const match = APP_ENTITLEMENTS.find((a) => a.id === appId);
    if (!match) {
      return (
        <span
          key={appId}
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
        >
          {appId.replace("_", " ")}
        </span>
      );
    }
    const Icon = match.icon;
    return (
      <span
        key={appId}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium border ${match.badge}`}
      >
        <Icon size={11} strokeWidth={2.2} />
        <span>{match.label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-5 text-left">
      {/* SECTION TOP BAR */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Member <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Access</span>
          </h2>
          <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
            Configure system user profiles, authentication credentials, and application privileges.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setUpdatingUser(null);
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-md text-xs font-sans font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs"
        >
          <UserPlus size={14} strokeWidth={2.5} />
          <span>Add Member</span>
        </button>
      </div>

      {/* COMPACT USERS TABLE (DESKTOP) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
              <th className="py-2 pr-3">Identity</th>
              <th className="py-2 px-3">Role</th>
              <th className="py-2 px-3">Contact</th>
              <th className="py-2 px-3">Privileges</th>
              <th className="py-2 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-sans">
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
              >
                {/* Identity */}
                <td className="py-2.5 pr-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                        u.isAdmin
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10"
                      }`}
                    >
                      {u.isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                        {u.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block truncate">
                        @{u.username}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Role Badge */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {u.isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20">
                      <Shield size={10} fill="currentColor" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10">
                      Standard
                    </span>
                  )}
                </td>

                {/* Contact (Email & Phone) */}
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  <div className="flex flex-col text-[11px] leading-tight">
                    <span className="text-slate-800 dark:text-slate-200">{u.email}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{u.phone || "No phone"}</span>
                  </div>
                </td>

                {/* App Privileges */}
                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.allowedApps?.length > 0 ? (
                      u.allowedApps.map((app) => getAppBadge(app))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No access</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUser(u);
                        setFormData({ ...initialForm, password: "" });
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-colors cursor-pointer"
                      title="Reset Key"
                    >
                      <Key size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfig({ isOpen: true, id: u._id, name: u.name })
                      }
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                      title="Revoke Access"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE COMPACT LIST VIEW */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
        {users.map((u) => (
          <div key={u._id} className="py-3 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border ${
                    u.isAdmin
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-white/10"
                  }`}
                >
                  {u.isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-sans font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {u.name}
                    </span>
                    {u.isAdmin && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-sans font-medium border bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 block truncate">
                    @{u.username} • {u.email}
                  </span>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(u)}
                  className="p-1 text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(u);
                    setFormData({ ...initialForm, password: "" });
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Key"
                >
                  <Key size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfig({ isOpen: true, id: u._id, name: u.name })
                  }
                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                  title="Revoke"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Mobile App Privileges Badges */}
            <div className="flex flex-wrap gap-1 pl-9.5">
              {u.allowedApps?.length > 0 ? (
                u.allowedApps.map((app) => getAppBadge(app))
              ) : (
                <span className="text-[10px] text-slate-400 italic">No applications</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="py-10 text-center text-xs font-sans text-slate-400">
          No personnel recorded. Click "Add Member" to authorize an account.
        </div>
      )}

      {/* CONFIRMATION REVOKE MODAL */}
      <ConfirmationModal
        isOpen={deleteConfig.isOpen}
        onClose={() => setDeleteConfig({ isOpen: false, id: null, name: "" })}
        onConfirm={executeDelete}
        title="Revoke Access"
        message={`Are you sure you want to permanently remove ${deleteConfig.name} from the system? Login access will be terminated immediately.`}
        confirmText="Revoke Member"
        loading={loading}
      />

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <form
            onSubmit={handleSaveUser}
            className="relative w-full max-w-md bg-white dark:bg-[#0B1120] rounded-lg p-5 sm:p-6 shadow-xl border border-slate-200 dark:border-white/10 overflow-y-auto max-h-[90vh] no-scrollbar text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <h3 className="text-base font-serif tracking-tight text-slate-900 dark:text-white">
                {updatingUser ? "Edit" : "New"}{" "}
                <span className="italic font-normal text-emerald-800 dark:text-emerald-400">
                  Member
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="ENTER NAME..."
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-sans uppercase font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Username
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="username"
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-sans font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-600 lowercase"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.toLowerCase().replace(/\s/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="email"
                      required
                      placeholder="name@family.com"
                      className="w-full bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-sans text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      className="w-full bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-sans text-slate-900 dark:text-white outline-none focus:border-emerald-600"
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

              {/* ADMIN ROLE TOGGLE */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-sans font-semibold text-slate-900 dark:text-white block">
                    Administrator Access
                  </span>
                  <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">
                    Grants full system oversight and preference management.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAdmin: !formData.isAdmin })}
                  className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                    formData.isAdmin ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-2xs transition-transform ${
                      formData.isAdmin ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* APPLICATION PRIVILEGES SELECTOR */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                  Application Privileges
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {APP_ENTITLEMENTS.map((app) => {
                    const isSelected = formData.allowedApps?.includes(app.id);
                    const Icon = app.icon;

                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => toggleApp(app.id)}
                        className={`flex items-center justify-between p-2.5 rounded border text-left transition-all cursor-pointer ${
                          isSelected
                            ? app.activeCard
                            : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon size={14} className="shrink-0" />
                          <span className="text-xs font-sans font-medium truncate">
                            {app.label}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${
                            isSelected
                              ? app.checkBg
                              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                          }`}
                        >
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!updatingUser && (
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                    Initial Security Key (Password)
                  </label>
                  <div className="relative">
                    <Fingerprint className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-emerald-600"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white py-2 rounded text-xs font-sans font-semibold tracking-wide transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {loading ? (
                  <Loader2 className="animate-spin mx-auto" size={14} />
                ) : updatingUser ? (
                  "Save Changes"
                ) : (
                  "Authorize Member"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setEditingUser(null)}
          />
          <form
            onSubmit={handlePasswordReset}
            className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-lg p-5 shadow-xl border border-slate-200 dark:border-white/10 text-left"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
              <div>
                <h3 className="text-base font-serif tracking-tight text-slate-900 dark:text-white">
                  Reset <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Key</span>
                </h3>
                <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                  Updating access key for {editingUser.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                  New Security Key
                </label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-900 pl-8 pr-3 py-1.5 rounded border border-slate-200 dark:border-white/10 text-xs font-mono font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 rounded text-xs font-sans font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-sans font-semibold transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {loading ? <Loader2 className="animate-spin" size={13} /> : "Update Key"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManager;