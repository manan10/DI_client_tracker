import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Settings2, Merge, Check, CheckCircle2 } from "lucide-react";
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import {useApi} from "../../../../hooks/useApi"; 
import SortableCategory from "./SortableCategory";
import SortableSubChip from "./SortableSubChip";
import CategoryModal from "./CategoryModal";

const SpendingCategories = () => {
  const { request } = useApi();
  const [tree, setTree] = useState([]);
  const [feedback, setFeedback] = useState(null);
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [addingToId, setAddingToId] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#6366f1");

  const inputRef = useRef(null);

  const fetchCategories = useCallback(async () => {
    const res = await request("/categories/tree", "GET");
    if (res?.success) setTree(res.data);
  }, [request]);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      const res = await request("/categories/tree", "GET");
      if (isMounted && res?.success) setTree(res.data);
    };
    loadCategories();
    return () => { isMounted = false; };
  }, [request]);

  useEffect(() => {
    if ((addingToId || editingSub) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingToId, editingSub]);

  const triggerFeedback = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const closeModal = () => {
    setModalMode(null);
    setEditTarget(null);
    setCatName("");
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleActionExecution = async () => {
    if (!catName.trim()) return;
    const res = modalMode === 'merge' 
      ? await request("/categories/merge", "POST", { categoryIds: selectedIds, newCategoryName: catName, newCategoryColor: catColor })
      : await request(modalMode === 'create' ? "/categories" : `/categories/${editTarget._id}`, modalMode === 'create' ? "POST" : "PUT", { label: catName, color: catColor });

    if (res?.success) {
      await fetchCategories();
      triggerFeedback(modalMode === 'merge' ? "Categories Merged" : "Saved Successfully");
      closeModal();
    }
  };

  const confirmDelete = async () => {
    if (!editTarget) return;
    const isSub = editTarget.type === 'sub';
    const res = await request(isSub ? `/categories/sub/${editTarget._id}` : `/categories/${editTarget._id}`, "DELETE");
    if (res?.success) {
      await fetchCategories();
      triggerFeedback(isSub ? "Entry Removed" : "Category Deleted");
      closeModal();
    }
  };

  const handleSubSubmit = async (parentId) => {
    if (!inputValue.trim()) { setAddingToId(null); setEditingSub(null); return; }
    const endpoint = editingSub ? `/categories/sub/${editingSub.subId}` : `/categories/${parentId}/sub`;
    const res = await request(endpoint, editingSub ? "PUT" : "POST", { label: inputValue });
    if (res?.success) {
      await fetchCategories();
      triggerFeedback(editingSub ? "Entry Updated" : "New Entry Created");
      setAddingToId(null); setEditingSub(null); setInputValue("");
    }
  };

  // RESTORED: COMPLETE REORDER LOGIC FOR BOTH PARENT AND SUBS
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || isSelectionMode) return;

    // Handle Parent Reordering
    if (active.data.current.type === 'parent' && active.id !== over.id) {
      const oldIndex = tree.findIndex((i) => i._id === active.id);
      const newIndex = tree.findIndex((i) => i._id === over.id);
      const newTree = arrayMove(tree, oldIndex, newIndex);
      setTree(newTree);
      await request("/categories/reorder", "PATCH", { order: newTree.map(c => c._id) });
    }

    // Handle Sub-Category Reordering
    if (active.data.current.type === 'sub') {
      const activeParentId = active.data.current.parentId;
      const overParentId = over.data.current?.parentId || over.id;

      // Ensure we are reordering within the SAME parent
      if (activeParentId === overParentId && active.id !== over.id) {
        const parent = tree.find(p => p._id === activeParentId);
        const oldIndex = parent.subCategories.findIndex(s => s._id === active.id);
        const newIndex = parent.subCategories.findIndex(s => s._id === over.id);
        
        const newSubs = arrayMove(parent.subCategories, oldIndex, newIndex);
        
        // Optimistic local update
        setTree(prev => prev.map(p => 
          p._id === activeParentId ? { ...p, subCategories: newSubs } : p
        ));

        // Persist to backend
        await request(`/categories/${activeParentId}/sub/reorder`, "PATCH", { 
          order: newSubs.map(s => s._id) 
        });
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="w-full min-h-screen text-slate-900 dark:text-slate-100 p-4 lg:p-0 transition-colors relative">
        
        {feedback && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-500 flex items-center gap-3 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-5 duration-300">
            <CheckCircle2 size={20} />
            <span className="text-xs font-black uppercase tracking-widest">{feedback}</span>
          </div>
        )}

        <header className="flex flex-col sm:flex-row justify-between items-center mb-10 px-2 max-w-7xl mx-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20"><Settings2 size={22} className="text-white" /></div>
            <h2 className="text-2xl font-[1000] uppercase tracking-tighter italic leading-none">Category Manager</h2>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }} 
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${isSelectionMode ? 'bg-slate-200 dark:bg-slate-800 text-slate-600' : 'bg-white dark:bg-slate-900 border border-slate-200 text-slate-400'}`}
            >
              <Merge size={16} className="inline mr-1" /> {isSelectionMode ? 'Cancel' : 'Merge'}
            </button>
            {selectedIds.length >= 2 ? (
              <button onClick={() => setModalMode('merge')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl cursor-pointer active:scale-95">Merge Selected</button>
            ) : (
              <button onClick={() => setModalMode('create')} className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl cursor-pointer active:scale-95"><Plus size={18} className="inline mr-1" />New</button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <SortableContext items={tree.map(i => i._id)} strategy={rectSortingStrategy}>
            {tree.map((parent) => (
              <div key={parent._id} className="relative">
                {isSelectionMode && (
                  <div onClick={() => setSelectedIds(prev => prev.includes(parent._id) ? prev.filter(i => i !== parent._id) : [...prev, parent._id])} className={`absolute -top-3 -right-3 z-50 w-8 h-8 rounded-full border-4 border-white dark:border-[#020617] flex items-center justify-center cursor-pointer ${selectedIds.includes(parent._id) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    {selectedIds.includes(parent._id) && <Check size={14} strokeWidth={4} />}
                  </div>
                )}
                <SortableCategory 
                  parent={parent}
                  onEdit={() => { setEditTarget(parent); setCatName(parent.label); setCatColor(parent.color); setModalMode('edit'); }}
                  onDelete={() => { setEditTarget({ ...parent, type: 'parent' }); setModalMode('delete'); }}
                  onAddSub={(pId) => { setAddingToId(pId); setEditingSub(null); setInputValue(""); }}
                >
                  <div className="flex flex-col gap-2 w-full">
                    <SortableContext items={parent.subCategories.map(s => s._id)} strategy={rectSortingStrategy}>
                      {parent.subCategories.map((sub) => (
                        editingSub?.subId === sub._id ? (
                          <div key={sub._id} className="flex items-center bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-md p-1">
                            <input ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubSubmit(parent._id)} onBlur={() => handleSubSubmit(parent._id)} className="text-[10px] uppercase outline-none bg-transparent w-full px-2" />
                          </div>
                        ) : (
                          <SortableSubChip 
                            key={sub._id} sub={sub} parent={parent} 
                            onEdit={(pId, s) => { setEditingSub({ parentId: pId, subId: s._id }); setInputValue(s.label); }} 
                            onDelete={(pId, sObj) => { setEditTarget({ ...sObj, type: 'sub' }); setModalMode('delete'); }} 
                          />
                        )
                      ))}
                    </SortableContext>
                    
                    {addingToId === parent._id && (
                      <div className="flex items-center bg-white dark:bg-slate-800 border-2 border-emerald-500 rounded-md p-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <input 
                          ref={inputRef} 
                          value={inputValue} 
                          onChange={e => setInputValue(e.target.value)} 
                          onKeyDown={e => e.key === "Enter" && handleSubSubmit(parent._id)} 
                          onBlur={() => handleSubSubmit(parent._id)}
                          placeholder="NEW ENTRY NAME..."
                          className="text-[10px] font-black uppercase outline-none bg-transparent w-full px-2 placeholder:text-slate-300" 
                        />
                      </div>
                    )}
                  </div>
                </SortableCategory>
              </div>
            ))}
          </SortableContext>
        </div>

        <CategoryModal 
          modalMode={modalMode} closeModal={closeModal} 
          catName={catName} setCatName={setCatName} 
          catColor={catColor} setCatColor={setCatColor}
          handleAction={handleActionExecution} confirmDelete={confirmDelete} 
          editTarget={editTarget} selectedCount={selectedIds.length}
        />
      </div>
    </DndContext>
  );
};

export default SpendingCategories;