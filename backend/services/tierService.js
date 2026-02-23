const TIER_CONFIG = {
  DIAMOND: { min: 10000000, label: 'Diamond' }, // 1 CR
  GOLD: { min: 5000000, label: 'Gold' },       // 50 L
  SILVER: { min: 1000000, label: 'Silver' },   // 10 L
  BRONZE: { min: 0, label: 'Bronze' }          // < 10 L
};

exports.getCategoryByAum = (aum) => {
  if (aum >= TIER_CONFIG.DIAMOND.min) return TIER_CONFIG.DIAMOND.label;
  if (aum >= TIER_CONFIG.GOLD.min) return TIER_CONFIG.GOLD.label;
  if (aum >= TIER_CONFIG.SILVER.min) return TIER_CONFIG.SILVER.label;
  return TIER_CONFIG.BRONZE.label;
};