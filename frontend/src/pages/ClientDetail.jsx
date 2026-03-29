import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Activity, Files, Lock } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import Navbar from '../components/Navbar';
import InteractionModal from '../components/InteractionModal';
import ConfirmationModal from '../components/ClientDetail/ConfirmationModal';
import ClientDocumentManager from '../components/ClientDetail/ClientDocumentManager';

// Split Components
import ClientProfileHeader from '../components/ClientDetail/ClientProfileHeader';
import AccountIntelligence from '../components/ClientDetail/AccountIntelligence';
import AuditTrail from '../components/ClientDetail/AuditTrail';

const ClientDetail = () => {
  const { id } = useParams();
  const { request, loading } = useApi();
  
  // Core States
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('interactions');
  
  // Interaction/Modal States
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  // Custom Deletion States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [interactionToDelete, setInteractionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Refresh Client Data
   * Re-fetches the full client object to sync Timeline and Sidebar stats
   */
  const refreshClientData = useCallback(async () => {
    try {
      const data = await request(`/clients/${id}`);
      setClient(data);
    } catch (err) {
      console.error("Failed to refresh client profile", err);
    }
  }, [id, request]);

  /**
   * Initial Data Load
   * Uses mount check to satisfy ESLint and prevent cascading renders
   */
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await request(`/clients/${id}`);
        if (isMounted) setClient(data);
      } catch (err) {
        if (isMounted) console.error("Initial load failed", err);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [id, request]);

  /**
   * Delete Logic
   * 1. initiateDelete: Opens custom modal and saves the ID
   * 2. confirmDelete: Actually calls the DELETE API
   */
  const initiateDelete = (interactionId) => {
    setInteractionToDelete(interactionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!interactionToDelete) return;
    setIsDeleting(true);
    try {
      const res = await request(`/interactions/${interactionToDelete}`, 'DELETE');
      if (res.success) {
        await refreshClientData();
        setIsDeleteModalOpen(false);
        setInteractionToDelete(null);
      }
    } catch (err) { 
      console.error("Deletion failed", err); 
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Edit Logic
   * Passes the log object to the InteractionModal to trigger "Revision Mode"
   */
  const handleEditInteraction = (log) => {
    setEditingInteraction(log);
    setIsInteractionModalOpen(true);
  };

  if (loading && !client) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <Navbar />
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
            Decrypting Profile...
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-300">
      <Navbar />

      <ClientProfileHeader client={client} />

      <div className="max-w-360 mx-auto px-6 lg:px-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          <AccountIntelligence client={client} />

          <div className="lg:col-span-8">
            {/* Nav Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto custom-scrollbar">
              {[
                { id: 'interactions', label: 'Audit Trail', icon: <Activity size={14} /> },
                { id: 'documents', label: 'Vault', icon: <Files size={14} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-emerald-500 text-slate-900 dark:text-white' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button disabled className="flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 cursor-not-allowed">
                Portfolio <Lock size={10} className="ml-1" />
              </button>
            </div>

            {/* Content Switcher */}
            {activeTab === 'interactions' && (
              <AuditTrail 
                interactions={client.interactions}
                filterDate={filterDate}
                setFilterDate={setFilterDate}
                onAddClick={() => setIsInteractionModalOpen(true)}
                onEditClick={handleEditInteraction}
                onDeleteClick={initiateDelete}
              />
            )}

            {activeTab === 'documents' && (
              <ClientDocumentManager client={client} onRefresh={refreshClientData} />
            )}
          </div>
        </div>
      </div>

      {/* Global Modals */}
      
      {/* 1. Log/Edit Interaction Modal */}
      <InteractionModal 
        isOpen={isInteractionModalOpen} 
        onClose={() => { 
          setIsInteractionModalOpen(false); 
          setEditingInteraction(null); 
        }} 
        onRefresh={refreshClientData} 
        initialClient={client}
        editingData={editingInteraction}
      />

      {/* 2. Custom Deletion Confirmation */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setInteractionToDelete(null);
        }}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Redact Audit Entry"
        message="Are you sure you want to permanently remove this interaction from the corporate ledger? This will automatically recalculate the client's 'Last Met' date."
      />

    </div>
  );
};

export default ClientDetail;