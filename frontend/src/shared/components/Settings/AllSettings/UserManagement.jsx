import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Key, X, Loader2, User, Trash2, Edit3, 
  ShieldCheck, AlertTriangle, Check, Clapperboard,
  Mail, Phone, Shield, Search, ChevronRight, LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../../hooks/useApi";
import PageHeader from "../../../components/Auth/PageHeader";

const APP_ENTITLEMENTS = [
  { 
    id: "CLIENT_TRACKER", 
    label: "Client Portal",
    subtitle: "CRM & Portfolios",
    icon: LayoutGrid,
    theme: {
      activeBorder: "border-indigo-500/70 dark:border-indigo-500/60",
      activeBg: "bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-950 dark:text-indigo-200",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
      indicator: "bg-indigo-600 dark:bg-indigo-500",
      dot: "bg-indigo-500"
    }
  },
  { 
    id: "EXPENSE_TRACKER", 
    label: "Family Expenses",
    subtitle: "Ledgers & Treasury",
    icon: LayoutGrid,
    theme: {
      activeBorder: "border-emerald-500/70 dark:border-emerald-500/60",
      activeBg: "bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-950 dark:text-emerald-200",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
      indicator: "bg-emerald-600 dark:bg-emerald-500",
      dot: "bg-emerald-500"
    }
  },
  { 
    id: "SHOW_RATER", 
    label: "Show Rater",
    subtitle: "Media & Reviews",
    icon: Clapperboard,
    theme: {
      activeBorder: "border-rose-500/70 dark:border-rose-500/60",
      activeBg: "bg-rose-50/80 dark:bg-rose-500/10 text-rose-950 dark:text-rose-200",
      badge: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
      indicator: "bg-rose-600 dark:bg-rose-500",
      dot: "bg-rose-500"
    }
  }
];

const UserManagement = () => {
  const { request, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null); // For Password Reset
  const [updatingUser, setUpdatingUser] = useState(null); // For Profile Edits
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Custom Delete Modal
  const [activeSheetUser, setActiveSheetUser] = useState(null); // Mobile Drawer

  const initialForm = { 
    name: "", 
    email: "", 
    username: "", 
    phone: "", 
    password: "",
    isAdmin: false, 
    allowedApps: ["CLIENT_TRACKER"] 
  };
  const [formData, setFormData] = useState(initialForm);

  const refreshUsers = useCallback(async () => {
    try {
      const data = await request("/users");
      setUsers(data || []);
    } catch (err) {
      console.error("User Sync Failure", err);
    }
  }, [request]);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      const data = await request("/users");
      if (isMounted) {
        setUsers(data || []);
      }
    };
    loadUsers();
    return () => { isMounted = false; };
  }, [request]);

  const handleOpenEdit = (user) => {
    setUpdatingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone || "",
      isAdmin: user.isAdmin || false,
      allowedApps: user.allowedApps || []
    });
    setIsModalOpen(true);
    setActiveSheetUser(null);
  };

  const toggleApp = (appId) => {
    const current = formData.allowedApps || [];
    const updated = current.includes(appId)
      ? current.filter(a => a !== appId)
      : [...current, appId];
    setFormData({ ...formData, allowedApps: updated });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (updatingUser) {
        await request(`/users/${updatingUser._id}`, "PUT", formData);
        toast.success("User updated successfully");
      } else {
        await request("/users/register", "POST", formData);
        toast.success("User created successfully");
      }
      closeModals();
      refreshUsers();
    } catch {
      toast.error("Could not save user data");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.password) return toast.error("Please enter a new password");
    try {
      await request(`/users/${editingUser._id}/reset-password`, "PATCH", { password: formData.password });
      toast.success("Password updated successfully");
      closeModals();
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await request(`/users/${deleteConfirm.id}`, "DELETE");
      toast.success("User removed successfully");
      setDeleteConfirm(null);
      refreshUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setUpdatingUser(null);
    setFormData(initialForm);
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      (u.phone && u.phone.includes(query))
    );
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-36 text-center">
        <Loader2 className="animate-spin text-emerald-500 mb-3" size={36} />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Directory...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-6 pb-28 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/20">
      
      {/* 1. STANDARDIZED PAGEHEADER */}
      <PageHeader
        title="Users"
        subtitle="Manage member accounts, systemic privileges, and portal permissions."
      />

      {/* 2. DEDICATED TOOLBAR ROW (Search + Add Button + Live Counts) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1.5 rounded-lg bg-slate-100/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Total: <strong className="text-slate-900 dark:text-white font-mono">{users.length}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Admins: <strong className="text-slate-900 dark:text-white font-mono">{users.filter(u => u.isAdmin).length}</strong></span>
            </div>
          </div>

          <button
            onClick={() => { setUpdatingUser(null); setFormData(initialForm); setIsModalOpen(true); }}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <UserPlus size={15} strokeWidth={2.4} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE VIEW: Native Directory List (Line Separators)                  */}
      {/* ========================================================================= */}
      <div className="lg:hidden divide-y divide-slate-200 dark:divide-white/10 border-t border-b border-slate-200 dark:border-white/10">
        {filteredUsers.map((u) => (
          <div
            key={u._id}
            onClick={() => setActiveSheetUser(u)}
            className="py-3.5 px-2 flex items-center justify-between gap-3 active:bg-slate-50 dark:active:bg-slate-900/60 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                u.isAdmin 
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" 
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              }`}>
                {u.name ? u.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {u.name}
                  </span>
                  {u.isAdmin ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      • Admin
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 uppercase">
                      • Standard
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">@{u.username}</span>
                  <span>•</span>
                  <span className="truncate">{u.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center -space-x-1">
                {u.allowedApps?.map((appKey) => {
                  const app = APP_ENTITLEMENTS.find((a) => a.id === appKey);
                  return (
                    <span
                      key={appKey}
                      className={`w-2 h-2 rounded-full border border-white dark:border-[#07090E] ${
                        app ? app.theme.dot : "bg-slate-400"
                      }`}
                      title={app?.label}
                    />
                  );
                })}
              </div>
              <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="py-14 text-center text-xs text-slate-400 font-medium">
            No users found matching your search.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DESKTOP VIEW: High-Impact Enterprise Ledger Table                     */}
      {/* ========================================================================= */}
      <div className="hidden lg:block bg-white dark:bg-[#0E1626] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-4 px-6 w-1/4">User Profile</th>
              <th className="py-4 px-6 w-1/4">Contact Information</th>
              <th className="py-4 px-6 w-1/6">Role & Status</th>
              <th className="py-4 px-6 w-1/4">Application Entitlements</th>
              <th className="py-4 px-6 text-right w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
            {filteredUsers.map((u) => (
              <tr 
                key={u._id} 
                className="hover:bg-slate-50/80 dark:hover:bg-white/[0.015] transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                      u.isAdmin 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-white/10"
                    }`}>
                      {u.name ? u.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {u.name}
                      </div>
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                        @{u.username}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-6">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {u.email}
                    </div>
                    {u.phone ? (
                      <div className="text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        {u.phone}
                      </div>
                    ) : (
                      <div className="text-slate-400/60 dark:text-slate-500/50 mt-0.5 italic">
                        No phone added
                      </div>
                    )}
                  </div>
                </td>

                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                    u.isAdmin 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                      : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10"
                  }`}>
                    {u.isAdmin ? <ShieldCheck size={13} strokeWidth={2.4} /> : <User size={13} strokeWidth={2.4} />}
                    {u.isAdmin ? "Administrator" : "Standard"}
                  </span>
                </td>

                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1.5">
                    {u.allowedApps?.length > 0 ? (
                      u.allowedApps.map((appKey) => {
                        const app = APP_ENTITLEMENTS.find((a) => a.id === appKey);
                        return (
                          <span 
                            key={appKey} 
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                              app ? app.theme.badge : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {app?.label || appKey.replace("_", " ")}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">No apps assigned</span>
                    )}
                  </div>
                </td>

                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleOpenEdit(u)} 
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Edit User"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => setEditingUser(u)} 
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Reset Password"
                    >
                      <Key size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm({ id: u._id, name: u.name })} 
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="py-16 text-center text-xs text-slate-400">
                  No users found matching your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* 5. MOBILE ACTION SHEET (Tap User to Open)                                 */}
      {/* ========================================================================= */}
      {activeSheetUser && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setActiveSheetUser(null)} />
          
          <div className="relative z-10 w-full bg-white dark:bg-[#0E1626] border-t border-slate-200 dark:border-white/10 rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85dvh] overflow-y-auto">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  activeSheetUser.isAdmin 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-white/10"
                }`}>
                  {activeSheetUser.name ? activeSheetUser.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {activeSheetUser.name}
                  </h3>
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    @{activeSheetUser.username}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setActiveSheetUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Email:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeSheetUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Phone:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeSheetUser.phone || "Not provided"}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Role:</span>
                <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                  activeSheetUser.isAdmin ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}>
                  {activeSheetUser.isAdmin ? "Administrator" : "Standard"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Application Privileges
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeSheetUser.allowedApps?.length > 0 ? (
                  activeSheetUser.allowedApps.map((appKey) => {
                    const app = APP_ENTITLEMENTS.find((a) => a.id === appKey);
                    return (
                      <span 
                        key={appKey} 
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          app ? app.theme.badge : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {app?.label || appKey.replace("_", " ")}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400 italic">No apps assigned</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => handleOpenEdit(activeSheetUser)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} /> Edit
              </button>
              <button 
                onClick={() => { setEditingUser(activeSheetUser); setActiveSheetUser(null); }}
                className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key size={14} /> Password
              </button>
              <button 
                onClick={() => { setDeleteConfirm({ id: activeSheetUser._id, name: activeSheetUser.name }); setActiveSheetUser(null); }}
                className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: ADD / EDIT USER (Bottom-Sheet on Mobile, Centered on Desktop)    */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={closeModals} />
          
          <form 
            onSubmit={handleSaveUser} 
            className="relative z-10 w-full sm:max-w-xl bg-white dark:bg-[#0E1626] border-t sm:border border-slate-200/90 dark:border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh] overflow-hidden"
          >
            {/* Modal Header: Pinned at top */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 shrink-0 bg-white dark:bg-[#0E1626]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <UserPlus size={17} strokeWidth={2.4} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {updatingUser ? "Edit User" : "Add User"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {updatingUser ? "Update profile details and permissions" : "Create a new user account"}
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={closeModals} 
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    placeholder="e.g. johndoe"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white lowercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
                    value={formData.username} 
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g. john@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Phone (Optional)
                  </label>
                  <input 
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>
              </div>

              {/* Admin Switch */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Shield size={16} strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Admin Privileges</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Can manage users, roles, and master settings.</p>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setFormData({ ...formData, isAdmin: !formData.isAdmin })} 
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                    formData.isAdmin ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span 
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      formData.isAdmin ? "translate-x-5" : "translate-x-0"
                    }`} 
                  />
                </button>
              </div>

              {/* Application Entitlements Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Application Access
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {APP_ENTITLEMENTS.map((app) => {
                    const hasAccess = formData.allowedApps?.includes(app.id);
                    const Icon = app.icon;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => toggleApp(app.id)}
                        className={`flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          hasAccess
                            ? `${app.theme.activeBorder} ${app.theme.activeBg}`
                            : "border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <Icon size={16} />
                          <div className={`w-4 h-4 rounded flex items-center justify-center border text-white ${
                            hasAccess ? `${app.theme.indicator} border-transparent` : "border-slate-300 dark:border-slate-600"
                          }`}>
                            {hasAccess && <Check size={11} strokeWidth={3} />}
                          </div>
                        </div>
                        <span className="text-xs font-bold leading-tight">
                          {app.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {app.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Initial Password (New Users Only) */}
              {!updatingUser && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Set an initial password"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  />
                </div>
              )}
            </div>

            {/* Modal Footer: Pinned at bottom */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <button 
                type="button" 
                onClick={closeModals} 
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {updatingUser ? "Save Changes" : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: PASSWORD RESET                                                  */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-150">
          <div onClick={closeModals} className="fixed inset-0" />
          
          <form 
            onSubmit={handleResetPassword} 
            className="relative z-10 w-full sm:max-w-sm bg-white dark:bg-[#0E1626] border-t sm:border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-center"
          >
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
              <Key size={22} strokeWidth={2.4} />
            </div>
            
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Enter a new password for <strong className="text-slate-800 dark:text-slate-200">{editingUser.name}</strong>.
            </p>
            
            <input 
              type="text" 
              required 
              placeholder="Enter new password"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-center font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 mb-5" 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
            />
            
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                type="button" 
                onClick={closeModals} 
                className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: DELETE CONFIRMATION                                             */}
      {/* ========================================================================= */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-150">
          <div onClick={() => setDeleteConfirm(null)} className="fixed inset-0" />
          
          <div className="relative z-10 w-full sm:max-w-sm bg-white dark:bg-[#0E1626] border-t sm:border border-slate-200 dark:border-white/10 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle size={22} strokeWidth={2.4} />
            </div>
            
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Delete User?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 mb-5">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirm.name}</strong>? They will immediately lose access to all portals.
            </p>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete} 
                className="py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
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

export default UserManagement;