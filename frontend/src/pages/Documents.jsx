import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Upload, Search, Plus, RefreshCw, LayoutGrid, List, CheckSquare, Square, HardDrive, X, Archive, Folder, Trash2 } from "lucide-react";
import Navbar from "../components/Navbar";
import VaultRegistry from "../components/Documents/VaultRegistry";
import FileCard from "../components/Documents/FileCard";
import MoveModal from "../components/Documents/MoveModal";
import FilePreview from "../components/Documents/FilePreview";
import { useDocuments } from "../hooks/useDocuments";
import { useDebounce } from "../hooks/useDebounce";

const Documents = () => {
  const [currentPath, setCurrentPath] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [previewFile, setPreviewFile] = useState(null);
  const [isRenaming, setIsRenaming] = useState(null); 
  const [moveModal, setMoveModal] = useState(null); 
  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [moveStatus, setMoveStatus] = useState(null);

  const { 
    items, activities, totalSizeMB, uploading, uploadProgress, uploadQueue, activeUploadName, 
    loadingStates, fetchFilesAndActivity, fetchAllFolders, folderTree, handleCreateFolder, 
    handleRename, handleMove, handleDeleteItem, startBatchUpload, handleReSync, handleDownload 
  } = useDocuments(currentPath);

  useEffect(() => {
    const loadData = async () => {
        await fetchFilesAndActivity(debouncedSearch);
        setInitialLoading(false);
    };
    loadData();
  }, [debouncedSearch, fetchFilesAndActivity]);

  useEffect(() => {
    const handleOutsideClick = () => { if (activeMenuId) setActiveMenuId(null); };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [activeMenuId]);

  const onMoveConfirm = async (targetPath) => {
    setMoveStatus({ type: 'loading', msg: 'Moving items...' });
    try {
      await handleMove(moveModal.items, targetPath);
      setMoveStatus({ type: 'success', msg: 'Items moved successfully!' });
      setTimeout(() => { setMoveModal(null); setMoveStatus(null); }, 1500);
    } catch {
      setMoveStatus({ type: 'error', msg: 'Failed to move items.' });
      setTimeout(() => setMoveStatus(null), 3000);
    }
  };

  const filteredItems = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.filter(item => item && item.name !== ".placeholder")
               .sort((a, b) => (a.type === b.type ? 0 : a.type === 'folder' ? -1 : 1));
  }, [items]);

  const handleSelectAll = useCallback(() => {
    if (!filteredItems.length) return;
    const allFilteredIds = filteredItems.map(i => i.id);
    const isAllSelected = allFilteredIds.every(id => selectedIds.includes(id));
    setSelectedIds(prev => isAllSelected ? prev.filter(id => !allFilteredIds.includes(id)) : [...new Set([...prev, ...allFilteredIds])]);
  }, [filteredItems, selectedIds]);

  const isAllFilteredSelected = filteredItems.length > 0 && filteredItems.every(i => selectedIds.includes(i.id));
  const capacityPercentage = Math.min((totalSizeMB / 5120) * 100, 100);

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020408] transition-colors duration-300 relative font-sans">
      <Navbar />
      <VaultRegistry activities={activities} isOpen={isRegistryOpen} onClose={() => setIsRegistryOpen(false)} />

      <main className="max-w-450 mx-auto px-4 sm:px-10 py-8 space-y-6 pb-40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
                <h1 className="text-2xl font-[1000] text-slate-950 dark:text-white uppercase tracking-tight">Documents</h1>
                <div className="flex items-center gap-1 mt-1">
                    {["Main Folder", ...currentPath].map((name, i) => (
                        <button key={i} onClick={() => i === 0 ? setCurrentPath([]) : setCurrentPath(currentPath.slice(0, i))} className={`text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all ${i === currentPath.length ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30" : "text-slate-400 hover:text-slate-950"}`}>{name}</button>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {!searchTerm && <button onClick={() => { setEditValue(""); setIsCreatingFolder(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase shadow-lg shadow-emerald-600/20"><Plus size={16} /> New Folder</button>}
                <button onClick={handleReSync} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-emerald-600 transition-colors"><RefreshCw size={18} /></button>
                <div className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button onClick={handleSelectAll} className="flex items-center gap-2 text-[10px] font-black uppercase pr-2 border-r border-slate-200 dark:border-slate-800">
                    {isAllFilteredSelected ? <CheckSquare size={16} className="text-emerald-600" /> : <Square size={16} />}
                  </button>
                  <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
                  <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}><List size={16} /></button>
                </div>
                <div className="relative flex-1 lg:w-60 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input type="text" placeholder={searchTerm ? "Searching..." : "Quick find..."} className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-black uppercase outline-none focus:border-emerald-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>
        </div>

        {uploading && (
            <div className="bg-emerald-50 border border-emerald-100 dark:border-emerald-900/10 rounded-2xl p-4 animate-in slide-in-from-top-2">
                <div className="flex justify-between mb-2 text-[11px] font-black uppercase text-emerald-700">
                  <span>Uploading {activeUploadName} ({uploadQueue.current}/{uploadQueue.total})</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
        )}

        <div className={viewMode === "grid" ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4" : "flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"}>
          {viewMode === "list" && (
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <div className="col-span-1">Select</div><div className="col-span-7">Name</div><div className="col-span-2">Type</div><div className="col-span-2 text-right">Actions</div>
            </div>
          )}

          {initialLoading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className={`bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse ${viewMode === 'grid' ? 'aspect-square' : 'h-14 mb-1 mx-2'}`} />)
          ) : (
            <>
              {!searchTerm && (
                <label className={viewMode === "grid" ? "group relative bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all aspect-square" : "flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-all"}>
                  <Upload size={viewMode === "grid" ? 24 : 18} className="text-slate-400 group-hover:text-emerald-600" />
                  <input type="file" multiple className="hidden" onChange={(e) => startBatchUpload(Array.from(e.target.files))} />
                  <span className="text-[10px] font-black uppercase text-slate-500 ml-2">Upload</span>
                </label>
              )}
              {isCreatingFolder && !searchTerm && (
                  <div className={viewMode === "grid" ? "bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-2xl p-4 flex flex-col items-center justify-center animate-in zoom-in-95 aspect-square" : "flex items-center gap-4 px-6 py-4 border-b border-emerald-500 bg-emerald-50/10"}>
                      <Folder size={viewMode === "grid" ? 32 : 18} className="text-emerald-600" />
                      <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => setIsCreatingFolder(false)} onKeyDown={async (e) => { if (e.key === 'Enter' && editValue.trim()) { await handleCreateFolder(editValue.trim()); setIsCreatingFolder(false); setEditValue(""); } }} className="bg-transparent text-[10px] font-black outline-none border-b border-emerald-500 uppercase ml-2 flex-1" placeholder="NAME..." />
                  </div>
              )}
              {filteredItems.map(item => (
                <FileCard key={item.id} item={item} viewMode={viewMode} isSearchMode={!!searchTerm} isSelected={selectedIds.includes(item.id)} isLoading={loadingStates[item.id]} onSelect={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])} onMenuToggle={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)} isMenuOpen={activeMenuId === item.id} onRename={() => { setEditValue(item.name); setIsRenaming(item.id); setActiveMenuId(null); }} isRenaming={isRenaming === item.id} editValue={editValue} setEditValue={setEditValue} onRenameConfirm={() => { handleRename(item, editValue); setIsRenaming(null); }} onRenameCancel={() => setIsRenaming(null)} onMove={() => { setMoveModal({ items: [item] }); setActiveMenuId(null); }} onDownload={() => handleDownload(item)} onDeleteClick={() => { setDeleteConfirmId(item.id); setActiveMenuId(null); }} onDeleteConfirm={() => { handleDeleteItem(item); setDeleteConfirmId(null); }} onDeleteCancel={() => setDeleteConfirmId(null)} isDeleting={deleteConfirmId === item.id} onNavigate={() => item.type === 'folder' ? setCurrentPath([...currentPath, item.name]) : setPreviewFile(item)} onGoToFolder={() => setCurrentPath(item.parentPath ? item.parentPath.split("/") : [])} />
              ))}
            </>
          )}
        </div>
      </main>

      {moveModal && (
        <MoveModal 
          isOpen={!!moveModal} 
          onConfirm={onMoveConfirm} 
          onClose={() => { setMoveModal(null); setMoveStatus(null); }} 
          folderTree={folderTree} 
          selectedItems={moveModal.items} 
          status={moveStatus} 
          fetchAllFolders={fetchAllFolders}
        />
      )}
      <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} onDownload={() => handleDownload(previewFile)} />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center shadow-2xl transition-all">
          <div className="flex items-center gap-4 w-1/3 cursor-pointer group" onClick={() => setIsRegistryOpen(true)}>
              <HardDrive size={16} className="text-slate-500 group-hover:text-emerald-600 transition-colors" />
              <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-500"><span>Used: {totalSizeMB.toFixed(1)} MB</span></div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-900 rounded-full mt-1 overflow-hidden border border-slate-200 dark:border-slate-800"><div className="h-full bg-emerald-600 transition-all shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${capacityPercentage}%` }} /></div>
              </div>
          </div>
          {selectedIds.length > 0 && (
              <div className="flex-1 flex justify-end gap-3 items-center animate-in slide-in-from-bottom-2">
                  <span className="text-[10px] font-black uppercase dark:text-slate-300">{selectedIds.length} Selected</span>
                  <button onClick={() => selectedIds.map(id => items.find(i => i.id === id)).filter(i => i?.type === 'file').forEach(f => handleDownload(f))} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg">Download</button>
                  <button onClick={() => setMoveModal({ items: selectedIds.map(id => items.find(i => i.id === id)).filter(Boolean) })} className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase">Move</button>
                  <button onClick={() => { if(window.confirm(`Delete ${selectedIds.length} items?`)) { selectedIds.forEach(id => { const item = items.find(i => i.id === id); if (item) handleDeleteItem(item); }); setSelectedIds([]); } }} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={18} /></button>
                  <button onClick={() => setSelectedIds([])} className="p-2 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"><X size={20} /></button>
              </div>
          )}
      </div>
    </div>
  );
};

export default Documents;