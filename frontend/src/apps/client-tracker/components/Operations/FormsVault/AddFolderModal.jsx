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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800 rounded-lg max-w-sm w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="sora-font text-sm font-bold text-slate-900 dark:text-white">
            New{" "}
            <span className="font-normal text-sky-600 dark:text-sky-300">
              Folder
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
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
              className="w-full bg-slate-50 dark:bg-[#1C2230] border border-slate-200 dark:border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Folder will be placed under category:{" "}
              <span className="font-mono font-semibold text-sky-600 dark:text-sky-300">{activeSection}</span>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
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