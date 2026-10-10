import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useApi } from "../../../../shared/hooks/useApi";

import PolicyModal from "./Insurance/PolicyModal";
import InsuranceExecutiveKPIs from "./Insurance/InsuranceExecutiveKPIs";
import InsurancePersonTabs from "./Insurance/InsurancePersonTabs";
import MemberSummaryGrid from "./Insurance/MemberSummaryGrid";
import NestedPolicyLedger from "./Insurance/NestedPolicyLedger";
import { getNormalizedPersonName } from "./Insurance/insuranceUtils";

const Insurance = () => {
  const { request } = useApi();
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    totalPureRiskCover: 0,
    totalInvestmentValuation: 0,
    annualizedPremium: 0,
    upcomingDueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());

      const res = await request(`/insurance?${params.toString()}`);
      if (res?.success) {
        setPolicies(res.data || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load insurance records", err);
      toast.error("Failed to fetch insurance portfolio");
    } finally {
      setLoading(false);
    }
  }, [request, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPolicies();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchPolicies]);

  // Extract distinct list of members using FIRST and LAST name only
  const peopleList = useMemo(() => {
    const set = new Set();
    policies.forEach((p) => {
      const normalized = getNormalizedPersonName(p.policyHolder);
      if (normalized) {
        set.add(normalized);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [policies]);

  // Filter policies by normalized first + last name
  const personFilteredPolicies = useMemo(() => {
    if (selectedPerson === "ALL") return policies;
    return policies.filter(
      (p) =>
        getNormalizedPersonName(p.policyHolder).toLowerCase() ===
        selectedPerson.toLowerCase()
    );
  }, [policies, selectedPerson]);

  const handleSavePolicy = async (payload) => {
    try {
      setSaving(true);
      if (editingPolicy) {
        const res = await request(
          `/insurance/${editingPolicy._id}`,
          "PUT",
          payload
        );
        if (res?.success) {
          toast.success("Policy updated successfully");
          setIsModalOpen(false);
          setEditingPolicy(null);
          fetchPolicies();
        }
      } else {
        const res = await request("/insurance", "POST", payload);
        if (res?.success) {
          toast.success("Policy recorded successfully");
          setIsModalOpen(false);
          fetchPolicies();
        }
      }
    } catch (err) {
      console.error("Save Policy Error:", err);
      toast.error(err.message || "Failed to save policy record");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (policy) => {
    if (
      !window.confirm(
        `Delete record for ${policy.policyNumber} (${policy.providerName})?`
      )
    )
      return;
    try {
      const res = await request(`/insurance/${policy._id}`, "DELETE");
      if (res?.success) {
        toast.success("Policy removed");
        fetchPolicies();
      }
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Failed to delete policy");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. EXECUTIVE KPIS */}
      <InsuranceExecutiveKPIs stats={stats} />

      {/* 2. PERSON TABS & SEARCH COMMAND STRIP */}
      <InsurancePersonTabs
        peopleList={peopleList}
        policies={policies}
        selectedPerson={selectedPerson}
        onSelectPerson={setSelectedPerson}
        search={search}
        onSearchChange={setSearch}
        onOpenAddModal={() => {
          setEditingPolicy(null);
          setIsModalOpen(true);
        }}
      />

      {/* 3. CONDITIONAL MAIN VIEW */}
      {loading ? (
        <div className="py-20 text-center bg-white dark:bg-[#0F172A] rounded-md border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500">
          Loading insurance portfolio...
        </div>
      ) : selectedPerson === "ALL" ? (
        /* All Members View: High-density comparative ledger table */
        <MemberSummaryGrid
          peopleList={peopleList}
          policies={policies}
          onSelectPerson={setSelectedPerson}
        />
      ) : (
        /* Individual Member View: Grouped accordion sub-tables */
        <NestedPolicyLedger
          policies={personFilteredPolicies}
          onEditPolicy={(p) => {
            setEditingPolicy(p);
            setIsModalOpen(true);
          }}
          onDeletePolicy={handleDeletePolicy}
        />
      )}

      {/* 4. POLICY MODAL */}
      <PolicyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPolicy(null);
        }}
        onSave={handleSavePolicy}
        editingPolicy={editingPolicy}
        saving={saving}
      />
    </div>
  );
};

export default Insurance;