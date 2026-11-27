import { useMemo } from "react";

export const useClientData = (
  clients = [],
  searchTerm = "",
  filterTier = "All",
  quickFilter = "all",
  sortConfig = {},
  thresholds = null
) => {
  return useMemo(() => {
    if (!Array.isArray(clients) || clients.length === 0) {
      return { allFamilies: [], filteredFamilies: [], totalPortfolioAum: 0 };
    }

    const limits = thresholds || { diamond: 5, gold: 2, silver: 0.5, bronze: 0.1 };

    const getDynamicCategory = (aum) => {
      const aumInCr = (Number(aum) || 0) / 10000000;
      if (aumInCr >= limits.diamond) return "Diamond";
      if (aumInCr >= limits.gold) return "Gold";
      if (aumInCr >= limits.silver) return "Silver";
      return "Bronze";
    };

    // 1. Group Clients by Family
    const groups = {};
    clients.forEach((client) => {
      const fid = client.familyId || client._id;
      if (!groups[fid]) {
        groups[fid] = {
          head: null,
          allParticipants: [],
          totalFamilyAum: 0,
          latestUpdate: client.updatedAt || client.createdAt,
        };
      }
      const group = groups[fid];
      group.totalFamilyAum += Number(client.aum) || 0;

      const candidateDate = client.lastMet || client.updatedAt || client.createdAt;
      if (candidateDate) {
        const currentClientDate = new Date(candidateDate);
        const groupLatestDate = new Date(group.latestUpdate || 0);
        if (currentClientDate > groupLatestDate) {
          group.latestUpdate = candidateDate;
        }
      }

      if (client.isFamilyHead) group.head = client;
      group.allParticipants.push(client);
    });

    // Calculate total portfolio AUM across all families for relative share bars
    const totalPortfolioAum = Object.values(groups).reduce(
      (sum, g) => sum + g.totalFamilyAum,
      0
    );

    // 2. Generate Enriched Family View
    const now = new Date();
    const allFamilies = Object.values(groups)
      .map((group) => {
        // Fallback to highest AUM member if no explicit head flag
        const sortedParticipants = [...group.allParticipants].sort(
          (a, b) => (Number(b.aum) || 0) - (Number(a.aum) || 0)
        );
        const head = group.head || sortedParticipants[0];
        if (!head) return null;

        const lastTouchDate = group.latestUpdate ? new Date(group.latestUpdate) : null;
        const daysSinceUpdate = lastTouchDate
          ? Math.max(0, Math.floor((now - lastTouchDate) / (1000 * 60 * 60 * 24)))
          : 999;

        const hasMissingInfo = group.allParticipants.some((m) => {
          const invalidPan = !m.pan || m.pan.startsWith("TEMP_") || m.pan.length !== 10;
          const phone = m.contactDetails?.phoneNo;
          const invalidPhone = !phone || phone === "N/A" || phone.trim().length < 8;
          return invalidPan || invalidPhone;
        });

        return {
          ...head,
          members: sortedParticipants,
          familyAum: group.totalFamilyAum,
          aumSharePct:
            totalPortfolioAum > 0
              ? (group.totalFamilyAum / totalPortfolioAum) * 100
              : 0,
          category: getDynamicCategory(group.totalFamilyAum),
          latestUpdate: group.latestUpdate,
          daysSinceUpdate,
          isQuiet: daysSinceUpdate > 90,
          hasMissingInfo,
        };
      })
      .filter(Boolean);

    // 3. Filtering
    const searchStr = searchTerm.trim().toLowerCase();
    const filtered = allFamilies.filter((f) => {
      const headMatches =
        !searchStr ||
        f.name?.toLowerCase().includes(searchStr) ||
        f.pan?.toLowerCase().includes(searchStr) ||
        f.contactDetails?.phoneNo?.includes(searchStr);

      const memberMatches =
        searchStr.length > 0 &&
        f.members.some(
          (m) =>
            m.name?.toLowerCase().includes(searchStr) ||
            (m.pan && m.pan.toLowerCase().includes(searchStr))
        );

      f.shouldAutoExpand = searchStr.length > 0 && memberMatches;

      const matchesTier =
        filterTier === "All" ||
        f.category === filterTier ||
        (filterTier === "Attention" && f.isQuiet);

      const matchesQuickFilter =
        quickFilter === "all" ||
        (quickFilter === "attention" && f.isQuiet) ||
        (quickFilter === "families" && f.members.length > 1) ||
        (quickFilter === "individuals" && f.members.length === 1) ||
        (quickFilter === "incomplete" && f.hasMissingInfo);

      return (headMatches || memberMatches) && matchesTier && matchesQuickFilter;
    });

    // 4. Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "aum") {
          aValue = a.familyAum;
          bValue = b.familyAum;
        } else if (sortConfig.key === "updatedAt") {
          aValue = new Date(a.latestUpdate || 0).getTime();
          bValue = new Date(b.latestUpdate || 0).getTime();
        } else if (sortConfig.key === "members") {
          aValue = a.members.length;
          bValue = b.members.length;
        } else if (typeof aValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue || "")
            : (bValue || "").localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return { allFamilies, filteredFamilies: filtered, totalPortfolioAum };
  }, [clients, searchTerm, filterTier, quickFilter, sortConfig, thresholds]);
};