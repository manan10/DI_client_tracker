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
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <FolderOpen size={15} className="text-sky-600 dark:text-sky-400" />
          <span className="sora-font text-xs font-bold text-slate-700 dark:text-slate-200">
            Folders Shelf
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
          {sectionFolders.length} {sectionFolders.length === 1 ? "Folder" : "Folders"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sectionFolders.map((f) => {
          const isSelected = activeFolder?.id === f.id;
          const docCount = formsList.filter((doc) => doc.folderId === f.id).length;

          return (
            <div
              key={f.id}
              onClick={() => onSelectFolder(f.id)}
              className={`group relative rounded-lg p-3.5 transition-colors cursor-pointer flex flex-col justify-between min-h-26 border ${
                isSelected
                  ? "bg-sky-50/80 dark:bg-sky-500/10 border-sky-300 dark:border-sky-500/40"
                  : "bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-9 h-8 rounded-md flex items-center justify-center border transition-colors ${
                    isSelected
                      ? "bg-sky-600 text-white border-sky-600 dark:bg-sky-500 dark:border-sky-400"
                      : "bg-slate-50 dark:bg-[#1C2230] text-sky-600 dark:text-sky-400 border-slate-200/70 dark:border-slate-700/70"
                  }`}
                >
                  {isSelected ? (
                    <FolderOpen size={17} strokeWidth={2.2} />
                  ) : (
                    <Folder size={17} strokeWidth={2.2} />
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(f);
                  }}
                  title="Delete folder"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="mt-3">
                <h4
                  className={`sora-font text-xs leading-tight line-clamp-1 ${
                    isSelected
                      ? "text-slate-900 dark:text-white font-bold"
                      : "text-slate-700 dark:text-slate-200 font-semibold"
                  }`}
                >
                  {f.name}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
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
          className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-400 p-4 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer min-h-26 bg-slate-50/50 dark:bg-[#161B26]/60"
        >
          <FolderPlus size={20} className="mb-1.5 opacity-80" />
          <span className="text-xs font-semibold">New Folder</span>
        </button>
      </div>
    </div>
  );
};

export default FolderShelf;