import React, { useState, useEffect, useCallback } from "react";
import {
  UserPlus,
  Key,
  X,
  Shield,
  Loader2,
  User,
  UserCheck,
  Trash2,
  Mail,
  Fingerprint,
  Phone,
  Edit3,
  Save,
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
  };
  const [formData, setFormData] = useState(initialForm);

  // --- PHONE FORMATTER ---
  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const len = phoneNumber.length;
    if (len <= 2) return `+${phoneNumber}`;
    if (len <= 7) return `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2)}`;
    return `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 7)} ${phoneNumber.slice(7, 12)}`;
  };

  const fetchUsers = useCallback(
    async (isMounted) => {
      try {
        const data = await request("/users");
        if (isMounted) setUsers(data || []);
      } catch (err) {
        console.error("Sync Failure", err);
      }
    },
    [request],
  );

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      await fetchUsers(isMounted);
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchUsers]);

  const handleOpenEdit = (user) => {
    setUpdatingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      phone: user.phone || "+91 ",
    });
    setIsModalOpen(true);
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
    } catch (err) {
      toast.error("Operation failed", { description: err.message });
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

  // --- RESTORED DELETE LOGIC ---
  const handleDeleteUser = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${name} from the family hub?`,
      )
    ) {
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
    <div className="space-y-10 animate-in fade-in duration-500 text-left">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="text-left">
          <h3 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">
            Members
          </h3>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mt-3 italic leading-none">
            Manage family access
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
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0">
                <User size={24} />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none truncate">
                    {u.name}
                  </p>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/5 text-[7px] font-black text-slate-400 uppercase tracking-widest">
                    @{u.username}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {u.phone || "No phone number"}
                </p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {/* EDIT BUTTON */}
              <button
                onClick={() => handleOpenEdit(u)}
                className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-emerald-500 transition-colors"
              >
                <Edit3 size={18} />
              </button>

              {/* PASSWORD BUTTON */}
              <button
                onClick={() => setEditingUser(u)}
                className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-blue-500 transition-colors"
              >
                <Key size={18} />
              </button>

              {/* RESTORED DELETE BUTTON */}
              <button
                onClick={() => handleDeleteUser(u._id, u.name)}
                className="p-3.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL FOR ADD/EDIT (Same as before with formatting) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-0">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <form
            onSubmit={handleSaveUser}
            className="relative w-full max-w-xl bg-white dark:bg-[#0B1120] rounded-t-[3.5rem] p-10 pb-14 shadow-2xl animate-in slide-in-from-bottom-full duration-500 border-t border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[95vh]"
          >
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-10" />

            <div className="flex justify-between items-start mb-10 text-left">
              <div className="space-y-1.5 text-left">
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">
                  {updatingUser ? "Edit Profile" : "Add Member"}
                </h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic leading-none pt-1">
                  Member Configuration
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-6 text-left">
              {/* Inputs with simplified language and formatting */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DISPLAY NAME"
                    className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="USERNAME"
                    className="w-full bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />
                    <input
                      type="email"
                      required
                      placeholder="email@domain.com"
                      className="w-full bg-slate-50 dark:bg-slate-900 p-6 pl-14 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      className="w-full bg-slate-50 dark:bg-slate-900 p-6 pl-14 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all"
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

              {!updatingUser && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">
                    Password
                  </label>
                  <div className="relative">
                    <Fingerprint
                      className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"
                      size={18}
                    />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-900 p-6 pl-14 rounded-3xl text-xs font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30 transition-all"
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
                className="w-full bg-emerald-500 text-white h-20 rounded-[2.5rem] font-[1000] uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 mt-4"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <UserCheck size={20} strokeWidth={3} />
                    <span>{updatingUser ? "Save Profile" : "Add Member"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- PASSWORD MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-0">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setEditingUser(null)}
          />
          <form
            onSubmit={handlePasswordReset}
            className="relative w-full max-w-xl bg-white dark:bg-[#0B1120] rounded-t-[3.5rem] p-10 pb-14 shadow-2xl border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-full duration-500"
          >
            {/* Modal content same as before... */}
            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-10" />
            <div className="flex justify-between items-start mb-10 text-left">
              <div className="space-y-1.5">
                <h2 className="text-3xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none pt-1">
                  New Key
                </h2>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] italic leading-none pt-1">
                  Resetting for {editingUser.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-3.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full active:scale-90 transition-transform"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            <div className="space-y-8 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl text-2xl font-black text-slate-900 dark:text-white outline-none border border-slate-100 dark:border-slate-800 focus:border-emerald-500/30"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-20 rounded-[2.5rem] font-[1000] uppercase text-xs tracking-[0.5em] shadow-2xl active:scale-98 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Shield size={20} />
                )}
                Confirm Reset
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManager;
