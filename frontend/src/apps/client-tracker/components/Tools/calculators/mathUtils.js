/**
 * Indian Currency & Advisory Financial Math Utilities
 * Dalal Investments — Private Wealth Desk
 */

export const formatINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
};

export const formatINRCompact = (amount) => {
  const abs = Math.abs(amount || 0);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  return `${sign}${formatINR(abs)}`;
};

/**
 * 1. SIP & Step-Up SIP Engine (Month-by-month compounding)
 */
export const calculateStepUpSip = ({
  monthlySip = 10000,
  annualReturnPct = 12,
  years = 15,
  stepUpPct = 0,
}) => {
  const monthlyRate = annualReturnPct / 100 / 12;
  let currentSip = monthlySip;
  let corpus = 0;
  let totalInvested = 0;
  const yearlySchedule = [];

  for (let yr = 1; yr <= years; yr++) {
    let yearInvested = 0;
    for (let m = 1; m <= 12; m++) {
      totalInvested += currentSip;
      yearInvested += currentSip;
      corpus = (corpus + currentSip) * (1 + monthlyRate);
    }

    yearlySchedule.push({
      year: yr,
      monthlySip: Math.round(currentSip),
      yearInvested: Math.round(yearInvested),
      totalInvested: Math.round(totalInvested),
      wealthGained: Math.round(corpus - totalInvested),
      endBalance: Math.round(corpus),
    });

    currentSip = currentSip * (1 + stepUpPct / 100);
  }

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(corpus),
    wealthGained: Math.round(corpus - totalInvested),
    finalMonthlySip: Math.round(
      monthlySip * Math.pow(1 + stepUpPct / 100, Math.max(0, years - 1))
    ),
    yearlySchedule,
  };
};

/**
 * 2. Lumpsum & Post-Tax FD vs. Mutual Fund Engine
 */
export const calculateLumpsum = ({
  principal = 500000,
  annualReturnPct = 12,
  years = 10,
  fdReturnPct = 7,
  taxSlabPct = 30,
  inflationPct = 6,
}) => {
  const mfFutureValue = principal * Math.pow(1 + annualReturnPct / 100, years);
  const mfGrossGain = Math.max(0, mfFutureValue - principal);

  // Equity MF LTCG: 12.5% above ₹1.25L annual exemption (for holding > 1 yr)
  const taxableMfGain = years >= 1 ? Math.max(0, mfGrossGain - 125000) : mfGrossGain;
  const mfTaxRate = years >= 1 ? 0.125 : 0.2;
  const mfTax = taxableMfGain * mfTaxRate;
  const mfPostTaxValue = mfFutureValue - mfTax;

  // FD: Interest taxed annually at slab rate -> effective post-tax compounding rate
  const fdPostTaxRate = (fdReturnPct / 100) * (1 - taxSlabPct / 100);
  const fdPostTaxValue = principal * Math.pow(1 + fdPostTaxRate, years);

  // Inflation-adjusted (Real Value in Today's Terms)
  const inflationFactor = Math.pow(1 + inflationPct / 100, years);
  const mfRealValue = mfPostTaxValue / inflationFactor;
  const fdRealValue = fdPostTaxValue / inflationFactor;

  const yearlySchedule = [];
  for (let yr = 1; yr <= years; yr++) {
    yearlySchedule.push({
      year: yr,
      mfValue: Math.round(principal * Math.pow(1 + annualReturnPct / 100, yr)),
      fdPostTaxValue: Math.round(principal * Math.pow(1 + fdPostTaxRate, yr)),
    });
  }

  return {
    principal: Math.round(principal),
    mfFutureValue: Math.round(mfFutureValue),
    mfGrossGain: Math.round(mfGrossGain),
    mfPostTaxValue: Math.round(mfPostTaxValue),
    fdPostTaxValue: Math.round(fdPostTaxValue),
    mfRealValue: Math.round(mfRealValue),
    fdRealValue: Math.round(fdRealValue),
    postTaxAdvantage: Math.round(mfPostTaxValue - fdPostTaxValue),
    yearlySchedule,
  };
};

/**
 * 3. Crorepati / Target Corpus Reverse SIP Engine
 */
export const calculateTargetSip = ({
  targetCorpus = 10000000,
  existingSavings = 0,
  annualReturnPct = 12,
  years = 15,
  stepUpPct = 0,
}) => {
  const futureValueOfExisting =
    existingSavings * Math.pow(1 + annualReturnPct / 100, years);
  const remainingTarget = Math.max(0, targetCorpus - futureValueOfExisting);

  if (remainingTarget === 0) {
    return {
      requiredMonthlySip: 0,
      futureValueOfExisting: Math.round(futureValueOfExisting),
      remainingTarget: 0,
      totalSipInvested: 0,
      totalWealthGained: Math.round(futureValueOfExisting - existingSavings),
    };
  }

  // Binary search for exact starting monthly SIP that reaches remainingTarget with stepUpPct
  let low = 0;
  let high = remainingTarget;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const sim = calculateStepUpSip({
      monthlySip: mid,
      annualReturnPct,
      years,
      stepUpPct,
    });
    if (sim.futureValue < remainingTarget) {
      low = mid;
    } else {
      high = mid;
    }
  }

  const requiredMonthlySip = Math.ceil(high / 100) * 100; // Clean ₹100 rounding
  const finalSim = calculateStepUpSip({
    monthlySip: requiredMonthlySip,
    annualReturnPct,
    years,
    stepUpPct,
  });

  return {
    requiredMonthlySip,
    futureValueOfExisting: Math.round(futureValueOfExisting),
    remainingTarget: Math.round(remainingTarget),
    totalSipInvested: finalSim.totalInvested,
    projectedTotalCorpus: Math.round(futureValueOfExisting + finalSim.futureValue),
    totalWealthGained: Math.round(
      futureValueOfExisting + finalSim.futureValue - existingSavings - finalSim.totalInvested
    ),
  };
};