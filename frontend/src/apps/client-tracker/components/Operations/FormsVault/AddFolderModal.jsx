import React from "react";
import { X } from "lucide-react";

const AddFolderModal = ({
  isOpen,
  onClose,
  activeSection,
  newFolderName,
  setNewFolderName,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-white/10">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
            New Folder
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Folder Name *
            </label>
            <input
              autoFocus
              required
              placeholder={
                activeSection === "AMC"
                  ? "e.g. Axis Mutual Fund"
                  : activeSection === "BANK"
                  ? "e.g. Kotak Mahindra Bank"
                  : "e.g. Sundaram BNP"
              }
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Folder will be placed under category:{" "}
              <span className="font-bold text-emerald-500">{activeSection}</span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFolderModal;