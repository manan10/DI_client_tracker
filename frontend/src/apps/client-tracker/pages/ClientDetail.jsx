import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Activity,
  Files,
  Lock,
  Users,
  ChevronRight,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  FolderTree,
  IndianRupee,
  Sparkles,
  Plus,
  Compass,
  ArrowRight,
  PieChart,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from "lucide-react";

import { useApi } from "../../../shared/hooks/useApi";
import Navbar from "../components/Shared/Navbar";
import InteractionModal from "../components/Shared/InteractionModal";
import ConfirmationModal from "../components/ClientDetail/ConfirmationModal";
import ClientDocumentManager from "../components/ClientDetail/ClientDocumentManager";
import ClientProfileHeader from "../components/ClientDetail/ClientProfileHeader";
import AuditTrail from "../components/ClientDetail/AuditTrail";

// Enterprise Tier Badging with clean, vivid styling
const TierBadge = ({ category }) => {
  const styles = {
    Diamond:
      "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 ring-1 ring-cyan-500/20",
    Gold: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 ring-1 ring-amber-500/20",
    Silver:
      "bg-slate-200/80 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 ring-1 ring-slate-400/20",
    Bronze:
      "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30 ring-1 ring-orange-500/20",
  };
  const activeStyle = styles[category] || styles.Silver;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border shadow-xs transition-transform duration-200 hover:scale-105 ${activeStyle}`}
    >
      <Sparkles className="size-3.5 shrink-0" />
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
  const loadFamilyData = useCallback(
    async (clientData, isMounted = { current: true }) => {
      const validFamId = clientData?.familyId?.trim();

      if (
        validFamId &&
        validFamId !== "" &&
        validFamId !== "undefined" &&
        validFamId !== "null"
      ) {
        try {
          const familyRes = await request(
            `/clients?familyId=${encodeURIComponent(validFamId)}`,
          );
          if (!isMounted.current) return;

          let membersList =
            familyRes?.data ||
            familyRes?.clients ||
            (Array.isArray(familyRes) ? familyRes : []);
          membersList = membersList.filter(
            (m) => m?.familyId?.trim() === validFamId,
          );

          // Explicitly fetch full profiles for members if interaction logs are not populated
          const needsFullFetch = membersList.some(
            (m) => !m.interactions || !Array.isArray(m.interactions),
          );

          if (needsFullFetch) {
            const fullMembersData = await Promise.all(
              membersList.map((m) => request(`/clients/${m._id || m.id}`)),
            );
            membersList = fullMembersData
              .map((res) => res?.data || res)
              .filter(Boolean);
          }

          if (!membersList.some((m) => m._id === clientData._id)) {
            membersList.push(clientData);
          } else {
            membersList = membersList.map((m) =>
              m._id === clientData._id ? clientData : m,
            );
          }

          setFamilyMembers(membersList);
        } catch (err) {
          console.error("Family fetch failed, defaulting to solo", err);
          if (isMounted.current) setFamilyMembers([clientData]);
        }
      } else {
        if (isMounted.current) setFamilyMembers([clientData]);
      }
    },
    [request],
  );

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
        if (isMounted.current)
          console.error("Initial profile load failed", err);
      }
    };

    initLoad();
    return () => {
      isMounted.current = false;
    };
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
      const sorted = [...familyMembers].sort(
        (a, b) => (b.aum || 0) - (a.aum || 0),
      );
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
        .sort(
          (a, b) =>
            new Date(b.date || b.createdAt || 0) -
            new Date(a.date || a.createdAt || 0),
        );
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

    return allLogs.sort(
      (a, b) =>
        new Date(b.date || b.createdAt || 0) -
        new Date(a.date || a.createdAt || 0),
    );
  }, [auditScope, familyMembers, client]);

  const initiateDelete = (interactionId) => {
    setInteractionToDelete(interactionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!interactionToDelete) return;
    setIsDeleting(true);
    try {
      const res = await request(
        `/interactions/${interactionToDelete}`,
        "DELETE",
      );
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

  const clientShare =
    totalFamilyAum > 0
      ? (((client?.aum || 0) / totalFamilyAum) * 100).toFixed(1)
      : "100.0";

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <Navbar />
        <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="size-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <ShieldAlert className="size-6 text-emerald-500 absolute animate-pulse" />
          </div>
          <div className="animate-pulse text-xs font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Loading Client Portfolio...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-100/80 via-slate-50 to-slate-100 dark:from-[#06080F] dark:via-[#090D16] dark:to-[#06080F] text-slate-900 dark:text-slate-100 pb-24 transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      <ClientProfileHeader client={client} />

      {/* MAIN DOCUMENT PAGE CONTAINER */}
      <main className="w-full max-w-384 mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 -mt-4 relative z-20 animate-in fade-in duration-300">
        {/* UNIFIED PAGE SURFACE CONTAINER */}
        <div className="bg-white/95 dark:bg-[#0C111C]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/3 dark:shadow-none overflow-hidden">
          {/* ======================================================== */}
          {/* SECTION 1: TOP HERO OVERVIEW BAR WITH AMBIENT GRADIENTS   */}
          {/* ======================================================== */}
          <div className="relative p-6 sm:p-8 lg:p-10 border-b border-slate-200 dark:border-white/10 overflow-hidden bg-linear-to-r from-emerald-500/5 via-teal-500/2 to-transparent dark:from-emerald-500/8 dark:via-cyan-500/3 dark:to-transparent">
            {/* Cinematic Background Glows */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 blur-[90px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-20 right-0 w-80 h-80 bg-teal-500/10 dark:bg-cyan-500/10 blur-[80px] pointer-events-none rounded-full" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Financial Key Figures */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-12">
                {/* Account AUM */}
                <div className="flex flex-col group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="size-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <IndianRupee className="size-3.5" strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
                      Account Investment
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-[1000] text-slate-900 dark:text-white font-mono tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      ₹{client.aum?.toLocaleString("en-IN") || 0}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">
                    Direct Account Balance
                  </span>
                </div>

                <div className="hidden sm:block h-14 w-px bg-slate-200 dark:bg-white/10" />

                {/* Total Family Wealth */}
                <div className="flex flex-col group">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="size-6 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
                      <TrendingUp className="size-3.5" strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">
                      Family Portfolio
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-[1000] text-teal-700 dark:text-teal-400 font-mono tracking-tight">
                      ₹{totalFamilyAum.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      {clientShare}% Share
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      across {familyMembers.length || 1}{" "}
                      {familyMembers.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block h-14 w-px bg-slate-200 dark:bg-white/10" />

                {/* Client Category */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-2">
                    Tier Classification
                  </span>
                  <div>
                    <TierBadge category={client.category} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-1.5">
                    Risk:{" "}
                    <span
                      className={
                        client.riskProfile === "Aggressive"
                          ? "text-rose-500 font-black"
                          : "text-slate-700 dark:text-slate-300 font-black"
                      }
                    >
                      {client.riskProfile || "Moderate"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Button with Micro-Animation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsInteractionModalOpen(true)}
                  className="px-5 py-3 bg-linear-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/35 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer select-none"
                >
                  <Plus className="size-4" strokeWidth={3} />
                  <span>Log Interaction</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: CLIENT DETAILS & FAMILY TREE STRIP            */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-slate-200 dark:border-white/10">
            {/* Left Column: Key Parameters */}
            <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/1.5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck
                    className="size-4 text-emerald-500"
                    strokeWidth={2.5}
                  />
                  Client Details
                </h3>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-white/5 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10">
                  ID #{client._id?.slice(-6).toUpperCase() || "RECORD"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-white dark:bg-[#0E1626] rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-colors shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 dark:text-slate-500">
                    <CreditCard className="size-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      PAN Number
                    </span>
                  </div>
                  <span className="font-mono font-black text-xs text-slate-900 dark:text-white tracking-wider uppercase">
                    {client.pan || "Not Available"}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-[#0E1626] rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-colors shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 dark:text-slate-500">
                    <Briefcase className="size-3.5 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Risk Level
                    </span>
                  </div>
                  <span
                    className={`font-black text-xs uppercase ${client.riskProfile === "Aggressive" ? "text-rose-500" : "text-slate-900 dark:text-white"}`}
                  >
                    {client.riskProfile || "Moderate"}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-[#0E1626] rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-colors shadow-xs sm:col-span-2">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 dark:text-slate-500">
                    <Mail className="size-3.5 text-teal-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Email Address
                    </span>
                  </div>
                  <span
                    className="font-medium text-xs text-slate-900 dark:text-white truncate block"
                    title={client.contactDetails?.email}
                  >
                    {client.contactDetails?.email || "Not Available"}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-[#0E1626] rounded-xl border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/40 transition-colors shadow-xs sm:col-span-2">
                  <div className="flex items-center gap-2 mb-1 text-slate-400 dark:text-slate-500">
                    <Phone className="size-3.5 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      Phone Contact
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {client.contactDetails?.phoneNo || "Not Available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Family Tree */}
            <div className="lg:col-span-7 p-6 sm:p-8 bg-white dark:bg-[#0C111C]">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderTree
                    className="size-4 text-emerald-500"
                    strokeWidth={2.5}
                  />
                  Family Members
                </h3>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {familyMembers.length || 1}{" "}
                  {familyMembers.length === 1 ? "Member" : "Members"} Total
                </span>
              </div>

              <div className="space-y-3">
                {/* Family Head */}
                {familyHead && (
                  <div
                    onClick={() =>
                      familyHead._id !== client._id &&
                      navigate(`/client/${familyHead._id}`)
                    }
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                      familyHead._id === client._id
                        ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/30"
                        : "bg-slate-50/70 dark:bg-[#0E1626] border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-800/80 cursor-pointer shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center shrink-0 font-black text-xs shadow-xs">
                        H
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {familyHead.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                            Head
                          </span>
                          {familyHead._id === client._id && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                          {familyHead.pan || "NO PAN"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{(familyHead.aum || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">
                          {(
                            ((familyHead.aum || 0) / (totalFamilyAum || 1)) *
                            100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                      {familyHead._id !== client._id && (
                        <ArrowUpRight className="size-4 text-slate-400 hover:text-emerald-500 transition-colors" />
                      )}
                    </div>
                  </div>
                )}

                {/* Family Children */}
                {children.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-3 border-l-2 border-slate-200 dark:border-white/10">
                    {children.map((child) => (
                      <div
                        key={child._id}
                        onClick={() =>
                          child._id !== client._id &&
                          navigate(`/client/${child._id}`)
                        }
                        className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2.5 ${
                          child._id === client._id
                            ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/30"
                            : "bg-slate-50/70 dark:bg-[#0E1626] border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-800/80 cursor-pointer shadow-xs"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {child.name}
                            </span>
                            {child._id === client._id && (
                              <span className="shrink-0 px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-emerald-600 text-white shadow-2xs">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase mt-0.5 truncate">
                            {child.pan || "NO PAN"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                              ₹{(child.aum || 0).toLocaleString("en-IN")}
                            </div>
                          </div>
                          {child._id !== client._id && (
                            <ChevronRight className="size-3.5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {children.length === 0 && (
                  <div className="pt-2 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100/70 dark:bg-white/2 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-white/5 inline-block">
                      Independent / Solo Portfolio
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: TABS & MAIN CONTENT WORKBENCH                 */}
          {/* ======================================================== */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* TAB CONTROLS & FILTER ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10 mb-6">
              {/* Primary Navigation Tabs */}
              <div className="flex items-center gap-2">
                {[
                  {
                    id: "interactions",
                    label: "Meeting & Call Logs",
                    icon: Activity,
                  },
                  { id: "documents", label: "Client Documents", icon: Files },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <TabIcon
                        className={`size-3.5 ${isActive ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400"}`}
                        strokeWidth={2.5}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* View Scope Toggle */}
              {activeTab === "interactions" && familyMembers.length > 1 && (
                <div className="inline-flex p-1 bg-slate-100 dark:bg-[#0B1120] rounded-xl border border-slate-200/80 dark:border-white/10 self-start sm:self-auto shadow-inner">
                  <button
                    onClick={() => setAuditScope("family")}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                      auditScope === "family"
                        ? "bg-white dark:bg-[#0E1626] text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/50 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    All Family Logs
                  </button>
                  <button
                    onClick={() => setAuditScope("client")}
                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                      auditScope === "client"
                        ? "bg-white dark:bg-[#0E1626] text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/50 dark:border-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    This Client Only
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENTS */}
            <div className="transition-all">
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
                <div className="p-2">
                  <ClientDocumentManager
                    client={client}
                    onRefresh={refreshClientData}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* GLOBAL MODALS */}
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
        title="Delete Interaction Entry"
        message="Are you sure you want to permanently remove this interaction log? This will also update the client's last met record."
      />
    </div>
  );
};

export default ClientDetail;
