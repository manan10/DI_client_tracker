import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Globe,
  Link2,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Building2,
  Tag,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Layers,
  ChevronDown,
  Check,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";
import { SECTIONS } from "./vaultConstants";

const AddDocumentModal = ({
  isOpen,
  onClose,
  folders,
  formState,
  setFormState,
  onSubmit,
  isEditing = false,
  loading = false,
}) => {
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle outside clicks to close the custom dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFolderDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filter folders based on current selected category
  const availableFolders = folders.filter((f) => f.section === formState.section);
  const currentSelectedFolder = folders.find((f) => String(f.id) === String(formState.folderId));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none">
      {/* Dark backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside className="w-screen max-w-xl bg-white dark:bg-[#080D1A] border-l-2 border-slate-200 dark:border-white/10 shadow-2xl flex flex-col justify-between text-left animate-in slide-in-from-right duration-300">
          
          {/* 1. TOP BANNER */}
          <header className="px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/2 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-sm ${
                  isEditing
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}
              >
                {isEditing ? <RefreshCw size={20} strokeWidth={2.5} /> : <FileSpreadsheet size={20} strokeWidth={2.5} />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${
                      isEditing
                        ? "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 border-amber-300 dark:border-amber-500/40"
                        : "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40"
                    }`}
                  >
                    {isEditing ? "Update Existing" : "Add New"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Forms Vault
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-[1000] uppercase tracking-tight text-slate-900 dark:text-white truncate mt-0.5">
                  {isEditing ? "Edit Form Links" : "Add an Official Form"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              aria-label="Close Drawer"
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </header>

          {/* 2. SCROLLABLE FORM BODY */}
          <form
            id="add-document-drawer-form"
            onSubmit={onSubmit}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          >
            
            {/* BOX 1: INSTITUTION & FOLDER SELECTION */}
            <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/10 border-2 border-indigo-200/70 dark:border-indigo-500/20">
              <div className="flex items-center gap-2 pb-1 border-b border-indigo-100 dark:border-indigo-500/10">
                <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-300">
                  Where does this form belong?
                </h3>
              </div>

              {/* Step A: Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Type of Institution <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SECTIONS.map((sec) => {
                    const isSelected = formState.section === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          const firstFolderInSec = folders.find((f) => f.section === sec.id);
                          setFormState((prev) => ({
                            ...prev,
                            section: sec.id,
                            folderId: firstFolderInSec ? firstFolderInSec.id : "",
                          }));
                          setIsFolderDropdownOpen(false);
                        }}
                        className={`cursor-pointer py-2.5 px-3 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/25"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-500/40"
                        }`}
                      >
                        <Layers size={14} className={isSelected ? "text-white" : "opacity-40"} />
                        <span>{sec.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step B: Custom-Styled Dropdown Popover */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Which Company or Bank? <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {availableFolders.length} Folders Found
                  </span>
                </label>

                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-150 outline-none cursor-pointer bg-white dark:bg-slate-900 ${
                    isFolderDropdownOpen
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 shadow-md"
                      : "border-slate-300 dark:border-white/15 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/60 dark:border-indigo-500/20">
                      <FolderOpen size={16} />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {currentSelectedFolder ? currentSelectedFolder.name : "Select Folder..."}
                    </span>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      isFolderDropdownOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Options Menu */}
                {isFolderDropdownOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-xl border-2 border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-[#0F172A] shadow-2xl overflow-hidden p-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                    {availableFolders.length > 0 ? (
                      availableFolders.map((folder) => {
                        const isCurrent = String(folder.id) === String(formState.folderId);
                        return (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => {
                              setFormState((prev) => ({ ...prev, folderId: folder.id }));
                              setIsFolderDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all mb-0.5 last:mb-0 cursor-pointer ${
                              isCurrent
                                ? "bg-indigo-600 text-white font-black shadow-xs"
                                : "hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-900 dark:text-slate-100 font-bold"
                            }`}
                          >
                            <span className="text-xs uppercase tracking-tight truncate pr-2">
                              📁 {folder.name}
                            </span>
                            {isCurrent && <Check size={14} className="text-white shrink-0" strokeWidth={3} />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">
                        No folders in this category
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* BOX 2: FORM TITLE & IDENTIFICATION */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/2 border-2 border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200/80 dark:border-white/10">
                <FileText size={16} className="text-slate-700 dark:text-slate-300" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Form Name & Code
                </h3>
              </div>

              {/* Form Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  What is the name of this form? <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Change of Bank Mandate Form"
                  value={formState.title || ""}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 shadow-xs"
                />
              </div>

              {/* Form Code & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Form Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC-COB-01"
                    value={formState.code || ""}
                    onChange={(e) =>
                      setFormState({ ...formState, code: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs font-mono font-black uppercase text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Keywords / Tags
                  </label>
                  <div className="relative">
                    <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Bank, OTM, SIP..."
                      value={
                        Array.isArray(formState.tags)
                          ? formState.tags.join(", ")
                          : formState.tags || ""
                      }
                      onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/15 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOX 3: LINKS (VIBRANT EMERALD & AMBER PATHWAYS) */}
            <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/10 border-2 border-emerald-200/70 dark:border-emerald-500/20">
              <div className="flex items-center gap-2 pb-1 border-b border-emerald-100 dark:border-emerald-500/10">
                <Link2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-300">
                  Online Links
                </h3>
              </div>

              {/* Direct Official PDF URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Direct Form Link</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 uppercase bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                    Main Download Link
                  </span>
                </div>

                <div className="relative">
                  <Link2
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    required
                    type="text"
                    placeholder="https://www.hdfcfund.com/downloads/bank-mandate.pdf"
                    value={formState.officialUrl || ""}
                    onChange={(e) => setFormState({ ...formState, officialUrl: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 shadow-xs"
                  />
                </div>
              </div>

              {/* Fallback Downloads Page URL */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1">
                    <span>Backup Downloads Page</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 uppercase bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30">
                    If Link Breaks
                  </span>
                </div>

                <div className="relative">
                  <ExternalLink
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="https://www.hdfcfund.com/forms-center"
                    value={formState.fallbackUrl || ""}
                    onChange={(e) => setFormState({ ...formState, fallbackUrl: e.target.value })}
                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400 shadow-xs"
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight pt-0.5">
                  If the direct link stops working later, staff can open this page to find the new form directly.
                </p>
              </div>
            </div>

            {/* BOX 4: INSTRUCTIONS & PAPERS REQUIRED */}
            <div className="space-y-2 p-5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/10 border-2 border-blue-200/70 dark:border-blue-500/20">
              <div className="flex items-center gap-2 pb-1 border-b border-blue-100 dark:border-blue-500/10">
                <HelpCircle size={16} className="text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-950 dark:text-blue-300">
                  Required Papers & Office Notes
                </h3>
              </div>
              
              <textarea
                rows={3}
                placeholder="e.g. Client must attach an original cancelled cheque with their printed name, or 3 months bank statement attested by the branch manager."
                value={formState.description || ""}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                className="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-white/15 rounded-xl p-3.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 resize-none shadow-xs"
              />
            </div>

          </form>

          {/* 3. PINNED FOOTER ACTIONS */}
          <footer className="px-6 py-4 border-t-2 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1424] flex items-center justify-between gap-4 shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-6 py-3.5 rounded-xl border-2 border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="add-document-drawer-form"
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg active:scale-[0.99] cursor-pointer transition-all disabled:opacity-50 ${
                isEditing
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
              }`}
            >
              {isEditing ? (
                <>
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} strokeWidth={2.5} />
                  <span>Save Updated Form</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                  <span>Save Form to Vault</span>
                </>
              )}
            </button>
          </footer>

        </aside>
      </div>
    </div>
  );
};

export default AddDocumentModal;