import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Key, X, Shield, Loader2, User, Trash2, Edit3, 
  ShieldCheck
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { toast } from "sonner";

const UserManagement = () => {
  const { request, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); 
  const [updatingUser, setUpdatingUser] = useState(null); 

  const initialForm = { 
    name: "", email: "", username: "", phone: "", password: "",
    isAdmin: false, allowedApps: ["CLIENT_TRACKER"] 
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

  // Fixed: ESLint-compliant effect with cleanup to prevent cascading renders
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
        toast.success("Profile Updated");
      } else {
        await request("/users/register", "POST", formData);
        toast.success("Member Registered");
      }
      closeModals();
      refreshUsers();
    } catch {
      toast.error("Error saving user data");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.password) return toast.error("Enter a new password");
    try {
      await request(`/users/${editingUser._id}/reset-password`, "PATCH", { password: formData.password });
      toast.success("Credentials Reset");
      closeModals();
    } catch (err) {
      toast.error(err.message || "Failed to reset");
    }
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setUpdatingUser(null);
    setFormData(initialForm);
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Revoke access for ${name}?`)) {
      try {
        await request(`/users/${id}`, "DELETE");
        toast.success("Access Revoked");
        refreshUsers();
      } catch {
        toast.error("Failed to revoke access");
      }
    }
  };

  if (loading && users.length === 0) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="min-h-screen bg-white pb-32">
      
      {/* HEADER */}
      <div className="py-12 border-b border-slate-100 mb-12 px-6 md:px-16">
          <h1 className="text-2xl font-bold uppercase tracking-tight text-emerald-900">User Management</h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">Identity & Access Governance</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-16 space-y-12">
        
        {/* PROVISIONING ACTION */}
        <div className="flex justify-end">
            <button
              onClick={() => { setUpdatingUser(null); setFormData(initialForm); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              <UserPlus size={14} /> Provision New Member
            </button>
        </div>

        {/* REGISTRY LIST (COMPACT MOBILE SPACING) */}
        <div className="space-y-2">
           {users.map((u) => (
             <div key={u._id} className="py-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 px-3 md:px-6 rounded-2xl transition-colors gap-2">
                {/* Info Container: Reduced gap and added min-w-0 to prevent truncation pushing out buttons */}
                <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl shrink-0 ${u.isAdmin ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {u.isAdmin ? <Shield size={18} /> : <User size={18} />}
                    </div>
                    <div className="min-w-0 truncate">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{u.name}</h4>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">{u.email}</p>
                    </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-0 shrink-0">
                    <button onClick={() => handleOpenEdit(u)} className="p-2 md:p-3 text-slate-400 hover:text-emerald-600 transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => setEditingUser(u)} className="p-2 md:p-3 text-slate-400 hover:text-emerald-600 transition-colors"><Key size={16} /></button>
                    <button onClick={() => handleDeleteUser(u._id, u.name)} className="p-2 md:p-3 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleSaveUser} className="w-full max-w-lg bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-emerald-900">{updatingUser ? "Edit Profile" : "Register Member"}</h2>
              <button type="button" onClick={closeModals} className="text-slate-400 hover:text-slate-900"><X size={18} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-[8px] font-bold uppercase text-slate-400">Name</label><input required className="w-full border-b border-slate-200 py-2 text-[11px] font-medium uppercase outline-none focus:border-emerald-600" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} /></div>
               <div className="space-y-1"><label className="text-[8px] font-bold uppercase text-slate-400">Username</label><input required className="w-full border-b border-slate-200 py-2 text-[11px] font-medium uppercase outline-none focus:border-emerald-600" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })} /></div>
               <div className="space-y-1"><label className="text-[8px] font-bold uppercase text-slate-400">Email</label><input required className="w-full border-b border-slate-200 py-2 text-[11px] font-medium uppercase outline-none focus:border-emerald-600" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
               <div className="space-y-1"><label className="text-[8px] font-bold uppercase text-slate-400">Phone</label><input className="w-full border-b border-slate-200 py-2 text-[11px] font-medium uppercase outline-none focus:border-emerald-600" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Admin Status</p>
                 <button type="button" onClick={() => setFormData({...formData, isAdmin: !formData.isAdmin})} className={`w-10 h-5 rounded-full transition-colors ${formData.isAdmin ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.isAdmin ? 'translate-x-5' : 'translate-x-1'}`} />
                 </button>
               </div>
               <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Application Access</p>
               <div className="grid grid-cols-2 gap-2">
                 {[ { id: 'CLIENT_TRACKER', label: 'Client App' }, { id: 'EXPENSE_TRACKER', label: 'Expense App' } ].map(app => (
                   <button key={app.id} type="button" onClick={() => toggleApp(app.id)} className={`px-4 py-3 rounded text-[9px] font-bold uppercase transition-colors ${formData.allowedApps?.includes(app.id) ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                     {app.label}
                   </button>
                 ))}
               </div>
            </div>

            {!updatingUser && (
                <div className="space-y-1"><label className="text-[8px] font-bold uppercase text-slate-400">Initial Password</label><input type="password" required className="w-full border-b border-slate-200 py-2 text-[11px] font-medium uppercase outline-none focus:border-emerald-600" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} /></div>
            )}

            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all">Save Profile</button>
          </form>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/80 backdrop-blur-sm">
          <form onSubmit={handleResetPassword} className="w-full max-w-sm bg-white border border-slate-200 p-8 rounded-3xl shadow-2xl text-center">
            <h2 className="text-[11px] font-bold uppercase tracking-widest mb-8 text-emerald-900">Reset Security Key</h2>
            <input type="password" required className="w-full border-b border-slate-200 py-3 text-[11px] font-medium outline-none text-center mb-8" placeholder="NEW PASSWORD" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[11px] font-bold uppercase transition-all">Update Key</button>
            <button type="button" onClick={closeModals} className="w-full py-3 mt-2 text-[10px] font-bold uppercase text-slate-400">Abort</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;