import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Key, X, Shield, Loader2, User, Trash2, Edit3, 
  ShieldCheck, AlertTriangle, ShieldAlert, LayoutGrid,
  Users,
  Check
} from "lucide-react";
import { toast } from "sonner";

import { useApi } from '../../../../shared/hooks/useApi';

const UserManagement = () => {
  const { request, loading } = useApi();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null); // For Password Reset
  const [updatingUser, setUpdatingUser] = useState(null); // For Profile Edits
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Custom Delete Modal

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
        toast.success("Profile Updated Successfully");
      } else {
        await request("/users/register", "POST", formData);
        toast.success("New Member Provisioned");
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
      toast.success("Security Key Reset Successfully");
      closeModals();
    } catch (err) {
      toast.error(err.message || "Failed to reset security key");
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await request(`/users/${deleteConfirm.id}`, "DELETE");
      toast.success("User Access Revoked");
      setDeleteConfirm(null);
      refreshUsers();
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setUpdatingUser(null);
    setFormData(initialForm);
  };

  if (loading && users.length === 0) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="w-full pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">User Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Identity & Access Governance</p>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-md p-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-sm font-bold text-slate-600 dark:text-slate-300 px-2 flex items-center gap-2 w-full sm:w-auto">
           <Users size={16} className="text-emerald-600 dark:text-emerald-500" /> 
           Active Personnel: <span className="text-slate-900 dark:text-white">{users.length}</span>
        </div>
        <button
          onClick={() => { setUpdatingUser(null); setFormData(initialForm); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
        >
          <UserPlus size={16} /> Provision User
        </button>
      </div>

      {/* MOBILE VIEW: Stacked Cards (Zero Horizontal Scroll) */}
      <div className="lg:hidden flex flex-col gap-4">
        {users.map((u) => (
          <div key={u._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md p-4 shadow-sm flex flex-col gap-4">
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-10 h-10 flex items-center justify-center rounded-md shrink-0 ${u.isAdmin ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {u.isAdmin ? <User size={18} /> : <User size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">{u.email}</p>
                </div>
              </div>
              
              {/* Access Level Badge */}
              <div className="shrink-0">
                 {u.isAdmin 
                    ? <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 rounded text-[9px] font-bold uppercase tracking-wider">Admin</span>
                    : <span className="px-2 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider">Standard</span>
                 }
              </div>
            </div>

            {/* Allowed Apps Context */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded border border-slate-100 dark:border-white/5 flex flex-wrap gap-1.5">
               {u.allowedApps?.length > 0 ? u.allowedApps.map(app => (
                 <span key={app} className="px-2 py-1 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-sm text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest shadow-sm">
                   {app.replace('_', ' ')}
                 </span>
               )) : <span className="text-[10px] text-slate-400 font-medium italic px-1">No applications assigned</span>}
            </div>

            {/* Mobile Actions Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 mt-1">
              <button onClick={() => handleOpenEdit(u)} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-md transition-colors"><Edit3 size={14}/> Edit</button>
              <button onClick={() => setEditingUser(u)} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-md transition-colors"><Key size={14}/> Keys</button>
              <button onClick={() => setDeleteConfirm({id: u._id, name: u.name})} className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 rounded-md transition-colors"><Trash2 size={14}/> Revoke</button>
            </div>

          </div>
        ))}
      </div>

      {/* DESKTOP VIEW: Structured Data Table */}
      <div className="hidden lg:block bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-225">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-1/3">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-1/6">Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-1/3">App Privileges</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-1/6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-md shrink-0 ${u.isAdmin ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {u.isAdmin ? <User size={18} /> : <User size={18} />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border
                        ${u.isAdmin 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                          : 'bg-slate-50 dark:bg-[#0B1120] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                     >
                        {u.isAdmin ? <ShieldCheck size={12}/> : <User size={12}/>}
                        {u.isAdmin ? 'Admin' : 'Standard'}
                     </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                       {u.allowedApps?.length > 0 ? u.allowedApps.map(app => (
                         <span key={app} className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-sm text-[9px] font-bold uppercase tracking-widest shadow-sm">
                           <LayoutGrid size={10} /> {app.replace('_', ' ')}
                         </span>
                       )) : <span className="text-xs text-slate-400 italic">No access</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenEdit(u)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10 rounded-md transition-colors" title="Edit User">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setEditingUser(u)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-md transition-colors" title="Reset Key">
                        <Key size={16} />
                      </button>
                      <button onClick={() => setDeleteConfirm({id: u._id, name: u.name})} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-md transition-colors" title="Revoke Access">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              
              {users.length === 0 && (
                 <tr>
                   <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <ShieldAlert size={28} className="opacity-30" />
                         <span className="text-sm font-medium">No personnel recorded.</span>
                      </div>
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATION / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleSaveUser} className="w-full max-w-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 p-6 lg:p-8 rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <UserPlus size={18} />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {updatingUser ? "Update Identity Record" : "Provision New Identity"}
                 </h2>
              </div>
              <button type="button" onClick={closeModals} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"><X size={18} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Full Name</label>
                  <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white uppercase outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Username</label>
                  <input required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white lowercase outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })} />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address</label>
                  <input type="email" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number (Opt)</label>
                  <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md px-3 py-2.5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
               </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-white/5 space-y-5 mb-8">
               <div className="flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Superuser Access</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Grants full control over systemic settings and all users.</p>
                 </div>
                 <button type="button" onClick={() => setFormData({...formData, isAdmin: !formData.isAdmin})} className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 ${formData.isAdmin ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${formData.isAdmin ? 'translate-x-6' : 'translate-x-0'}`} />
                 </button>
               </div>
               
               <div className="border-t border-slate-200 dark:border-white/10 pt-4">
                 <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Application Entitlements</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[ { id: 'CLIENT_TRACKER', label: 'Distributor Portal (CRM)' }, { id: 'EXPENSE_TRACKER', label: 'Family Expense Tracker' } ].map(app => {
                      const hasAccess = formData.allowedApps?.includes(app.id);
                      return (
                       <button 
                         key={app.id} 
                         type="button" 
                         onClick={() => toggleApp(app.id)} 
                         className={`flex items-center gap-3 px-4 py-3 rounded-md text-xs font-bold transition-colors border
                           ${hasAccess 
                             ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400' 
                             : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                           }`}
                       >
                         <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${hasAccess ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent'}`}>
                            <Check size={12} strokeWidth={4} />
                         </div>
                         {app.label}
                       </button>
                     )
                   })}
                 </div>
               </div>
            </div>

            {!updatingUser && (
                <div className="space-y-1.5 mb-8">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Initial Security Key (Password)</label>
                  <input type="text" required className="w-full bg-rose-50/50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-md px-3 py-2.5 text-sm font-mono font-bold text-rose-900 dark:text-rose-400 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="button" onClick={closeModals} className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-wider transition-colors">Cancel</button>
              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">Save Identity</button>
            </div>
          </form>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <form onSubmit={handleResetPassword} className="w-full max-w-sm bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 p-6 lg:p-8 rounded-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <Key className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">Reset Security Key</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Enter a new password for <strong className="text-slate-800 dark:text-slate-200">{editingUser.name}</strong>.</p>
            
            <input type="text" required className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-md py-3 px-4 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center mb-6" placeholder="NEW PASSWORD" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={closeModals} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold transition-colors">Cancel</button>
              <button type="submit" className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-bold transition-colors shadow-sm">Update Key</button>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/10 p-6 lg:p-8 rounded-lg w-full max-w-sm text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle className="text-rose-600 dark:text-rose-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2">Revoke Access</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to completely revoke access for <strong className="text-slate-900 dark:text-white">{deleteConfirm.name}</strong>? This user will no longer be able to log in.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-bold transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-bold transition-colors shadow-sm">
                Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;