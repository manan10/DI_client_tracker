import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, GripVertical, Edit3, Trash2, LayoutGrid, Check, X, Palette, ShieldAlert 
} from "lucide-react";

// DND-KIT Core & Sorting
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- SUB-COMPONENT: Sortable Sub-Category Chip ---
const SortableSubChip = ({ sub, parent, onEdit, onDelete, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sub._id,
    data: { type: 'sub', parentId: parent._id, sub }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
    borderLeftColor: parent.color,
    cursor: isOverlay ? 'grabbing' : 'inherit'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center gap-2 pl-2 pr-1 py-1.5 bg-white dark:bg-slate-800 border-y border-r border-l-4 border-slate-200 dark:border-slate-700 rounded-md group shadow-sm transition-all ${isOverlay ? 'shadow-xl scale-105 border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
        <GripVertical size={12} className="text-slate-400" />
      </div>
      <span 
        className="text-[10px] font-bold uppercase tracking-tight flex-1 truncate select-none cursor-pointer"
        onClick={() => onEdit(parent._id, sub)}
      >
        {sub.label}
      </span>
      {!isOverlay && (
        <button 
          onClick={() => onDelete(parent._id, sub._id)} 
          className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={10} />
        </button>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Sortable Category Card ---
const SortableCategory = ({ parent, children, onEdit, onDelete, onAddSub, isOverlay }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: parent._id,
    data: { type: 'parent', parent }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden h-full ${isOverlay ? 'shadow-2xl ring-2 ring-indigo-500/50 scale-[1.02]' : ''}`}
    >
      <div 
        className="h-2 w-full cursor-grab active:cursor-grabbing hover:brightness-110 transition-all flex items-center justify-center group shrink-0" 
        style={{ backgroundColor: parent.color }} 
        {...attributes} {...listeners}
      >
        <div className="w-12 h-1 bg-white/20 rounded-full group-hover:bg-white/40" />
      </div>
      
      {/* HEADER: No more truncation mess */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
        <span className="text-[11px] font-[1000] uppercase tracking-widest italic flex-1 pt-1 dark:text-white break-words pr-2">
          {parent.label}
        </span>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onEdit(parent)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors">
            <Edit3 size={13} />
          </button>
          <button onClick={() => onDelete(parent)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-2 items-start content-start flex-1 min-h-20">
        {children}
        {!isOverlay && (
          <button 
            onClick={() => onAddSub(parent._id)} 
            className="h-8.5 w-8.5 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 rounded-md text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all shrink-0"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const SpendingCategories = () => {
  const [tree, setTree] = useState([
    { _id: "1", label: "Transportation", color: "#6366f1", subCategories: [{ _id: "101", label: "Uber & Lyft", icon: "Hash" }, { _id: "102", label: "Gasoline", icon: "Hash" }] },
    { _id: "2", label: "Living Essentials", color: "#10b981", subCategories: [{ _id: "201", label: "Monthly Rent", icon: "Hash" }, { _id: "202", label: "Groceries", icon: "Hash" }] },
    { _id: "3", label: "Entertainment & Fun", color: "#f59e0b", subCategories: [{ _id: "301", label: "Netflix", icon: "Hash" }] }
  ]);

  const [activeItem, setActiveItem] = useState(null);
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  
  // Inline editing states
  const [addingToId, setAddingToId] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [inputValue, setInputValue] = useState("");
  
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#6366f1");

  const inputRef = useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if ((addingToId || editingSub) && inputRef.current) inputRef.current.focus();
  }, [addingToId, editingSub]);

  // HANDLERS
  const openEditModal = (category) => {
    setEditTarget(category);
    setCatName(category.label);
    setCatColor(category.color);
    setModalMode('edit');
  };

  const handleSaveCategory = () => {
    if (!catName.trim()) return;
    if (modalMode === 'create') {
      setTree([...tree, { _id: Date.now().toString(), label: catName, color: catColor, subCategories: [] }]);
    } else {
      setTree(tree.map(p => p._id === editTarget._id ? { ...p, label: catName, color: catColor } : p));
    }
    setModalMode(null);
  };

  const submitSubAction = (parentId) => {
    if (!inputValue.trim()) { setAddingToId(null); setEditingSub(null); return; }
    setTree(prev => prev.map(p => {
      if (p._id !== parentId) return p;
      if (editingSub) {
        return { ...p, subCategories: p.subCategories.map(s => s._id === editingSub.subId ? { ...s, label: inputValue } : s) };
      }
      return { ...p, subCategories: [...p.subCategories, { _id: Date.now().toString(), label: inputValue, icon: "Hash" }] };
    }));
    setAddingToId(null); setEditingSub(null); setInputValue("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;
    if (active.data.current.type === 'parent' && active.id !== over.id) {
      setTree((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    if (active.data.current.type === 'sub') {
      const activeParentId = active.data.current.parentId;
      const overParentId = over.data.current?.parentId || over.id;
      if (activeParentId === overParentId && active.id !== over.id) {
        setTree((prev) => prev.map(p => {
          if (p._id !== activeParentId) return p;
          const oldIndex = p.subCategories.findIndex(s => s._id === active.id);
          const newIndex = p.subCategories.findIndex(s => s._id === over.id);
          return { ...p, subCategories: arrayMove(p.subCategories, oldIndex, newIndex) };
        }));
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={(e) => setActiveItem(e.active)} onDragEnd={handleDragEnd}>
      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-100 p-4 lg:p-8 text-left transition-colors">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 px-2 max-w-screen-xl mx-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg">
              <LayoutGrid size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-[1000] uppercase tracking-tighter italic dark:text-white leading-none">Ledger</h2>
          </div>
          <button onClick={() => setModalMode('create')} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all shrink-0">
            <Plus size={18} strokeWidth={3} className="inline mr-2" /> New Category
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-screen-xl mx-auto">
          <SortableContext items={tree.map(i => i._id)} strategy={verticalListSortingStrategy}>
            {tree.map((parent) => (
              <SortableCategory 
                key={parent._id} 
                parent={parent}
                onEdit={openEditModal} 
                onDelete={() => { setEditTarget(parent); setModalMode('delete'); }}
                onAddSub={(pId) => { setAddingToId(pId); setEditingSub(null); setInputValue(""); }}
              >
                <SortableContext items={parent.subCategories.map(s => s._id)} strategy={rectSortingStrategy}>
                  {parent.subCategories.map((sub) => (
                    editingSub?.subId === sub._id ? (
                      /* TRUE INLINE EDIT INPUT */
                      <div key={sub._id} className="flex items-center bg-white dark:bg-slate-800 border border-indigo-500 rounded-md overflow-hidden shadow-md">
                        <input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitSubAction(parent._id)}
                          onBlur={() => submitSubAction(parent._id)}
                          className="bg-transparent px-2 py-1 text-[10px] font-bold uppercase outline-none w-24"
                        />
                      </div>
                    ) : (
                      <SortableSubChip 
                        key={sub._id} sub={sub} parent={parent}
                        onEdit={(pId, s) => { setEditingSub({ parentId: pId, subId: s._id }); setAddingToId(null); setInputValue(s.label); }}
                        onDelete={(pId, sId) => setTree(tree.map(p => p._id === pId ? { ...p, subCategories: p.subCategories.filter(s => s._id !== sId) } : p))}
                      />
                    )
                  ))}
                  {/* INLINE ADD INPUT */}
                  {addingToId === parent._id && (
                    <div className="flex items-center bg-white dark:bg-slate-800 border border-indigo-500 rounded-md overflow-hidden shadow-md">
                      <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitSubAction(parent._id)}
                        onBlur={() => submitSubAction(parent._id)}
                        className="bg-transparent px-2 py-1 text-[10px] font-bold uppercase outline-none w-24"
                        placeholder="..."
                      />
                    </div>
                  )}
                </SortableContext>
              </SortableCategory>
            ))}
          </SortableContext>
        </div>

        <DragOverlay adjustScale={true}>
          {activeItem ? (
            activeItem.data.current.type === 'parent' ? (
              <SortableCategory parent={activeItem.data.current.parent} isOverlay>
                {activeItem.data.current.parent.subCategories.map(s => (
                  <div key={s._id} className="flex items-center gap-2 pl-2 pr-1 py-1.5 bg-white dark:bg-slate-800 border-y border-r border-l-4 border-slate-200 dark:border-slate-700 rounded-md opacity-50">
                    <span className="text-[10px] font-bold uppercase">{s.label}</span>
                  </div>
                ))}
              </SortableCategory>
            ) : (
              <SortableSubChip sub={activeItem.data.current.sub} parent={tree.find(p => p._id === activeItem.data.current.parentId)} isOverlay />
            )
          ) : null}
        </DragOverlay>

        {modalMode && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="absolute inset-0" onClick={() => setModalMode(null)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 text-left">
              {modalMode === 'delete' ? (
                <div className="p-8 text-center space-y-5">
                  <ShieldAlert size={48} className="mx-auto text-rose-500" />
                  <h3 className="text-xl font-black uppercase italic leading-none dark:text-white">Confirm Purge?</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    Permanently remove <span className="text-slate-900 dark:text-white">{editTarget?.label}</span>?
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setModalMode(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase dark:text-white">Abort</button>
                    <button onClick={() => { setTree(tree.filter(p => p._id !== editTarget._id)); setModalMode(null); }} className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95">Confirm</button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase tracking-tighter italic">{modalMode === 'edit' ? 'Update' : 'Create'} Category</h3>
                    <X size={20} className="text-slate-400 cursor-pointer" onClick={() => setModalMode(null)} />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Label</label>
                      <input autoFocus value={catName} onChange={e => setCatName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Color</label>
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} className="w-10 h-10 rounded-md cursor-pointer border-none bg-transparent" />
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{catColor}</span>
                      </div>
                    </div>
                    <button onClick={handleSaveCategory} className="w-full py-4 bg-indigo-600 text-white rounded-lg text-[11px] font-black uppercase tracking-[0.2em] shadow-lg">Save Configuration</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default SpendingCategories;