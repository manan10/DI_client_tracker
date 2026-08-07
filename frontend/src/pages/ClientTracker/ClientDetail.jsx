import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Files,
  Lock,
  Users,
  ChevronRight,
  ShieldAlert,
  Phone,
  Mail,
  Network,
  CreditCard,
  Briefcase
} from "lucide-react";
import { useApi } from "../../hooks/useApi";
import Navbar from "../../components/Navbar";
import InteractionModal from "../../components/InteractionModal";
import ConfirmationModal from "../../components/ClientDetail/ConfirmationModal";
import ClientDocumentManager from "../../components/ClientDetail/ClientDocumentManager";

// Split Components
import ClientProfileHeader from "../../components/ClientDetail/ClientProfileHeader";
import AuditTrail from "../../components/ClientDetail/AuditTrail";

// Helper for Tier Badging
const TierBadge = ({ category }) => {
  const styles = {
    Diamond: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Gold: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Silver: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    Bronze: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
  };
  const activeStyle = styles[category] || styles.Silver;
  
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${activeStyle}`}>
      {category || "Silver"}
    </span>
  );
};

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();

  // Core States
  const [client, setClient] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [activeTab, setActiveTab] = useState("interactions");
  const [auditScope, setAuditScope] = useState("family"); 

  // Interaction/Modal States
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [filterDate, setFilterDate] = useState(null);

  // Custom Deletion States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [interactionToDelete, setInteractionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * DATA FIX: Ensure family interactions are fetched
   */
  const loadFamilyData = useCallback(async (clientData, isMounted = { current: true }) => {
    const validFamId = clientData?.familyId?.trim();
    
    if (validFamId && validFamId !== "" && validFamId !== "undefined" && validFamId !== "null") {
      try {
        const familyRes = await request(`/clients?familyId=${encodeURIComponent(validFamId)}`);
        if (!isMounted.current) return;

        let membersList = familyRes?.data || familyRes?.clients || (Array.isArray(familyRes) ? familyRes : []);
        membersList = membersList.filter(m => m?.familyId?.trim() === validFamId);

        // DATA SYNC FIX: If list APIs don't return the heavy 'interactions' array,
        // we explicitly fetch the full profile for each family member to get their logs.
        const needsFullFetch = membersList.some(m => !m.interactions || !Array.isArray(m.interactions));
        
        if (needsFullFetch) {
            const fullMembersData = await Promise.all(
                membersList.map(m => request(`/clients/${m._id || m.id}`))
            );
            membersList = fullMembersData.map(res => res?.data || res).filter(Boolean);
        }

        // Guarantee current client is injected with latest interactions
        if (!membersList.some(m => m._id === clientData._id)) {
          membersList.push(clientData);
        } else {
            // Replace the list version with our fully loaded current client version
            membersList = membersList.map(m => m._id === clientData._id ? clientData : m);
        }

        setFamilyMembers(membersList);
      } catch (err) {
        console.error("Family fetch failed, defaulting to solo", err);
        if (isMounted.current) setFamilyMembers([clientData]);
      }
    } else {
      if (isMounted.current) setFamilyMembers([clientData]);
    }
  }, [request]);

  const refreshClientData = useCallback(async () => {
    try {
      const res = await request(`/clients/${id}`);
      const clientData = res?.data || res || null;
      setClient(clientData);
      
      if (clientData) {
        await loadFamilyData(clientData);
      }
    } catch (err) {
      console.error("Failed to refresh client profile", err);
    }
  }, [id, request, loadFamilyData]);

  useEffect(() => {
    const isMounted = { current: true };
    
    setClient(null);
    setFamilyMembers([]);

    const initLoad = async () => {
      try {
        const res = await request(`/clients/${id}`);
        const clientData = res?.data || res || null;
        if (!isMounted.current) return;
        setClient(clientData);
        if (clientData) await loadFamilyData(clientData, isMounted);
      } catch (err) {
        if (isMounted.current) console.error("Initial profile load failed", err);
      }
    };
    
    initLoad();
    return () => { isMounted.current = false; };
  }, [id, request, loadFamilyData]);

  /**
   * Calculated Family Aggregates & Tree Structure
   */
  const totalFamilyAum = useMemo(() => {
    if (!familyMembers.length) return client?.aum || 0;
    return familyMembers.reduce((sum, member) => sum + (member.aum || 0), 0);
  }, [familyMembers, client]);

  const { familyHead, children } = useMemo(() => {
    if (!familyMembers.length) return { familyHead: client, children: [] };
    
    let head = familyMembers.find((m) => m.isFamilyHead);
    if (!head) {
      const sorted = [...familyMembers].sort((a, b) => (b.aum || 0) - (a.aum || 0));
      head = sorted[0];
    }
    
    const kids = familyMembers.filter((m) => m._id !== head?._id);
    return { familyHead: head, children: kids };
  }, [familyMembers, client]);

  /**
   * Cross-Family Interaction Merger
   */
  const combinedInteractions = useMemo(() => {
    if (auditScope === "client" || familyMembers.length <= 1) {
      return (client?.interactions || [])
        .map((i) => ({
          ...i,
          memberName: client?.name,
          isCurrentClient: true,
        }))
        .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
    }

    const allLogs = [];
    const processedIds = new Set(); 

    familyMembers.forEach((member) => {
      if (member.interactions && Array.isArray(member.interactions)) {
        member.interactions.forEach((log) => {
          const logId = log._id || log.id || Math.random();
          if (!processedIds.has(logId)) {
            processedIds.add(logId);
            allLogs.push({
              ...log,
              memberName: member.name,
              memberId: member._id,
              isCurrentClient: member._id === client?._id,
            });
          }
        });
      }
    });

    return allLogs.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
  }, [auditScope, familyMembers, client]);

  const initiateDelete = (interactionId) => {
    setInteractionToDelete(interactionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!interactionToDelete) return;
    setIsDeleting(true);
    try {
      const res = await request(`/interactions/${interactionToDelete}`, "DELETE");
      if (res?.success || res?.status === 200) {
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

  if (!client) {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-300">
      <Navbar />

      <ClientProfileHeader client={client} />

      <div className="max-w-350 mx-auto px-6 lg:px-12 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: UNIFIED INTELLIGENCE HUB */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
              
              {/* Top Panel: Account specifics */}
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldAlert className="size-4 text-emerald-500" />
                      Unified Intelligence
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Account & Portfolio Context
                    </p>
                  </div>
                  <TierBadge category={client.category} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      This Account AUM
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ₹{client.aum?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1 items-center gap-1">
                      <Network className="size-3" /> Total Family AUM
                    </span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      ₹{totalFamilyAum.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Contact & Technical Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <CreditCard className="size-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PAN</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                        {client.pan || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Mail className="size-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        {client.contactDetails?.email || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Phone className="size-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {client.contactDetails?.phoneNo || "N/A"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Briefcase className="size-4 text-slate-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Profile</span>
                      <span className={`font-bold ${client.riskProfile === 'Aggressive' ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
                        {client.riskProfile || "Moderate"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Panel: REDESIGNED Visual Family Tree */}
              <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950/30">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                  <Users className="size-3.5" /> Organizational Hierarchy
                </h4>

                <div className="flex flex-col w-full">
                  {/* ROOT NODE (Family Head) */}
                  {familyHead && (
                    <div 
                      onClick={() => familyHead._id !== client._id && navigate(`/client/${familyHead._id}`)}
                      className={`relative z-10 bg-white dark:bg-slate-900 border ${familyHead._id !== client._id ? 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 cursor-pointer shadow-sm hover:shadow-md' : 'border-emerald-500 ring-1 ring-emerald-500 shadow-md'} rounded-xl p-4 flex items-center justify-between group transition-all duration-200`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {familyHead.name}
                          </span>
                          {familyHead._id === client._id && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500 text-white shadow-sm">Current</span>
                          )}
                          <span className="px-1.5 py-0.5 mr-3 rounded text-[8px] font-black uppercase bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900">Head</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{familyHead.pan || 'NO PAN'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            ₹{(familyHead.aum || 0).toLocaleString("en-IN")}
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                            {(((familyHead.aum || 0) / (totalFamilyAum || 1)) * 100).toFixed(1)}%
                          </div>
                        </div>
                        {familyHead._id !== client._id && (
                          <ChevronRight className="size-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* BRANCHES (Children) */}
                  {children.length > 0 && (
                    <div className="flex flex-col ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-800 mt-4 gap-3">
                      {children.map((child) => (
                        <div 
                          key={child._id} 
                          onClick={() => child._id !== client._id && navigate(`/client/${child._id}`)}
                          className={`relative bg-white dark:bg-slate-900 border ${child._id !== client._id ? 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 cursor-pointer shadow-sm hover:shadow' : 'border-emerald-500 ring-1 ring-emerald-500 shadow-md'} rounded-xl p-3.5 flex items-center justify-between group transition-all duration-200`}
                        >
                          {/* Left visual connector */}
                          <div className="absolute -left-4.5 top-1/2 w-4 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-r-full"></div>

                          <div className="flex flex-col min-w-0 pr-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                                {child.name}
                              </span>
                              {child._id === client._id && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-500 text-white shadow-sm">Current</span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 mt-0.5 truncate">{child.pan || 'NO PAN'}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                                ₹{(child.aum || 0).toLocaleString("en-IN")}
                              </div>
                            </div>
                            {child._id !== client._id && (
                              <ChevronRight className="size-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {children.length === 0 && (
                    <div className="pt-6 text-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        Solo Portfolio
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Tabs & Primary Content */}
          <div className="lg:col-span-7">
            {/* Main Primary Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-8">
                {[
                  { id: "interactions", label: "Interactions", icon: <Activity size={14} /> },
                  { id: "documents", label: "Docs", icon: <Files size={14} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-emerald-500 text-emerald-500 dark:text-white"
                        : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
                <button 
                  disabled 
                  className="flex items-center gap-2 pb-4 text-[11px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700 cursor-not-allowed whitespace-nowrap"
                >
                  Portfolio <Lock size={10} className="ml-1" />
                </button>
              </div>

              {/* Your Scope Toggle for Multi-Member Families stays right here */}
            </div>

            {/* REDESIGNED iOS-Style Segmented Toggle */}
            {activeTab === "interactions" && familyMembers.length > 1 && (
              <div className="flex mb-6 w-full max-w-sm">
                <div className="flex w-full p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner relative">
                    <button
                        onClick={() => setAuditScope("family")}
                        className={`flex-1 relative z-10 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
                        auditScope === "family"
                            ? "text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-black/5"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        All Family Interactions
                    </button>
                    <button
                        onClick={() => setAuditScope("client")}
                        className={`flex-1 relative z-10 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
                        auditScope === "client"
                            ? "text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-black/5"
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        Selected Client Only
                    </button>
                </div>
              </div>
            )}

            {/* Render Views */}
            {activeTab === "interactions" && (
              <AuditTrail
                interactions={combinedInteractions}
                filterDate={filterDate}
                setFilterDate={setFilterDate}
                onAddClick={() => setIsInteractionModalOpen(true)}
                onEditClick={(log) => {
                  setEditingInteraction(log);
                  setIsInteractionModalOpen(true);
                }}
                onDeleteClick={initiateDelete}
              />
            )}

            {activeTab === "documents" && (
              <ClientDocumentManager client={client} onRefresh={refreshClientData} />
            )}
          </div>
        </div>
      </div>

      {/* Global Modals */}
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInteractionToDelete(null);
        }}
        onConfirm={confirmDelete}
        loading={isDeleting}
        title="Redact Audit Entry"
        message="Are you sure you want to permanently remove this interaction? This will automatically recalculate the client's 'Last Met' parameters."
      />
    </div>
  );
};

export default ClientDetail;