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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* Dark backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <aside className="w-screen max-w-xl bg-slate-50 dark:bg-[#131720] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between text-left animate-in slide-in-from-right duration-300">

          {/* 1. TOP BANNER */}
          <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26] flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`p-2 rounded-lg flex items-center justify-center shrink-0 border ${
                  isEditing
                    ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-500/25"
                    : "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-500/25"
                }`}
              >
                {isEditing ? <RefreshCw size={18} strokeWidth={2.2} /> : <FileSpreadsheet size={18} strokeWidth={2.2} />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md border ${
                      isEditing
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30"
                        : "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/30"
                    }`}
                  >
                    {isEditing ? "Update Existing" : "Add New"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Forms Vault
                  </span>
                </div>

                <h2 className="sora-font text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {isEditing ? (
                    <>
                      Edit{" "}
                      <span className="font-normal text-sky-600 dark:text-sky-300">
                        Form Links
                      </span>
                    </>
                  ) : (
                    <>
                      Add{" "}
                      <span className="font-normal text-sky-600 dark:text-sky-300">
                        Official Form
                      </span>
                    </>
                  )}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close Drawer"
            >
              <X size={18} strokeWidth={2.2} />
            </button>
          </header>

          {/* 2. SCROLLABLE FORM BODY */}
          <form
            id="add-document-drawer-form"
            onSubmit={onSubmit}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          >

            {/* BOX 1: INSTITUTION & FOLDER SELECTION */}
            <div className="space-y-4 p-4 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <Building2 size={15} className="text-sky-600 dark:text-sky-400" />
                <h3 className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                  Where does this form belong?
                </h3>
              </div>

              {/* Step A: Category Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                        className={`cursor-pointer py-2 px-3 rounded-lg border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-sky-600 border-sky-600 text-white"
                            : "bg-slate-50 dark:bg-[#1C2230] border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <Layers size={13} className={isSelected ? "text-white" : "opacity-50"} />
                        <span>{sec.name.split(" ")[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step B: Custom-Styled Dropdown Popover */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Which Company or Bank? <span className="text-rose-500">*</span></span>
                  <span className="text-[11px] font-mono text-sky-600 dark:text-sky-300">
                    {availableFolders.length} Folders
                  </span>
                </label>

                {/* Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsFolderDropdownOpen(!isFolderDropdownOpen)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-colors outline-none cursor-pointer bg-slate-50 dark:bg-[#1C2230] ${
                    isFolderDropdownOpen
                      ? "border-sky-500 ring-2 ring-sky-500/15"
                      : "border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-500/25">
                      <FolderOpen size={15} />
                    </div>
                    <span className="sora-font text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {currentSelectedFolder ? currentSelectedFolder.name : "Select Folder..."}
                    </span>
                  </div>

                  <ChevronDown
                    size={15}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                      isFolderDropdownOpen ? "rotate-180 text-sky-600 dark:text-sky-400" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Options Menu */}
                {isFolderDropdownOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C2230] shadow-xl overflow-hidden p-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
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
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors mb-0.5 last:mb-0 cursor-pointer ${
                              isCurrent
                                ? "bg-sky-600 text-white font-semibold"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                            }`}
                          >
                            <span className="text-xs truncate pr-2">
                              {folder.name}
                            </span>
                            {isCurrent && <Check size={14} className="text-white shrink-0" strokeWidth={2.5} />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                        No folders in this category
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* BOX 2: FORM TITLE & IDENTIFICATION */}
            <div className="space-y-4 p-4 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <FileText size={15} className="text-sky-600 dark:text-sky-400" />
                <h3 className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                  Form Name & Code
                </h3>
              </div>

              {/* Form Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Form Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Change of Bank Mandate Form"
                  value={formState.title || ""}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                />
              </div>

              {/* Form Code & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Form Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC-COB-01"
                    value={formState.code || ""}
                    onChange={(e) =>
                      setFormState({ ...formState, code: e.target.value.toUpperCase() })
                    }
                    className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs font-mono font-semibold uppercase text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] placeholder:normal-case placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                      className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* BOX 3: LINKS */}
            <div className="space-y-4 p-4 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <Link2 size={15} className="text-sky-600 dark:text-sky-400" />
                <h3 className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                  Online Links
                </h3>
              </div>

              {/* Direct Official PDF URL */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span>Direct Form Link</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-mono font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-200/80 dark:border-sky-500/25">
                    Main Download
                  </span>
                </div>

                <div className="relative">
                  <Link2
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    required
                    type="text"
                    placeholder="https://www.hdfcfund.com/downloads/bank-mandate.pdf"
                    value={formState.officialUrl || ""}
                    onChange={(e) => setFormState({ ...formState, officialUrl: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                  />
                </div>
              </div>

              {/* Fallback Downloads Page URL */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Backup Downloads Page
                  </label>
                  <span className="text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-200/80 dark:border-amber-500/25">
                    If Link Breaks
                  </span>
                </div>

                <div className="relative">
                  <ExternalLink
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="https://www.hdfcfund.com/forms-center"
                    value={formState.fallbackUrl || ""}
                    onChange={(e) => setFormState({ ...formState, fallbackUrl: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-amber-500 focus:bg-white dark:focus:bg-[#1C2230] placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight pt-0.5">
                  If the direct link stops working later, staff can open this page to find the new form directly.
                </p>
              </div>
            </div>

            {/* BOX 4: INSTRUCTIONS & PAPERS REQUIRED */}
            <div className="space-y-2.5 p-4 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <HelpCircle size={15} className="text-sky-600 dark:text-sky-400" />
                <h3 className="sora-font text-xs font-bold text-slate-900 dark:text-white">
                  Required Papers & Office Notes
                </h3>
              </div>

              <textarea
                rows={3}
                placeholder="e.g. Client must attach an original cancelled cheque with their printed name, or 3 months bank statement attested by the branch manager."
                value={formState.description || ""}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[#1C2230] placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none transition-colors"
              />
            </div>

          </form>

          {/* 3. PINNED FOOTER ACTIONS */}
          <footer className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26] flex items-center justify-between gap-4 shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C2230] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="add-document-drawer-form"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg active:scale-[0.99] cursor-pointer transition-all disabled:opacity-50"
            >
              {isEditing ? (
                <>
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} strokeWidth={2.2} />
                  <span>Save Updated Form</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} strokeWidth={2.2} />
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