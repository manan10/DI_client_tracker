import React, { useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  X, FileText, UploadCloud, ChevronRight, FilePlus, 
  ArrowLeft, Trash2, ExternalLink, Loader2, Download, Search 
} from 'lucide-react';
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../../firebase"; 
import { useApi } from "../../../hooks/useApi";
import DocumentUploadForm from './DocumentUploadForm';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const DocumentManagerModal = ({ isOpen, onClose, client, onRefresh }) => {
  const [view, setView] = useState('list'); 
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { request } = useApi();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView('list');
      setSelectedDoc(null);
      setSearchQuery('');
    }, 300); 
  };

  const handleUploadSuccess = () => {
    setView('list');
    if (onRefresh) onRefresh();
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
    const confirmDelete = window.confirm(`Permanently delete "${doc.name}"?`);
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
      setSelectedDoc(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[110]" onClose={handleClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-[#0B0F19] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-6xl border border-white/5">
                
                <div className="flex h-[80vh] min-h-[600px]">
                  {/* LEFT SIDEBAR */}
                  <div className="w-1/3 border-r border-white/5 flex flex-col bg-[#0B0F19]">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                      <div className="truncate pr-2">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                          {view === 'list' ? 'Client Vault' : 'Upload'}
                        </h3>
                        <p className="text-[10px] text-orange-500 font-bold uppercase mt-1 tracking-wider truncate">
                          {client?.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {view === 'list' && (client?.documents?.length > 0) && (
                          <button 
                            onClick={handleDownloadAll}
                            disabled={isZipping}
                            className="p-2.5 bg-white/5 text-slate-400 hover:text-orange-500 rounded-xl transition-all border border-white/5"
                            title="Download All as ZIP"
                          >
                            {isZipping ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                          </button>
                        )}
                        <button 
                          onClick={() => setView(view === 'list' ? 'upload' : 'list')}
                          className="p-2.5 bg-white text-black rounded-xl transition-all shadow-lg active:scale-95"
                        >
                          {view === 'list' ? <FilePlus size={18} /> : <ArrowLeft size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* DARK THEMED SEARCH BAR */}
                    {view === 'list' && (
                      <div className="px-6 py-4 border-b border-white/5">
                        <div className="relative group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={14} />
                          <input 
                            type="text"
                            placeholder="Filter vault..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-bold text-white focus:ring-1 focus:ring-orange-500/50 outline-none transition-all placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                      {view === 'list' ? (
                        filteredDocuments.length > 0 ? (
                          <div className="space-y-2">
                            {filteredDocuments.map((doc) => (
                              <button
                                key={doc._id}
                                onClick={() => setSelectedDoc(doc)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                                  selectedDoc?._id === doc._id 
                                  ? 'bg-orange-500/10 border-orange-500/30' 
                                  : 'border-white/5 hover:bg-white/[0.02]'
                                }`}
                              >
                                <div className="flex items-center gap-4 text-left truncate">
                                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${selectedDoc?._id === doc._id ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                    <FileText size={18} />
                                  </div>
                                  <div className="truncate">
                                    <p className={`text-[11px] font-black uppercase tracking-tight truncate ${selectedDoc?._id === doc._id ? 'text-orange-500' : 'text-slate-200'}`}>
                                      {doc.name}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">{doc.docType}</p>
                                  </div>
                                </div>
                                <ChevronRight size={14} className={`flex-shrink-0 ${selectedDoc?._id === doc._id ? 'text-orange-500' : 'text-slate-700'}`} />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
                            <UploadCloud size={48} strokeWidth={1} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center px-4">
                              {searchQuery ? 'No matching records' : 'Vault is empty'}
                            </p>
                          </div>
                        )
                      ) : (
                        <DocumentUploadForm client={client} onUploadSuccess={handleUploadSuccess} onCancel={() => setView('list')} />
                      )}
                    </div>
                  </div>

                  {/* PREVIEW AREA */}
                  <div className="w-2/3 bg-black flex flex-col relative">
                    <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                        {selectedDoc && (
                            <a href={selectedDoc.downloadUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-orange-500 transition-all">
                                <ExternalLink size={18} />
                            </a>
                        )}
                        <button onClick={handleClose} className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                      {selectedDoc ? (
                        <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-inner">
                           <iframe src={selectedDoc.downloadUrl} className="w-full h-full border-none" title="Preview" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white/[0.03] rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/5">
                            <FileText size={32} className="text-slate-800" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Preview Intelligence</p>
                          <p className="text-[9px] text-slate-800 uppercase font-bold mt-2 tracking-widest italic">Select a record</p>
                        </div>
                      )}
                    </div>

                    {selectedDoc && (
                        <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    Date: <span className="text-slate-200 ml-1">{new Date(selectedDoc.uploadedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">
                                    Type: <span className="text-orange-500 ml-1">{selectedDoc.docType}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleDeleteDoc(selectedDoc)}
                                disabled={isDeleting}
                                className="flex items-center gap-2 text-[9px] font-black text-red-500 hover:text-red-400 disabled:text-slate-700 uppercase tracking-widest transition-all"
                            >
                                {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                {isDeleting ? 'Removing...' : 'Remove File'}
                            </button>
                        </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default DocumentManagerModal;