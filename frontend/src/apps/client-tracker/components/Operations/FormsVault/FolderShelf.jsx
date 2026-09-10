import React from "react";
import { Folder, FolderOpen, FolderPlus, Trash2 } from "lucide-react";

const FolderShelf = ({
  sectionFolders,
  activeFolder,
  formsList,
  onSelectFolder,
  onDeleteFolder,
  onOpenNewFolderModal,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <FolderOpen size={15} className="text-emerald-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Folders Shelf
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-400">
          {sectionFolders.length} {sectionFolders.length === 1 ? "Folder" : "Folders"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {sectionFolders.map((f) => {
          const isSelected = activeFolder?.id === f.id;
          const docCount = formsList.filter((doc) => doc.folderId === f.id).length;

          return (
            <div
              key={f.id}
              onClick={() => onSelectFolder(f.id)}
              className={`group relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-27.5 border ${
                isSelected
                  ? "bg-linear-to-b from-amber-500/10 to-amber-500/5 dark:from-amber-500/15 dark:to-transparent border-amber-500/50 dark:border-amber-400/40 shadow-sm ring-2 ring-amber-500/20"
                  : "bg-white dark:bg-white/2 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-white/5 text-amber-500/80 dark:text-amber-400/80"
                  }`}
                >
                  {isSelected ? (
                    <FolderOpen size={18} strokeWidth={2.2} />
                  ) : (
                    <Folder size={18} strokeWidth={2.2} />
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(f);
                  }}
                  title="Delete folder"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="mt-3">
                <h4
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isSelected
                      ? "text-slate-900 dark:text-white font-black"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {f.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  {docCount} {docCount === 1 ? "doc" : "docs"}
                </p>
              </div>
            </div>
          );
        })}

        {/* New Folder Action Button */}
        <button
          type="button"
          onClick={onOpenNewFolderModal}
          className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500/60 p-4 flex flex-col items-center justify-center text-center text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer min-h-27.5 bg-slate-50/50 dark:bg-white/1"
        >
          <FolderPlus size={22} className="mb-1.5 opacity-75" />
          <span className="text-xs font-bold uppercase tracking-wider">New Folder</span>
        </button>
      </div>
    </div>
  );
};

export default FolderShelf;