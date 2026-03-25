/**
 * Groups accounts by the first word of their name (Owner)
 */
export const groupAccountsByOwner = (accounts) => {
  return accounts.reduce((groups, acc) => {
    const rawOwner = acc.name.split(' ')[0] || 'Other';
    const ownerKey = rawOwner.toUpperCase();
    if (!groups[ownerKey]) {
      groups[ownerKey] = {
        name: rawOwner.charAt(0).toUpperCase() + rawOwner.slice(1).toLowerCase(),
        list: []
      };
    }
    groups[ownerKey].list.push(acc);
    return groups;
  }, {});
};

/**
 * Calculates current total and growth compared to previous history
 */
export const calculatePerformance = (inputValues, history) => {
  const currentTotal = Object.values(inputValues).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const lastTotal = (history[0]?.totalBalance || 0) / 100000;
  return {
    currentTotal,
    growth: currentTotal - lastTotal
  };
};