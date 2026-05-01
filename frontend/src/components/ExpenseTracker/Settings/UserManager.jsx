import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Key, X, Shield, Loader2, User, UserCheck, Trash2,
  Mail, Fingerprint, Phone, Edit3, Monitor, Wallet, Check, 
  ShieldCheck, ShieldAlert
} from "lucide-react";
import { useApi } from "../../../hooks/useApi";
import { toast } from "sonner";

const UserManager = () => {
  const { request, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(null);

  const initialForm = {
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    isAdmin: false, // NEW: Default admin state
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

// ... inside UserManager component

  // 1. Keep this strictly for MANUAL refreshes (after Save, Delete, etc.)
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
        if (isMounted) {
          setUsers(data || []);
        }
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
      isAdmin: user.isAdmin || false, // NEW: Hydrate admin status
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
        toast.success("Member Added");
      }
      setIsModalOpen(false);
      setUpdatingUser(null);
      setFormData(initialForm);
      fetchUsers(true);
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
      toast.success("Password Updated");
      setEditingUser(null);
      setFormData(initialForm);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Remove access for ${name}?`)) {
      try {
        await request(`/users/${id}`, "DELETE");
        toast.success("Member Removed");
        fetchUsers(true);
      } catch {
        toast.error("Deletion Failed");
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-left pb-10">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="text-left">
          <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">
            Members
          </h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-3 italic leading-none pt-1">
            Registry & Access
          </p>
        </div>
        <button
          onClick={() => {
            setUpdatingUser(null);
            setFormData(initialForm);
            setIsModalOpen(true);
          }}
          className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <UserPlus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* User List */}
      <div className="grid grid-cols-1 gap-4">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 dark:bg-[#161B22]/50 rounded-4xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-500/30 transition-all gap-4"
          >
            <div className="flex items-center gap-5 text-left">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 transition-all duration-500 ${u.isAdmin ? 'bg-slate-900 dark:bg-emerald-500 text-emerald-500 dark:text-black border-emerald-500/20' : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}>
                {u.isAdmin ? <ShieldCheck size={24} strokeWidth={2.5} /> : <User size={24} />}
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate">
                    {u.name}
                  </p>
                  {u.isAdmin && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 dark:bg-emerald-500 text-white dark:text-black text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Shield size={8} fill="currentColor" /> Admin
                    </span>
                  )}
                  {u.allowedApps?.map((app) => (
                    <span key={app} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[6px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-500/5">
                      {app.split("_")[0]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-[7px] font-black text-slate-400 uppercase tracking-widest">
                    @{u.username}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    {u.phone || "No contact"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleOpenEdit(u)} className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-emerald-500 transition-colors shadow-sm">
                <Edit3 size={18} />
              </button>
              <button onClick={() => setEditingUser(u)} className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-blue-500 transition-colors shadow-sm">
                <Key size={18} />
              </button>
              <button onClick={() => handleDeleteUser(u._id, u.name)} className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-rose-500 transition-colors shadow-sm">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <form
            onSubmit={handleSaveUser}
            className="relative w-full max-w-xl bg-white dark:bg-[#0B1120] rounded-t-[3.5rem] p-10 pb-14 shadow-2xl animate-in slide-in-from-bottom-full duration-500 border-t border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[95vh] text-left"
          >
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-10" />

            <div className="flex justify-between items-start mb-10 text-left">
              <div className="space-y-1.5">
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">
                  {updatingUser ? "Update Profile" : "New Member"}
                </h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic leading-none pt-1">
                  Authorization Protocol
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full active:scale-90">
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name</label>
                  <input required placeholder="ENTER NAME..." className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all uppercase" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
                  <input required placeholder="SET ID..." className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="email" required placeholder="email@office.com" className="w-full bg-slate-50 dark:bg-slate-900 p-6 pl-14 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="tel" placeholder="+91 00000 00000" className="w-full bg-slate-50 dark:bg-slate-900 p-6 pl-14 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })} />
                  </div>
                </div>
              </div>

              {/* ADMIN OVERRIDE TOGGLE */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isAdmin: !formData.isAdmin })}
                  className={`w-full flex items-center justify-between p-6 rounded-[2.2rem] border transition-all ${formData.isAdmin ? 'bg-slate-900 border-emerald-500 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${formData.isAdmin ? 'bg-emerald-500 text-black' : 'bg-white dark:bg-white/5 text-slate-300'}`}>
                      <ShieldAlert size={20} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${formData.isAdmin ? 'text-emerald-500' : 'text-slate-500'}`}>System Administrator</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Grant full registry and manual control</p>
                    </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ${formData.isAdmin ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.isAdmin ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </div>

              {/* TOOL ACCESS */}
              <div className="space-y-4 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Application Privileges</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'CLIENT_TRACKER', label: 'Client Tracker', desc: 'Investment & AUM', icon: Monitor },
                    { id: 'EXPENSE_TRACKER', label: 'Expense App', desc: 'Office & Personal', icon: Wallet }
                  ].map(app => {
                    const isSelected = formData.allowedApps?.includes(app.id);
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => toggleApp(app.id)}
                        className={`relative flex items-center gap-4 p-5 rounded-[2.2rem] border transition-all text-left ${
                          isSelected ? 'bg-emerald-500 border-emerald-500 shadow-xl shadow-emerald-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-white/20 text-white' : 'bg-white dark:bg-white/5 text-slate-400 border border-slate-100 dark:border-white/5'}`}>
                          <app.icon size={20} strokeWidth={isSelected ? 3 : 2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-black uppercase tracking-tight leading-none ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{app.label}</p>
                          <p className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{app.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-white border-white text-emerald-500 scale-110' : 'border-slate-200 dark:border-white/10'}`}>
                          {isSelected && <Check size={14} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!updatingUser && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Master Key</label>
                  <div className="relative">
                    <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="password" required placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-900 p-6 pl-14 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 text-white h-20 rounded-[2.5rem] font-[1000] uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserCheck size={20} strokeWidth={3} /><span>{updatingUser ? "Update Registry" : "Authorize Member"}</span></>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-0">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setEditingUser(null)} />
          <form
            onSubmit={handlePasswordReset}
            className="relative w-full max-w-xl bg-white dark:bg-[#0B1120] rounded-t-[3.5rem] p-10 pb-14 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-500 text-left"
          >
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-10" />
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-1.5 text-left">
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">Security Key</h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic leading-none pt-1">Resetting for {editingUser.name}</p>
              </div>
              <button type="button" onClick={() => setEditingUser(null)} className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full">
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">New Access Key</label>
                <input type="password" required autoFocus placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl text-2xl font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-20 rounded-[2.5rem] font-[1000] uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-98 flex items-center justify-center gap-3 transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <Shield size={20} />}Confirm Protocol Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManager;