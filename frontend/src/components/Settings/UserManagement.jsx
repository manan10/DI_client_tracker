import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Key, X, Shield, Loader2, User, Trash2, Edit3, 
  Check, Monitor, Wallet, ShieldCheck, ShieldAlert,
  Fingerprint, Mail, Phone
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
    name: "", 
    email: "", 
    username: "", 
    phone: "", 
    password: "",
    isAdmin: false, // NEW: Default admin state
    allowedApps: ["CLIENT_TRACKER"] 
  };
  const [formData, setFormData] = useState(initialForm);

// ... inside UserManagement component

  // 1. Keep this for manual refreshes (Delete, Update, Create)
  const refreshUsers = useCallback(async () => {
    try {
      const data = await request("/users");
      setUsers(data || []);
    } catch (err) {
      console.error("User Sync Failure", err);
    }
  }, [request]);

  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      try {
        const data = await request("/users");
        if (mounted) {
          setUsers(data || []);
        }
      } catch (err) {
        console.error("Initial Load Failure", err);
      }
    };

    loadInitialData();

    return () => { mounted = false; };
  }, [request]);


  const handleOpenEdit = (user) => {
    setUpdatingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone || "",
      isAdmin: user.isAdmin || false, // NEW: Hydrate from user data
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
        toast.success("User profile updated");
      } else {
        await request("/users/register", "POST", formData);
        toast.success("New member registered");
      }
      setIsModalOpen(false);
      setUpdatingUser(null);
      setFormData(initialForm);
      refreshUsers();
    } catch {
      toast.error("Error saving user data");
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Remove access for ${name}?`)) {
      try {
        await request(`/users/${id}`, "DELETE");
        toast.success("User deleted");
        refreshUsers();
      } catch {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left pb-10">
      
      {/* HEADER */}
      <div>
        <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
          User <span className="text-emerald-500">Registry</span>
        </h3>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-3">
          Member Access Control
        </p>
      </div>

      {/* REGISTRATION BAR */}
      <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="flex-1 bg-slate-50/50 dark:bg-black/20 rounded-xl px-6 py-4 flex flex-col justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Status Overview</span>
          <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
            {users.length} <span className="text-emerald-500">Authorized Members</span>
          </p>
        </div>
        <button
          onClick={() => { setUpdatingUser(null); setFormData(initialForm); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <UserPlus size={18} strokeWidth={3} />
          Register Member
        </button>
      </div>

      {/* USER LIST */}
      <div className="grid grid-cols-1 gap-4">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between p-6 md:p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2.5rem] hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner transition-colors duration-500 ${u.isAdmin ? 'bg-slate-950 dark:bg-emerald-500 text-emerald-500 dark:text-black border-emerald-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20'}`}>
                {u.isAdmin ? <ShieldCheck size={28} strokeWidth={2} /> : <User size={28} strokeWidth={1.5} />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                    {u.name}
                  </h4>
                  {u.isAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-emerald-500 text-white dark:text-black text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Shield size={8} fill="currentColor" /> System Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {u.allowedApps?.map(app => (
                    <span key={app} className="px-2 py-0.5 rounded bg-emerald-500/10 text-[8px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-500/10">
                      {app.replace('_', ' ')}
                    </span>
                  ))}
                  <span className="text-slate-300 dark:text-slate-700 text-xs px-1">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {u.email}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenEdit(u)} className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-xl transition-all"><Edit3 size={20} /></button>
              <button onClick={() => setEditingUser(u)} className="p-3 text-slate-400 hover:text-blue-500 hover:bg-blue-500/5 rounded-xl transition-all"><Key size={20} /></button>
              <button onClick={() => handleDeleteUser(u._id, u.name)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSaveUser} className="relative w-full max-w-xl bg-white dark:bg-[#0B1120] rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-white/5 animate-in zoom-in-95 duration-300 text-left">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">
                  {updatingUser ? "Edit Profile" : "Provision User"}
                </h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-3 leading-none pt-1 font-mono">
                  Identity Protocol
                </p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-full active:scale-90"><X size={24} /></button>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">Full Name</label>
                    <input required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black uppercase outline-none focus:border-emerald-500/30 transition-all" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">Username</label>
                    <input required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black outline-none focus:border-emerald-500/30 transition-all" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })} />
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">Email Address</label>
                   <input type="email" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black outline-none focus:border-emerald-500/30 transition-all" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">Contact Phone</label>
                   <input className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black outline-none focus:border-emerald-500/30 transition-all" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                 </div>
               </div>

               {/* ADMIN TOGGLE - NEW HIGH-LEVEL OVERRIDE */}
               <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                 <button
                   type="button"
                   onClick={() => setFormData({ ...formData, isAdmin: !formData.isAdmin })}
                   className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${formData.isAdmin ? 'bg-slate-900 border-emerald-500 shadow-xl' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'}`}
                 >
                   <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-2xl ${formData.isAdmin ? 'bg-emerald-500 text-black' : 'bg-slate-200 dark:bg-white/10 text-slate-400'}`}>
                       <Shield size={20} strokeWidth={3} />
                     </div>
                     <div className="text-left">
                       <p className={`text-[11px] font-black uppercase tracking-widest ${formData.isAdmin ? 'text-emerald-500' : 'text-slate-500'}`}>Administrator Status</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Full System Overrides & Registry Control</p>
                     </div>
                   </div>
                   <div className={`w-12 h-7 rounded-full relative transition-colors duration-500 ${formData.isAdmin ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                     <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${formData.isAdmin ? 'left-6' : 'left-1'}`} />
                   </div>
                 </button>
               </div>

               {/* APP ACCESS SECTION */}
               <div className="space-y-4 pt-4">
                 <div className="flex flex-col gap-1 ml-1 text-left">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] font-mono">
                     Application Access Control
                   </label>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {[
                     { id: 'CLIENT_TRACKER', label: 'Client App', desc: 'Investment/AUM', icon: Monitor },
                     { id: 'EXPENSE_TRACKER', label: 'Expense App', desc: 'Office Spends', icon: Wallet }
                   ].map(app => {
                     const isSelected = formData.allowedApps?.includes(app.id);
                     return (
                       <button
                         key={app.id}
                         type="button"
                         onClick={() => toggleApp(app.id)}
                         className={`relative flex items-center gap-4 p-5 rounded-4xl border transition-all text-left ${
                           isSelected
                             ? 'bg-emerald-500 border-emerald-500 shadow-xl shadow-emerald-500/20'
                             : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'
                         }`}
                       >
                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                           isSelected ? 'bg-white/20 text-white' : 'bg-white dark:bg-white/5 text-slate-400 border border-slate-100 dark:border-white/5'
                         }`}>
                           <app.icon size={20} strokeWidth={isSelected ? 3 : 2} />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className={`text-[11px] font-black uppercase tracking-tight leading-none ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                             {app.label}
                           </p>
                           <p className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                             {app.desc}
                           </p>
                         </div>
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                           isSelected ? 'bg-white border-white text-emerald-500 scale-110' : 'border-slate-200 dark:border-white/10'
                         }`}>
                           {isSelected && <Check size={14} strokeWidth={4} />}
                         </div>
                       </button>
                     );
                   })}
                 </div>
               </div>

               {!updatingUser && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 font-mono">Set Initial Password</label>
                    <input type="password" required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black outline-none focus:border-emerald-500/30 transition-all" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
               )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white h-20 rounded-3xl font-[1000] uppercase text-xs tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-8">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} strokeWidth={4} /> {updatingUser ? "Confirm Profile Update" : "Finalize Member Setup"}</>}
            </button>
          </form>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setEditingUser(null)} />
          <form onSubmit={handleSaveUser} className="relative w-full max-w-sm bg-white dark:bg-[#0B1120] rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-white/5 text-center animate-in zoom-in-95 duration-300">
            <Shield size={48} className="mx-auto text-blue-500 mb-6" />
            <h2 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic">Reset <span className="text-blue-500">Credentials</span></h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-8 leading-relaxed">Updating security key for <br/> {editingUser.name}</p>
            <input type="password" required autoFocus className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-xs font-black outline-none focus:border-blue-500/30 transition-all text-center" placeholder="NEW MASTER KEY" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-16 rounded-2xl font-[1000] uppercase text-[10px] tracking-[0.2em] mt-6 active:scale-95 transition-all">Update Security Key</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;