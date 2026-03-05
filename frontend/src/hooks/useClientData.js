import { useMemo } from 'react';

export const useClientData = (clients, searchTerm, filterTier, sortConfig, thresholds) => {
  return useMemo(() => {
    const limits = thresholds || { diamond: 5, gold: 2, silver: 0.5, bronze: 0.1 };

    const getDynamicCategory = (aum) => {
      const aumInCr = aum / 10000000;
      if (aumInCr >= limits.diamond) return 'Diamond';
      if (aumInCr >= limits.gold) return 'Gold';
      if (aumInCr >= limits.silver) return 'Silver';
      return 'Bronze';
    };

    const groups = {};
    clients.forEach(client => {
      const fid = client.familyId || client._id;
      if (!groups[fid]) {
        groups[fid] = { head: null, allParticipants: [], totalFamilyAum: 0, latestUpdate: client.updatedAt };
      }
      const group = groups[fid];
      group.totalFamilyAum += (Number(client.aum) || 0);
      
      const currentClientDate = new Date(client.updatedAt);
      const groupLatestDate = new Date(group.latestUpdate);
      if (currentClientDate > groupLatestDate) group.latestUpdate = client.updatedAt;
      
      if (client.isFamilyHead) group.head = client;
      group.allParticipants.push(client);
    });

    // 2. Generate All Families with Dynamic Categorization
    const allFamilies = Object.values(groups).map(group => {
      const head = group.head || group.allParticipants[0];
      if (!head) return null;
      
      const daysSinceUpdate = (new Date() - new Date(group.latestUpdate)) / (1000 * 60 * 60 * 24);
      
      return {
        ...head,
        members: group.allParticipants,
        familyAum: group.totalFamilyAum,
        // Using our new dynamic logic here
        category: getDynamicCategory(group.totalFamilyAum),
        latestUpdate: group.latestUpdate,
        isQuiet: daysSinceUpdate > 90
      };
    }).filter(Boolean);

    // 3. Filtering Logic (Stays largely same)
    let filtered = allFamilies.filter((f) => {
      const searchStr = searchTerm.toLowerCase();
      const headMatches = f.name?.toLowerCase().includes(searchStr) || f.pan?.toLowerCase().includes(searchStr);
      const memberMatches = f.members.some(m => 
        m.name.toLowerCase().includes(searchStr) || (m.pan && m.pan.toLowerCase().includes(searchStr))
      );
      
      f.shouldAutoExpand = searchTerm.length > 0 && memberMatches;

      const matchesTier = filterTier === "All" || 
                         f.category === filterTier || 
                         (filterTier === "Attention" && f.isQuiet);

      return (headMatches || memberMatches) && matchesTier;
    });

    // 4. Sorting Logic
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'aum') { aValue = a.familyAum; bValue = b.familyAum; }
        if (sortConfig.key === "updatedAt") { aValue = new Date(a.latestUpdate); bValue = new Date(b.latestUpdate); }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return { allFamilies, filteredFamilies: filtered };
  }, [clients, searchTerm, filterTier, sortConfig, thresholds]);
};