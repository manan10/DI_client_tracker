import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Plus, Merge, Check, CheckCircle2, ChevronRight, 
  FolderOpen, ArrowLeft, GripVertical, Trash2, Edit3, X, Search, Tags
} from "lucide-react";
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects 
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApi } from "../../../../../shared/hooks/useApi"; 
import CategoryModal from "./CategoryModal";

const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// --- SORTABLE PARENT ROW (LEFT PANE) ---
const MasterRow = ({ parent, isActive, onSelect, isSelectionMode, isSelected, toggleSelection, isSearchActive }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: parent._id,
    data: { type: 'parent', parent },
    disabled: isSelectionMode || isSearchActive
  });

  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition, 
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={() => isSelectionMode ? toggleSelection(parent._id) : onSelect(parent._id)}
      className={`group relative flex items-center p-2.5 sm:p-3 mb-1.5 rounded-lg cursor-pointer transition-all border text-left ${
        isActive && !isSelectionMode 
          ? 'bg-slate-100/90 dark:bg-white/[0.06] border-slate-300 dark:border-white/15 shadow-2xs' 
          : 'bg-white dark:bg-[#0B1120] border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
      }`}
    >
      {/* Active Left Indicator Bar */}
      <div 
        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r transition-transform duration-200"
        style={{ 
          backgroundColor: parent.color,
          transform: isActive && !isSelectionMode ? 'scaleY(1)' : 'scaleY(0)'
        }}
      />

      <div className="relative flex items-center w-full min-w-0 pl-1.5 sm:pl-1">
        {isSelectionMode ? (
          <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2.5 transition-colors shrink-0 ${
            isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-slate-400 dark:border-slate-500'
          }`}>
            {isSelected && <Check size={11} strokeWidth={3.5} />}
          </div>
        ) : (
          <div {...attributes} {...listeners} className={`mr-2 shrink-0 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ${isSearchActive ? 'opacity-20 cursor-not-allowed' : 'cursor-grab touch-none'}`}>
            <GripVertical size={14} />
          </div>
        )}

        <div 
          className="w-2.5 h-2.5 rounded-full mr-2.5 shrink-0" 
          style={{ backgroundColor: parent.color }} 
        />
        
        <div className="flex-1 min-w-0 pr-2">
          <span className={`text-xs font-sans font-semibold tracking-tight truncate block ${
            isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {parent.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span 
            className="text-[10px] font-sans font-medium px-1.5 py-0.2 rounded border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10"
          >
            {parent.subCategories.length}
          </span>
          {!isSelectionMode && (
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${isActive ? 'translate-x-0.5 text-slate-700 dark:text-slate-200' : 'opacity-40'}`} />
          )}
        </div>
      </div>
    </div>
  );
};

// --- SORTABLE SUB ROW (RIGHT PANE) ---
const DetailRow = ({ sub, parent, onEdit, onDelete, isEditing, editValue, onEditChange, onSubmitEdit, onCancelEdit, isSearchActive, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sub._id,
    data: { type: 'sub', parentId: parent._id, sub },
    disabled: isEditing || isSearchActive
  });

  const inputRef = useRef(null);
  useEffect(() => { if (isEditing && inputRef.current) inputRef.current.focus(); }, [isEditing]);

  const style = { 
    transform: CSS.Translate.toString(transform), 
    transition, 
    opacity: isDragging ? 0.3 : 1,
    animationDelay: `${index * 20}ms`,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`group relative flex items-center p-2.5 sm:p-3 mb-2 rounded-lg border text-left transition-all ${
        isEditing 
          ? 'bg-white dark:bg-[#0B1120] border-emerald-500 shadow-sm z-10' 
          : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
      }`}
    >
      <div {...attributes} {...listeners} className={`mr-2.5 shrink-0 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ${isEditing || isSearchActive ? 'opacity-20 cursor-not-allowed' : 'cursor-grab touch-none'}`}>
        <GripVertical size={14} />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmitEdit(); if (e.key === 'Escape') onCancelEdit(); }}
            className="w-full bg-transparent border-none outline-none text-xs font-sans font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="Type tag name..."
          />
        ) : (
          <span 
            className="text-xs font-sans font-medium text-slate-800 dark:text-slate-200 cursor-text select-none block truncate"
            onClick={() => onEdit(parent._id, sub)}
          >
            {sub.label}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isEditing ? (
          <>
            <button 
              type="button" 
              onMouseDown={(e) => { e.preventDefault(); onSubmitEdit(); }} 
              className="p-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
              title="Save"
            >
              <Check size={13} strokeWidth={2.5} />
            </button>
            <button 
              type="button" 
              onMouseDown={(e) => { e.preventDefault(); onCancelEdit(); }} 
              className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              title="Cancel"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <button 
            type="button" 
            onClick={() => onDelete(parent._id, sub)} 
            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
            title="Delete tag"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const SpendingCategories = () => {
  const { request } = useApi();
  const [tree, setTree] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [activeParentId, setActiveParentId] = useState(null);
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  
  const [addingSubToId, setAddingSubToId] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#10B981");

  const [activeDragItem, setActiveDragItem] = useState(null);
  const newSubInputRef = useRef(null);

  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return tree;
    const lowerTerm = searchTerm.toLowerCase();
    return tree.map(parent => {
      const parentMatch = parent.label.toLowerCase().includes(lowerTerm);
      const matchingSubs = parent.subCategories.filter(sub => sub.label.toLowerCase().includes(lowerTerm));
      if (parentMatch || matchingSubs.length > 0) {
        return { ...parent, subCategories: parentMatch ? parent.subCategories : matchingSubs };
      }
      return null;
    }).filter(Boolean);
  }, [tree, searchTerm]);

  const effectiveActiveParentId = useMemo(() => {
    if (filteredTree.length === 0) return null;
    const exists = filteredTree.find(p => p._id === activeParentId);
    return exists ? activeParentId : filteredTree[0]._id;
  }, [filteredTree, activeParentId]);

  useEffect(() => {
    let isMounted = true;
    const initialLoad = async () => {
      const res = await request("/categories/tree", "GET");
      if (isMounted && res?.success) {
        setTree(res.data);
        setActiveParentId(prev => (!prev && res.data.length > 0) ? res.data[0]._id : prev);
      }
    };
    initialLoad();
    return () => { isMounted = false; };
  }, [request]);

  const fetchCategories = async () => {
    const res = await request("/categories/tree", "GET");
    if (res?.success) setTree(res.data);
  };

  useEffect(() => { 
    if (addingSubToId && newSubInputRef.current) newSubInputRef.current.focus(); 
  }, [addingSubToId]);

  const activeParent = filteredTree.find(p => p._id === effectiveActiveParentId);

  const triggerFeedback = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 2500);
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
      triggerFeedback(modalMode === 'merge' ? "Categories merged" : "Category saved");
      closeModal();
    }
  };

  const confirmDelete = async () => {
    if (!editTarget) return;
    const isSub = editTarget.type === 'sub';
    const res = await request(isSub ? `/categories/sub/${editTarget._id}` : `/categories/${editTarget._id}`, "DELETE");
    if (res?.success) {
      if (!isSub && activeParentId === editTarget._id) {
        setActiveParentId(tree.find(p => p._id !== editTarget._id)?._id || null);
        setIsMobileDetailView(false);
      }
      await fetchCategories();
      triggerFeedback(isSub ? "Tag removed" : "Category deleted");
      closeModal();
    }
  };

  const handleSubSubmit = async (parentId) => {
    if (!inputValue.trim()) { 
      setAddingSubToId(null); 
      setEditingSub(null); 
      return; 
    }
    const endpoint = editingSub ? `/categories/sub/${editingSub.subId}` : `/categories/${parentId}/sub`;
    const res = await request(endpoint, editingSub ? "PUT" : "POST", { label: inputValue });
    if (res?.success) {
      await fetchCategories();
      triggerFeedback(editingSub ? "Tag updated" : "Tag added");
      setAddingSubToId(null); 
      setEditingSub(null); 
      setInputValue("");
    }
  };

  const handleDragStart = (event) => setActiveDragItem(event.active.data.current);
  
  const handleDragEnd = async (event) => {
    setActiveDragItem(null);
    const { active, over } = event;
    if (!over || isSelectionMode || searchTerm) return;

    if (active.data.current?.type === 'parent' && active.id !== over.id) {
      const oldIndex = tree.findIndex((i) => i._id === active.id);
      const newIndex = tree.findIndex((i) => i._id === over.id);
      const newTree = arrayMove(tree, oldIndex, newIndex);
      setTree(newTree);
      await request("/categories/reorder", "PATCH", { order: newTree.map(c => c._id) });
    }

    if (active.data.current?.type === 'sub') {
      const parentId = active.data.current.parentId;
      if (active.id !== over.id) {
        const parent = tree.find(p => p._id === parentId);
        const oldIndex = parent.subCategories.findIndex(s => s._id === active.id);
        const newIndex = parent.subCategories.findIndex(s => s._id === over.id);
        const newSubs = arrayMove(parent.subCategories, oldIndex, newIndex);
        
        setTree(prev => prev.map(p => p._id === parentId ? { ...p, subCategories: newSubs } : p));
        await request(`/categories/${parentId}/sub/reorder`, "PATCH", { order: newSubs.map(s => s._id) });
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-5 text-left antialiased">
        
        {/* TOAST FEEDBACK PILL */}
        {feedback && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-200 flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-md shadow-lg border border-slate-700 dark:border-white/20 animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 size={15} className="text-emerald-500" />
            <span className="text-xs font-sans font-medium">{feedback}</span>
          </div>
        )}

        {/* SECTION HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Spending <span className="italic font-normal text-emerald-800 dark:text-emerald-400">Categories</span>
            </h2>
            <p className="text-xs font-sans text-slate-500 dark:text-slate-400 mt-0.5">
              Organize main spending groups, add subcategory tags, and reorder items by dragging.
            </p>
          </div>
        </div>

        {/* WORKSPACE SPLIT PANE */}
        <div className="flex flex-col lg:flex-row gap-5 min-h-[560px] items-start">
          
          {/* LEFT PANE: MAIN CATEGORIES */}
          <div className={`w-full lg:w-80 shrink-0 flex flex-col ${isMobileDetailView ? 'hidden lg:flex' : 'flex'}`}>
            <div className="bg-slate-50/70 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-lg p-3 flex flex-col gap-3">
              
              {/* Controls Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-semibold text-slate-700 dark:text-slate-300">
                  Main Categories ({tree.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }} 
                    className={`p-1.5 rounded text-xs font-sans transition-colors cursor-pointer border ${
                      isSelectionMode 
                        ? 'bg-indigo-600 text-white border-indigo-700' 
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                    }`} 
                    title="Merge categories"
                  >
                    <Merge size={14} />
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setCatColor("#10B981"); setModalMode('create'); }} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-sans font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Merge Action Banner */}
              {isSelectionMode && selectedIds.length > 1 && (
                <div className="flex items-center justify-between p-2 rounded bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                  <span className="text-[11px] font-sans font-medium text-indigo-900 dark:text-indigo-200">
                    {selectedIds.length} categories chosen
                  </span>
                  <button
                    type="button"
                    onClick={() => { setCatName(""); setModalMode('merge'); }}
                    className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-sans font-semibold cursor-pointer"
                  >
                    Merge
                  </button>
                </div>
              )}

              {/* Search Field */}
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs font-sans text-slate-900 dark:text-white outline-none focus:border-emerald-600 placeholder:text-slate-400"
                />
              </div>

              {/* Category Items List */}
              <div className="flex-1 overflow-y-auto max-h-[460px] no-scrollbar">
                {filteredTree.length > 0 ? (
                  <SortableContext items={filteredTree.map(i => i._id)} strategy={verticalListSortingStrategy}>
                    {filteredTree.map(parent => (
                      <MasterRow 
                        key={parent._id} 
                        parent={parent} 
                        isActive={effectiveActiveParentId === parent._id} 
                        onSelect={(id) => { setActiveParentId(id); setIsMobileDetailView(true); }}
                        isSelectionMode={isSelectionMode} 
                        isSelected={selectedIds.includes(parent._id)}
                        toggleSelection={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                        isSearchActive={searchTerm.length > 0}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <div className="py-8 text-center text-xs font-sans text-slate-400">
                    No matching categories found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANE: SUB CATEGORIES & TAGS */}
          <div className={`flex-1 w-full flex flex-col ${!isMobileDetailView ? 'hidden lg:flex' : 'flex'}`}>
            {activeParent ? (
              <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-lg p-4 sm:p-5 flex flex-col gap-4">
                
                {/* Header Strip with Color Accent & Controls */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      type="button"
                      onClick={() => setIsMobileDetailView(false)} 
                      className="lg:hidden p-1 -ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div 
                      className="w-3.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: activeParent.color }} 
                    />
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-serif tracking-tight text-slate-900 dark:text-white truncate">
                        {activeParent.label}
                      </h3>
                      <span className="text-[11px] font-sans text-slate-400 block mt-0.5">
                        {activeParent.subCategories.length} subcategory tag{activeParent.subCategories.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      type="button"
                      onClick={() => { setEditTarget(activeParent); setCatName(activeParent.label); setCatColor(activeParent.color); setModalMode('edit'); }} 
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer" 
                      title="Edit Category Name & Color"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setEditTarget({ ...activeParent, type: 'parent' }); setModalMode('delete'); }} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors cursor-pointer" 
                      title="Delete Category"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subcategories Top Action Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tags size={14} className="text-slate-400" />
                    <span className="text-xs font-sans font-semibold text-slate-700 dark:text-slate-300">
                      Subcategory Tags
                    </span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => { setAddingSubToId(activeParent._id); setEditingSub(null); setInputValue(""); }} 
                    disabled={searchTerm.length > 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded text-xs font-sans font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Plus size={13} strokeWidth={2.5} />
                    <span>Add Tag</span>
                  </button>
                </div>

                {/* Subcategories List Area */}
                <div className="space-y-1 overflow-y-auto max-h-[440px] no-scrollbar">
                  {/* Inline Add Row */}
                  {addingSubToId === activeParent._id && (
                    <div className="flex items-center p-2.5 mb-2 rounded-lg border-2 border-emerald-500 bg-white dark:bg-[#0B1120] shadow-xs">
                      <input 
                        ref={newSubInputRef} 
                        value={inputValue} 
                        onChange={e => setInputValue(e.target.value)} 
                        onKeyDown={e => { 
                          if (e.key === "Enter") handleSubSubmit(activeParent._id); 
                          if (e.key === 'Escape') { setAddingSubToId(null); setInputValue(""); } 
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-xs font-sans text-slate-900 dark:text-white placeholder:text-slate-400" 
                        placeholder="Type new tag name and press Enter..." 
                      />
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button 
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleSubSubmit(activeParent._id); }} 
                          className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer"
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </button>
                        <button 
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); setAddingSubToId(null); setInputValue(""); }} 
                          className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  <SortableContext items={activeParent.subCategories.map(s => s._id)} strategy={verticalListSortingStrategy}>
                    {activeParent.subCategories.map((sub, index) => (
                      <DetailRow 
                        key={sub._id} 
                        sub={sub} 
                        parent={activeParent} 
                        index={index}
                        onEdit={(pId, s) => { setEditingSub({ parentId: pId, subId: s._id }); setInputValue(s.label); }} 
                        onDelete={(pId, sObj) => { setEditTarget({ ...sObj, type: 'sub' }); setModalMode('delete'); }}
                        isEditing={editingSub?.subId === sub._id}
                        editValue={inputValue} 
                        onEditChange={setInputValue}
                        onSubmitEdit={() => handleSubSubmit(activeParent._id)}
                        onCancelEdit={() => { setEditingSub(null); setInputValue(""); }}
                        isSearchActive={searchTerm.length > 0}
                      />
                    ))}
                  </SortableContext>

                  {activeParent.subCategories.length === 0 && !addingSubToId && (
                    <div className="py-12 text-center text-xs font-sans text-slate-400">
                      No subcategory tags added yet. Click "Add Tag" above to create one.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64 border border-dashed border-slate-200 dark:border-white/10 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">
                <FolderOpen size={32} className="stroke-1" />
                <span className="text-xs font-sans">Select a category on the left to view and edit its tags</span>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } })}>
          {activeDragItem ? (
            activeDragItem.type === 'parent' ? (
              <div className="w-72 shadow-xl bg-white dark:bg-[#0B1120] rounded-lg border border-slate-300 dark:border-white/20 p-2">
                <MasterRow parent={activeDragItem.parent} isActive={true} onSelect={() => {}} />
              </div>
            ) : (
              <div className="w-80 shadow-xl bg-white dark:bg-[#0B1120] rounded-lg border border-slate-300 dark:border-white/20 p-2">
                <DetailRow sub={activeDragItem.sub} parent={tree.find(p => p._id === activeDragItem.parentId)} isEditing={false} index={0} />
              </div>
            )
          ) : null}
        </DragOverlay>

        <CategoryModal 
          modalMode={modalMode} 
          closeModal={closeModal} 
          catName={catName} 
          setCatName={setCatName} 
          catColor={catColor} 
          setCatColor={setCatColor} 
          handleAction={handleActionExecution} 
          confirmDelete={confirmDelete} 
          editTarget={editTarget} 
          selectedCount={selectedIds.length}
        />
      </div>
    </DndContext>
  );
};

export default SpendingCategories;