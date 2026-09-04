import React, { useEffect, useState } from "react";
import { X, Move, ChevronRight, ChevronDown, Folder, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

// Recursive Folder Item Component
const FolderTreeItem = ({ node, level, onConfirm, selectedItems }) => {
  const [isOpen, setIsOpen] = useState(level === 0); // Root open by default
  const hasChildren = node.children && node.children.length > 0;
  
  // Prevent moving a folder into itself or its own children
  const isTargetDisabled = selectedItems.some(item => 
    node.storagePath === item.storagePath || node.storagePath.startsWith(item.storagePath + "/")
  );

  return (
    <div className="w-full">
      <div 
        className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all ${
          isTargetDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-emerald-500/10 cursor-pointer group'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => !isTargetDisabled && onConfirm(node.storagePath)}
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`p-1 hover:bg-slate-800 rounded transition-colors ${!hasChildren && 'opacity-0 pointer-events-none'}`}
        >
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        
        <Folder size={16} className={level === 0 ? "text-emerald-500" : "text-amber-500"} />
        
        <span className="text-[11px] font-black uppercase tracking-tight truncate flex-1">
          {node.name}
        </span>
        
        {!isTargetDisabled && (
          <span className="text-[9px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase mr-2">
            Move Here
          </span>
        )}
      </div>

      {isOpen && hasChildren && (
        <div className="mt-1">
          {node.children.map(child => (
            <FolderTreeItem 
              key={child.storagePath} 
              node={child} 
              level={level + 1} 
              onConfirm={onConfirm} 
              selectedItems={selectedItems}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MoveModal = ({ isOpen, onConfirm, onClose, folderTree, selectedItems, status, fetchAllFolders }) => {
  useEffect(() => {
    if (isOpen) fetchAllFolders();
  }, [isOpen, fetchAllFolders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0F17] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative">
        
        {/* Success/Error Overlay */}
        {status && (
          <div className="absolute inset-0 z-50 bg-[#0B0F17]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
            {status.type === 'loading' && <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />}
            {status.type === 'success' && <CheckCircle2 className="text-emerald-500 mb-4 animate-bounce" size={48} />}
            {status.type === 'error' && <AlertCircle className="text-red-500 mb-4" size={48} />}
            <h3 className="text-sm font-black uppercase tracking-widest text-white">{status.msg}</h3>
          </div>
        )}

        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
              <Move size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-white leading-none">Select Destination</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Moving {selectedItems.length} items</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {folderTree ? (
            <FolderTreeItem 
              node={folderTree} 
              level={0} 
              onConfirm={onConfirm} 
              selectedItems={selectedItems} 
            />
          ) : (
            <div className="py-10 flex justify-center">
              <Loader2 className="text-slate-700 animate-spin" />
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/30 border-t border-slate-800">
          <button 
            onClick={onClose} 
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            Cancel Move
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;