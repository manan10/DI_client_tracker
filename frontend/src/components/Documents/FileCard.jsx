import React from "react";
import { 
  Folder, FileText, MoreVertical, Edit2, Move, 
  Download, CheckSquare, AlertCircle, Loader2, ExternalLink, 
  Trash2
} from "lucide-react";

const FileCard = ({ 
  item, viewMode, isSelected, onSelect, onMenuToggle, isMenuOpen, onRename, 
  isRenaming, editValue, setEditValue, onRenameConfirm, onRenameCancel,
  onMove, onDownload, onDeleteClick, onDeleteConfirm, onDeleteCancel, 
  isDeleting, onNavigate, isSearchMode, onGoToFolder, isLoading
}) => {
  
  const menuContent = isMenuOpen && (
    <div className={`absolute ${viewMode === 'list' ? 'right-0 top-10' : 'top-10 right-2'} w-44 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl p-1.5 z-50 animate-in fade-in zoom-in-95`} onClick={e => e.stopPropagation()}>
        {isSearchMode && (
          <button onClick={(e) => { e.stopPropagation(); onGoToFolder(); }} className="w-full text-left px-2 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[10px] font-black uppercase flex items-center gap-2 rounded-lg text-blue-600 transition-colors">
            <ExternalLink size={12} /> Go to folder
          </button>
        )}
        <button disabled={isLoading} onClick={onRename} className="w-full text-left px-2 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-[10px] font-black uppercase flex items-center gap-2 rounded-lg transition-colors"><Edit2 size={12} /> Rename</button>
        <button disabled={isLoading} onClick={onMove} className="w-full text-left px-2 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-[10px] font-black uppercase flex items-center gap-2 rounded-lg transition-colors"><Move size={12} /> Move</button>
        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
        <button disabled={isLoading} onClick={onDeleteClick} className="w-full text-left px-2 py-2 hover:bg-red-50 text-red-600 text-[10px] font-black uppercase flex items-center gap-2 rounded-lg transition-colors"><Trash2 size={12} /> Delete</button>
    </div>
  );

  const loadingOverlay = isLoading && (
    <div className="absolute inset-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
      <Loader2 className="text-emerald-600 animate-spin" size={viewMode === 'list' ? 18 : 32} />
    </div>
  );

  const actionButtons = (
    <div className={`${viewMode === 'list' ? 'flex relative items-center justify-end w-full' : 'absolute top-2 right-1 opacity-0 group-hover:opacity-100 transition-opacity'} items-center gap-0.5 z-10`}>
      {item.type === 'file' && (
        <button disabled={isLoading} onClick={(e) => { e.stopPropagation(); onDownload(); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="Download"><Download size={16} /></button>
      )}
      <div className="relative">
        <button disabled={isLoading} onClick={(e) => { e.stopPropagation(); onMenuToggle(); }} className={`p-2 rounded-lg transition-all ${isMenuOpen ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}><MoreVertical size={16} /></button>
        {menuContent}
      </div>
    </div>
  );

  if (viewMode === "list") {
    return (
      <div className={`relative grid grid-cols-12 items-center gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
        {loadingOverlay}
        <div className="col-span-1">
          <button disabled={isLoading} onClick={(e) => { e.stopPropagation(); onSelect(); }} className={`p-1 rounded border transition-colors ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-300'}`}><CheckSquare size={14} /></button>
        </div>
        <div className="col-span-7 flex items-center gap-3 cursor-pointer min-w-0" onClick={onNavigate}>
          <div className={`p-2 rounded-lg shrink-0 ${item.type === 'folder' ? "bg-amber-500" : "bg-blue-600"} text-white`}>{item.type === 'folder' ? <Folder size={14} /> : <FileText size={14} />}</div>
          <div className="flex flex-col min-w-0">
            {isRenaming ? (
              <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={onRenameCancel} onKeyDown={(e) => e.key === 'Enter' && onRenameConfirm()} className="text-[11px] font-black uppercase bg-white dark:bg-slate-800 border border-emerald-500 px-2 py-1 rounded outline-none w-full" onClick={e => e.stopPropagation()} />
            ) : (
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase truncate break-all">{item.name}</span>
            )}
            {isSearchMode && <span className="text-[8px] text-slate-400 font-bold uppercase truncate">In: /{item.parentPath || 'Root'}</span>}
          </div>
        </div>
        <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type}</div>
        <div className="col-span-2 flex justify-end">
            {actionButtons}
        </div>
        {isDeleting && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-40 flex items-center justify-center gap-4 px-6 animate-in fade-in">
            <span className="text-[10px] font-black uppercase text-red-600">Delete Permanently?</span>
            <button onClick={onDeleteConfirm} className="px-4 py-1 bg-red-600 text-white text-[9px] font-black rounded uppercase ml-2">Yes</button>
            <button onClick={onDeleteCancel} className="px-4 py-1 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-200 text-[9px] font-black rounded uppercase ml-2">No</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 aspect-square flex flex-col items-center justify-center text-center gap-2 ${isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'hover:shadow-lg transition-all'}`}>
      {loadingOverlay}
      <button disabled={isLoading} onClick={(e) => { e.stopPropagation(); onSelect(); }} className={`absolute top-2 left-2 p-1.5 rounded-lg border-2 transition-all ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-0 group-hover:opacity-100'}`}><CheckSquare size={14} /></button>
      {actionButtons}
      <div onClick={onNavigate} className="cursor-pointer w-full flex flex-col items-center min-w-0">
        <div className="relative mb-2 group-hover:scale-110 transition-transform duration-300">
          <div className={`p-4 rounded-2xl ${item.type === 'folder' ? "bg-amber-500 shadow-amber-500/20" : "bg-blue-600 shadow-blue-600/20"} text-white shadow-lg mx-auto w-fit`}>
            {item.type === 'folder' ? <Folder size={28} /> : <FileText size={28} />}
          </div>
        </div>
        {isRenaming ? (
          <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={onRenameCancel} onKeyDown={(e) => e.key === 'Enter' && onRenameConfirm()} className="text-[10px] font-black uppercase w-full bg-emerald-50 dark:bg-emerald-900/20 text-center rounded p-1 outline-none border border-emerald-500" onClick={(e) => e.stopPropagation()} />
        ) : (
          <p className="text-[10px] font-[1000] uppercase line-clamp-2 w-full px-1 text-slate-700 dark:text-slate-200 leading-tight break-all">{item.name}</p>
        )}
        {isSearchMode && <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">In: /{item.parentPath || 'Root'}</p>}
      </div>
      {isDeleting && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center rounded-2xl p-4 backdrop-blur-sm animate-in fade-in" onClick={(e) => e.stopPropagation()}>
            <AlertCircle size={20} className="text-red-600 mb-2" />
            <div className="flex gap-1">
              <button onClick={onDeleteConfirm} className="px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded uppercase">Yes</button>
              <button onClick={onDeleteCancel} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-400 text-[9px] font-black rounded uppercase">No</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default FileCard;