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
    background: isActive && !isSelectionMode ? `linear-gradient(90deg, ${hexToRgba(parent.color, 0.15)} 0%, transparent 100%)` : undefined,
    boxShadow: isActive && !isSelectionMode ? `-4px 4px 15px -5px ${hexToRgba(parent.color, 0.4)}` : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={() => isSelectionMode ? toggleSelection(parent._id) : onSelect(parent._id)}
      className={`group relative flex items-center p-3 sm:p-3.5 mb-2 rounded-xl cursor-pointer transition-all duration-300 ease-out border ${
        isActive && !isSelectionMode 
          ? 'border-transparent shadow-md transform scale-[1.02]' 
          : 'border-transparent hover:bg-white dark:hover:bg-slate-800/60 hover:shadow-sm hover:translate-x-1'
      }`}
    >
      <div 
        className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full transition-transform duration-300 ease-out"
        style={{ 
          backgroundColor: parent.color,
          transform: isActive && !isSelectionMode ? 'scaleY(1)' : 'scaleY(0)'
        }}
      />

      <div className="relative flex items-center w-full z-10 pl-1 sm:pl-0">
        {isSelectionMode ? (
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
            isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-transparent border-slate-400 dark:border-slate-500'
          }`}>
            {isSelected && <Check size={12} strokeWidth={4} />}
          </div>
        ) : (
          <div {...attributes} {...listeners} className={`mr-2 sm:mr-3 shrink-0 p-1 rounded-md ${isSearchActive ? 'opacity-20 cursor-not-allowed' : 'cursor-grab bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-none transition-colors'}`}>
            <GripVertical size={16} />
          </div>
        )}

        <div 
          className="w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full mr-2 sm:mr-3 shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-125" 
          style={{ backgroundColor: parent.color, boxShadow: `0 0 10px ${hexToRgba(parent.color, 0.6)}` }} 
        />
        
        <div className="flex-1 min-w-0">
          <p className={`text-[11px] sm:text-xs font-[1000] uppercase tracking-widest truncate transition-colors duration-300 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
            {parent.label}
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 pl-2">
          <span 
            className="text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: isActive ? parent.color : undefined,
              color: isActive ? '#fff' : undefined,
              boxShadow: isActive ? `0 2px 8px ${hexToRgba(parent.color, 0.5)}` : undefined
            }}
          >
            {parent.subCategories.length}
          </span>
          {!isSelectionMode && (
            <ChevronRight size={16} className={`transition-transform duration-300 hidden sm:block ${isActive ? 'text-slate-900 dark:text-white translate-x-1' : 'text-slate-400 -translate-x-1 group-hover:translate-x-0'}`} />
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
    animationDelay: `${index * 30}ms`,
    borderColor: isEditing ? parent.color : undefined,
    boxShadow: isEditing ? `0 10px 25px -5px ${hexToRgba(parent.color, 0.3)}` : undefined
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative group flex items-center p-3 sm:p-3.5 mb-3 rounded-xl transition-all duration-300 ease-out border overflow-hidden animate-in fade-in slide-in-from-bottom-4 ${
        isEditing 
          ? 'bg-white dark:bg-slate-900 shadow-xl scale-[1.02] z-10' 
          : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-lg'
      }`}
    >
      {!isEditing && (
        <>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(120deg, transparent, ${hexToRgba(parent.color, 0.05)}, transparent)` }} />
          <div className="absolute left-0 top-0 bottom-0 w-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ backgroundColor: parent.color }} />
        </>
      )}

      <div {...attributes} {...listeners} className={`relative z-10 mr-3 sm:mr-4 shrink-0 p-1.5 rounded-md transition-colors ${isEditing || isSearchActive ? 'opacity-20 cursor-not-allowed' : 'cursor-grab bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 touch-none'}`}>
        <GripVertical size={16} />
      </div>

      <div className="relative z-10 flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmitEdit(); if (e.key === 'Escape') onCancelEdit(); }}
            className="w-full bg-transparent border-none outline-none text-xs font-[1000] uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400"
            placeholder="ENTER TAG NAME..."
          />
        ) : (
          <span 
            className="text-xs font-[1000] uppercase tracking-widest text-slate-700 dark:text-slate-200 cursor-text select-none block truncate transition-colors group-hover:text-slate-900 dark:group-hover:text-white"
            onClick={() => onEdit(parent._id, sub)}
          >
            {sub.label}
          </span>
        )}
      </div>

      <div className="relative z-10">
        {isEditing ? (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button onMouseDown={(e) => { e.preventDefault(); onSubmitEdit(); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-white shadow-md transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: parent.color }}><Check size={16} strokeWidth={3} /></button>
            <button onMouseDown={(e) => { e.preventDefault(); onCancelEdit(); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={16} strokeWidth={3} /></button>
          </div>
        ) : (
          <button 
            onClick={() => onDelete(parent._id, sub)} 
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white sm:opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0 ml-2 hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30"
          >
            <Trash2 size={15} />
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

  useEffect(() => { if (addingSubToId && newSubInputRef.current) newSubInputRef.current.focus(); }, [addingSubToId]);

  const activeParent = filteredTree.find(p => p._id === effectiveActiveParentId);

  const triggerFeedback = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 3000);
  };

  const closeModal = () => {
    setModalMode(null); setEditTarget(null); setCatName(""); 
    setIsSelectionMode(false); setSelectedIds([]);
  };

  const handleActionExecution = async () => {
    if (!catName.trim()) return;
    const res = modalMode === 'merge' 
      ? await request("/categories/merge", "POST", { categoryIds: selectedIds, newCategoryName: catName, newCategoryColor: catColor })
      : await request(modalMode === 'create' ? "/categories" : `/categories/${editTarget._id}`, modalMode === 'create' ? "POST" : "PUT", { label: catName, color: catColor });

    if (res?.success) {
      await fetchCategories();
      triggerFeedback(modalMode === 'merge' ? "Merged Successfully" : "Saved Successfully");
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
      triggerFeedback(isSub ? "Entry Removed" : "Category Deleted");
      closeModal();
    }
  };

  const handleSubSubmit = async (parentId) => {
    if (!inputValue.trim()) { setAddingSubToId(null); setEditingSub(null); return; }
    const endpoint = editingSub ? `/categories/sub/${editingSub.subId}` : `/categories/${parentId}/sub`;
    const res = await request(endpoint, editingSub ? "PUT" : "POST", { label: inputValue });
    if (res?.success) {
      await fetchCategories();
      triggerFeedback(editingSub ? "Entry Updated" : "Added Successfully");
      setAddingSubToId(null); setEditingSub(null); setInputValue("");
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
      <div className="animate-in fade-in duration-700 text-left flex flex-col w-full h-[calc(100vh-4rem)] max-h-225 min-h-150">
        
        {feedback && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-200 flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] animate-in slide-in-from-top-6 duration-300">
            <CheckCircle2 size={18} />
            <span className="text-[11px] font-black uppercase tracking-widest">{feedback}</span>
          </div>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-4 mb-2 shrink-0">
          <div>
            <h2 className="text-2xl sm:text-4xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight italic leading-none">Categories</h2>
            <p className="text-[10px] font-bold text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-indigo-500 uppercase tracking-widest mt-1 sm:mt-2">Classification & Taxonomy Engine</p>
          </div>
        </div>

        {/* BORDERLESS SPLIT PANE */}
        <div className="flex-1 flex relative overflow-hidden bg-transparent w-full">
          
          {/* LEFT PANE: MASTER CATEGORIES */}
          <div className={`w-full lg:w-[35%] flex flex-col transition-transform duration-500 ease-out z-20 absolute inset-0 lg:relative lg:translate-x-0 bg-white dark:bg-[#020617] lg:bg-transparent pr-0 lg:pr-6 ${isMobileDetailView ? '-translate-x-full' : 'translate-x-0'}`}>
            
            <div className="pb-4 shrink-0">
              <div className="flex items-center justify-between mb-4 px-2 pt-2 lg:pt-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Master Folders</span>
                <div className="flex gap-2">
                  <button onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds([]); }} className={`p-2 rounded-xl transition-all duration-300 ${isSelectionMode ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-500 hover:border-indigo-200'}`} title="Merge">
                    <Merge size={16} />
                  </button>
                  <button onClick={() => { setCatColor("#10B981"); setModalMode('create'); }} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:border-emerald-200 transition-all duration-300 shadow-sm" title="Add Parent">
                    <Plus size={16} strokeWidth={3} />
                  </button>
                </div>
              </div>
              
              <div className="relative group px-1">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="SEARCH REPOSITORY..."
                  className="w-full bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-xs font-[1000] uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all shadow-sm focus:shadow-md focus:shadow-indigo-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-24">
              {filteredTree.length > 0 ? (
                <SortableContext items={filteredTree.map(i => i._id)} strategy={verticalListSortingStrategy}>
                  {filteredTree.map(parent => (
                    <MasterRow 
                      key={parent._id} parent={parent} 
                      isActive={effectiveActiveParentId === parent._id} 
                      onSelect={(id) => { setActiveParentId(id); setIsMobileDetailView(true); }}
                      isSelectionMode={isSelectionMode} isSelected={selectedIds.includes(parent._id)}
                      toggleSelection={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                      isSearchActive={searchTerm.length > 0}
                    />
                  ))}
                </SortableContext>
              ) : (
                <div className="p-8 text-center flex flex-col items-center opacity-40 animate-in zoom-in duration-300">
                   <Search size={40} className="mb-4 text-slate-400" />
                   <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">No matching data</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: SUB CATEGORIES */}
          <div className={`w-full lg:w-[65%] flex flex-col transition-transform duration-500 ease-out z-10 absolute inset-0 lg:relative lg:translate-x-0 bg-white dark:bg-[#020617] lg:bg-transparent ${!isMobileDetailView ? 'translate-x-full' : 'translate-x-0'}`}>
            
            {activeParent ? (
              <>
                {/* Floating Vibrant Banner */}
                <div 
                  className="relative pt-6 sm:pt-10 pb-6 px-4 sm:px-8 shrink-0 overflow-hidden shadow-xl sm:rounded-3xl mb-4 sm:mb-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${activeParent.color} 0%, ${hexToRgba(activeParent.color, 0.7)} 100%)`,
                    boxShadow: `0 20px 40px -15px ${hexToRgba(activeParent.color, 0.4)}`
                  }}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
                  <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 blur-3xl rounded-full pointer-events-none" />
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <button onClick={() => setIsMobileDetailView(false)} className="lg:hidden p-2 -ml-2 rounded-xl bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm transition-colors mt-1">
                        <ArrowLeft size={20} />
                      </button>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white/90 bg-black/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
                            Master Directory
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-4xl font-[1000] uppercase tracking-tighter text-white drop-shadow-md">
                          {activeParent.label}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 sm:gap-2 mt-1 sm:mt-0">
                      <button onClick={() => { setEditTarget(activeParent); setCatName(activeParent.label); setCatColor(activeParent.color); setModalMode('edit'); }} className="p-2 sm:p-3 text-white bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95" title="Edit Master">
                        <Edit3 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                      <button onClick={() => { setEditTarget({ ...activeParent, type: 'parent' }); setModalMode('delete'); }} className="p-2 sm:p-3 text-white bg-black/20 hover:bg-rose-500/80 backdrop-blur-sm rounded-xl transition-all shadow-md hover:shadow-rose-500/50 active:scale-95" title="Delete Master">
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub List Area Header */}
                <div className="px-2 pb-4 flex flex-col sm:flex-row sm:items-center justify-between shrink-0 gap-4 bg-transparent z-10 border-b border-slate-200 dark:border-slate-800/50 mb-2 sm:mb-4">
                  <div className="flex items-center gap-3">
                    <Tags size={16} className="text-slate-400" />
                    <span className="text-[10px] sm:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Tags ({activeParent.subCategories.length})</span>
                  </div>
                  <button 
                    onClick={() => { setAddingSubToId(activeParent._id); setEditingSub(null); setInputValue(""); }} 
                    disabled={searchTerm.length > 0}
                    className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 px-5 py-2.5 sm:py-3 rounded-xl shadow-lg disabled:opacity-30 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
                    style={{ backgroundColor: activeParent.color, color: '#fff', boxShadow: `0 10px 25px -5px ${hexToRgba(activeParent.color, 0.5)}` }}
                  >
                    <Plus size={16} strokeWidth={3} /> Create Tag
                  </button>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-24 px-2 sm:px-0">
                  <SortableContext items={activeParent.subCategories.map(s => s._id)} strategy={verticalListSortingStrategy}>
                    {activeParent.subCategories.map((sub, index) => (
                      <DetailRow 
                        key={sub._id} sub={sub} parent={activeParent} index={index}
                        onEdit={(pId, s) => { setEditingSub({ parentId: pId, subId: s._id }); setInputValue(s.label); }} 
                        onDelete={(pId, sObj) => { setEditTarget({ ...sObj, type: 'sub' }); setModalMode('delete'); }}
                        isEditing={editingSub?.subId === sub._id}
                        editValue={inputValue} onEditChange={setInputValue}
                        onSubmitEdit={() => handleSubSubmit(activeParent._id)}
                        onCancelEdit={() => { setEditingSub(null); setInputValue(""); }}
                        isSearchActive={searchTerm.length > 0}
                      />
                    ))}
                  </SortableContext>

                  {/* Add New Sub Row Inline */}
                  {addingSubToId === activeParent._id && (
                    <div className="flex items-center p-3 sm:p-4 mb-3 rounded-xl bg-white dark:bg-[#111827] shadow-xl ring-2 ring-inset animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ ringColor: activeParent.color }}>
                      <div className="mr-3 sm:mr-4 shrink-0 p-1" style={{ color: activeParent.color }}><Plus size={18} strokeWidth={3} /></div>
                      <input 
                        ref={newSubInputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} 
                        onKeyDown={e => { if (e.key === "Enter") handleSubSubmit(activeParent._id); if (e.key === 'Escape') { setAddingSubToId(null); setInputValue("");} }}
                        className="flex-1 bg-transparent border-none outline-none text-xs font-[1000] uppercase tracking-widest text-slate-900 dark:text-white" 
                        placeholder="ENTER NEW TAG NAME..." 
                      />
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button onMouseDown={(e) => { e.preventDefault(); handleSubSubmit(activeParent._id); }} className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center rounded-lg text-white shadow-lg transition-transform hover:scale-110 active:scale-95" style={{ backgroundColor: activeParent.color, boxShadow: `0 4px 15px ${hexToRgba(activeParent.color, 0.4)}` }}><Check size={16} strokeWidth={3} /></button>
                        <button onMouseDown={(e) => { e.preventDefault(); setAddingSubToId(null); setInputValue(""); }} className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X size={16} strokeWidth={3} /></button>
                      </div>
                    </div>
                  )}

                  {activeParent.subCategories.length === 0 && !addingSubToId && (
                    <div className="flex flex-col items-center justify-center h-48 opacity-40 mt-4 animate-in fade-in duration-500">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner" style={{ backgroundColor: hexToRgba(activeParent.color, 0.1) }}>
                        <Tags size={32} style={{ color: activeParent.color }} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Directory Empty</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 lg:flex">
                <FolderOpen size={80} className="mb-6 stroke-1" />
                <p className="text-sm font-[1000] uppercase tracking-[0.2em]">Select a Master Category</p>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } })}>
          {activeDragItem ? (
            activeDragItem.type === 'parent' ? (
              <div className="opacity-95 w-75 shadow-2xl bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 scale-105">
                <MasterRow parent={activeDragItem.parent} isActive={true} onSelect={() => {}} />
              </div>
            ) : (
              <div className="opacity-95 w-100 shadow-2xl bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-800 scale-105">
                <DetailRow sub={activeDragItem.sub} parent={tree.find(p => p._id === activeDragItem.parentId)} isEditing={false} index={0} />
              </div>
            )
          ) : null}
        </DragOverlay>

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