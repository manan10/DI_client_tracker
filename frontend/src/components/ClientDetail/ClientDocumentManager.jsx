import React, { useState, useMemo } from 'react';
import { 
  FileText, UploadCloud, ArrowLeft, Trash2, 
  ExternalLink, Loader2, Download, Search, Plus, Calendar, ShieldAlert
} from 'lucide-react';
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../firebase"; 
import { useApi } from "../../hooks/useApi"; 
import DocumentUploadForm from './DocumentUploadForm'; 
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ClientDocumentManager = ({ client, onRefresh }) => {
  // Views: 'list' | 'upload' | 'preview'
  const [view, setView] = useState('list'); 
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { request } = useApi();

  const handleUploadSuccess = () => {
    setView('list');
    if (onRefresh) onRefresh();
  };

  const handleViewDoc = (doc) => {
    setSelectedDoc(doc);
    setView('preview');
  };

  const handleBackToList = () => {
    setSelectedDoc(null);
    setView('list');
  };

  const filteredDocuments = useMemo(() => {
    const docs = client?.documents || [];
    if (!searchQuery) return docs;
    
    return docs.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [client?.documents, searchQuery]);

  const handleDownloadAll = async () => {
    const docs = client?.documents || [];
    if (docs.length === 0) return;
    
    setIsZipping(true);
    const zip = new JSZip();
    const folderName = `${client.name.replace(/\s+/g, '_')}_Vault`;
    const folder = zip.folder(folderName);

    try {
      const downloadPromises = docs.map(async (doc) => {
        const response = await fetch(doc.downloadUrl);
        const blob = await response.blob();
        const cleanName = doc.name.split('_').pop();
        folder.file(`${doc.docType}_${cleanName}`, blob);
      });

      await Promise.all(downloadPromises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
    } catch (err) {
      console.error("Zipping Error:", err);
      alert("Failed to bundle documents. Check CORS settings.");
    } finally {
      setIsZipping(false);
    }
  };

  const handleDeleteDoc = async (doc) => {
    if (!doc || !client) return;
    const confirmDelete = window.confirm(`Permanently delete "${doc.name}"? This cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      try {
        const storageRef = ref(storage, doc.storagePath);
        await deleteObject(storageRef);
      } catch (fErr) {
        if (fErr.code !== 'storage/object-not-found') throw fErr;
      }

      await request(`/clients/${client._id}/documents/${doc._id}`, 'DELETE', {});
      await request(`/vault/item?storagePath=${encodeURIComponent(doc.storagePath)}`, 'DELETE');

      handleBackToList();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("Error removing document from vault.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // VIEW: UPLOAD
  // ==========================================
  if (view === 'upload') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
          onClick={handleBackToList}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Vault
        </button>
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-700">
          <DocumentUploadForm client={client} onUploadSuccess={handleUploadSuccess} onCancel={handleBackToList} />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: PREVIEW
  // ==========================================
  if (view === 'preview' && selectedDoc) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-[75vh] min-h-150">
        
        {/* Preview Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBackToList}
              className="p-2.5 bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-500 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {selectedDoc.name}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span className="text-emerald-600 dark:text-emerald-500">{selectedDoc.docType}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(selectedDoc.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={selectedDoc.downloadUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest"
            >
              <ExternalLink size={14} /> Open Native
            </a>
            <button 
              onClick={() => handleDeleteDoc(selectedDoc)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all border border-red-100 dark:border-red-500/20 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
           <iframe src={selectedDoc.downloadUrl} className="w-full h-full border-none absolute inset-0 bg-slate-50 dark:bg-slate-900" title="Preview" />
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: LIST (DEFAULT)
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-2 pl-2 sm:pl-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors duration-300">
        
        {/* Search */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
          <input 
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none pl-10 pr-4 py-3 text-[12px] font-bold text-slate-900 dark:text-white focus:ring-0 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto pr-2 pb-2 sm:pb-0 sm:pr-0">
          {client?.documents?.length > 0 && (
            <button 
              onClick={handleDownloadAll}
              disabled={isZipping}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {isZipping ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span className="hidden sm:inline">Export All</span>
            </button>
          )}
          <button 
            onClick={() => setView('upload')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-emerald-500 transition-all shadow-md active:scale-95"
          >
            <Plus size={14} /> Add Document
          </button>
        </div>
      </div>

      {/* Grid of Documents */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc._id}
              onClick={() => handleViewDoc(doc)}
              className="group bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-slate-400 dark:text-slate-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                  <FileText size={24} strokeWidth={1.5} />
                </div>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  {doc.docType}
                </span>
              </div>
              
              <div className="mt-auto">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <Calendar size={12} />
                  {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed p-12 text-center flex flex-col items-center justify-center min-h-100">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
            {searchQuery ? (
              <ShieldAlert size={32} className="text-slate-400 dark:text-slate-500" />
            ) : (
              <UploadCloud size={32} className="text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">
            {searchQuery ? 'No Matches Found' : 'Vault is Empty'}
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
            {searchQuery 
              ? `No documents match the term "${searchQuery}". Try adjusting your filters.` 
              : 'Upload KYC, mandates, or portfolio reports to securely store them in the client vault.'}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => setView('upload')}
              className="px-6 py-3 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center gap-2"
            >
              <Plus size={14} /> Upload First Document
            </button>
          )}
        </div>
      )}

    </div>
  );
};

export default ClientDocumentManager;