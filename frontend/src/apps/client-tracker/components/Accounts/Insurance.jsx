import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useApi } from "../../../../shared/hooks/useApi";
import TabHeader from "../../../../shared/components/TabHeader";

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
      toast.error("Failed to fetch insurance policies");
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

  // Dynamically compute KPI stats for the selected person (or use server stats for ALL)
  const displayStats = useMemo(() => {
    if (selectedPerson === "ALL") {
      return stats;
    }

    const activeList = personFilteredPolicies.filter(
      (p) => p.status === "ACTIVE" || p.status === "GRACE_PERIOD"
    );

    const totalPureRiskCover = personFilteredPolicies
      .filter(
        (p) =>
          p.policyType === "LIFE_TERM" || p.policyType?.startsWith("HEALTH")
      )
      .reduce((sum, p) => sum + (p.sumAssured || 0), 0);

    const totalInvestmentValuation = personFilteredPolicies
      .filter((p) =>
        ["LIFE_ULIP", "PENSION_NPS", "LIFE_ENDOWMENT"].includes(p.policyType)
      )
      .reduce(
        (sum, p) =>
          sum + (p.investmentDetails?.currentValuation || p.sumAssured || 0),
        0
      );

    const annualizedPremium = activeList.reduce((sum, p) => {
      const amt = p.premiumAmount || 0;
      switch (p.premiumFrequency) {
        case "MONTHLY":
          return sum + amt * 12;
        case "QUARTERLY":
          return sum + amt * 4;
        case "HALF_YEARLY":
          return sum + amt * 2;
        default:
          return sum + amt;
      }
    }, 0);

    const now = new Date();
    const thirtyDaysOut = new Date();
    thirtyDaysOut.setDate(now.getDate() + 30);

    const upcomingDueCount = personFilteredPolicies.filter((p) => {
      if (p.isDueSoon) return true;
      if (!p.nextDueDate) return false;
      const due = new Date(p.nextDueDate);
      return due >= now && due <= thirtyDaysOut;
    }).length;

    return {
      totalPolicies: personFilteredPolicies.length,
      activePolicies: activeList.length,
      totalPureRiskCover,
      totalInvestmentValuation,
      annualizedPremium,
      upcomingDueCount,
    };
  }, [selectedPerson, stats, personFilteredPolicies]);

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
          toast.success("Policy updated");
          setIsModalOpen(false);
          setEditingPolicy(null);
          fetchPolicies();
        }
      } else {
        const res = await request("/insurance", "POST", payload);
        if (res?.success) {
          toast.success("Policy saved");
          setIsModalOpen(false);
          fetchPolicies();
        }
      }
    } catch (err) {
      console.error("Save Policy Error:", err);
      toast.error(err.message || "Failed to save policy");
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* COMPLEMENTARY TAB HEADER */}
      <TabHeader
        title="Insurance"
        accent="Holdings"
        description="Overview of active life, health, motor, and pension policies across the family."
      />

      {/* 1. DYNAMIC MEMBER-SCOPED KPIS */}
      <InsuranceExecutiveKPIs
        stats={displayStats}
        selectedPerson={selectedPerson}
      />

      {/* 2. MEMBER TABS & SEARCH BAR */}
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

      {/* 3. MAIN LEDGER VIEW */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2.5 bg-white dark:bg-[#161B26] rounded-lg border border-slate-200 dark:border-slate-800/80">
          <Loader2
            size={22}
            className="text-sky-600 dark:text-sky-400 animate-spin"
          />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Loading policies...
          </span>
        </div>
      ) : selectedPerson === "ALL" ? (
        <MemberSummaryGrid
          peopleList={peopleList}
          policies={policies}
          onSelectPerson={setSelectedPerson}
        />
      ) : (
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