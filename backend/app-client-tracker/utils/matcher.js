/**
 * GENIUS MATCHER (v9 - Dual-State Narration & Exact Match Fix)
 * Creates a baseNarration for exact matching, and a tokenNarration for isolated noun scoring.
 * This guarantees that "HDFC MUTUAL FUND" gets its exact match bonus over "HDFC ASSET MANAGEMENT".
 */

const BANK_TYPOS = {
    'LIFE I NSURANCE': 'LIC',
    'FRANKL IN TEMPLE': 'FRANKLIN TEMPLTON', // Mapped specifically to your ledger's spelling
    'SUNDAR AM': 'SUNDARAM',
    'BR OKERAGE': 'BROKERAGE',
    'M UTUAL FUN': 'MUTUAL FUND',
    'MUTUAL FUN ': 'MUTUAL FUND ',
    'INVES-': 'INVEST-', 
    'INVES ': 'INVEST ',
    'K M M F': 'KOTAK',
    'DAKSHINGUJA': 'ELECTRICITY',
    'BILLPAY': 'BILL',
    'NWD-': 'CASH ',
    'BANDHA N': 'BANDHAN',
    'INDIA MU ': 'INDIA MUTUAL FUND ',
    'PRUDENTIA ': 'PRUDENTIAL ',
    'GOODS AND SERVICES TAX': 'GST',
    'GST-MM': 'GST',
    'CHOLAMANDALAM MS GENERAL': 'WITHDRAW' // Forces generic insurance to withdrawal fallback
};

const AMC_ACRONYMS = {
    'SBIMF': 'SBI MUTUAL FUND',
    'SBI MF': 'SBI MUTUAL FUND',
    'ABSL': 'ADITYA BIRLA',
    'KMMF': 'KOTAK',
    'KOTAK MF': 'KOTAK',
    'HDFC MF': 'HDFC MUTUAL FUND',
    'ICICI MF': 'ICICI PRUDENTIAL',
    'NIPPON': 'NIPPON INDIA',
    'UTI MF': 'UTI MUTUAL FUND',
    'DSP MF': 'DSP MUTUAL FUND',
    'DSPBR': 'DSP MUTUAL FUND',
    'FT MF': 'FRANKLIN TEMPLETON',
    'PGIM': 'PGIM INDIA',
    'TMF': 'TATA MUTUAL FUND',
    'WHITEOAK': 'WHITEOAK MUTUAL FUND',
    'BANDHAN': 'BANDHAN MUTUAL FUND',
    'AXIS': 'AXIS MUTUAL FUND',
    'SUNDARAM': 'SUNDARAM MUTUAL FUND'
};

const IGNORE_WORDS = [
    'AMAN', 'UDAY', 'DALAL', 'MANAN', 'GEETA', 'ASHOKBHAI', 'PANTHINI', 
    'PVT', 'LTD', 'LIMITED', 'INDIA', 'NACH', 'ACH', 'NEFT', 'RTGS', 'IMPS',
    'MUTUAL', 'FUND', 'AMC', 'LIFE', 'SUN', 'PRUDENTIAL',
    'CAPITAL', 'MARKETS', 'ASSET', 'MANAGEMENT', 
    'AND', 'OF', 'THE', 'IN', 'CO', 'A', 'FOR', 'ACCOUNT', 'A/C', 'AC', // General Stop Words
    'UDHNA', 'UDYOGNAGAR', '0099509044300', 'AT', '00577' // Ignored location/noise
];

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const performLedgerMatch = (transaction, ledgerMaster) => {
    const { narration, type } = transaction;
    if (!narration || !ledgerMaster || ledgerMaster.length === 0) return { name: "SUSPENSE A/C", confidence: 0.1 };

    // Neutralize NEFT asterisks into spaces so bank codes separate from actual words
    let baseNarration = narration.toUpperCase().replace(/\*/g, ' ');

    // --- 1. PRE-PROCESS BASE NARRATION (For Exact Matches) ---
    Object.entries(BANK_TYPOS).forEach(([typo, fix]) => {
        baseNarration = baseNarration.replace(new RegExp(escapeRegExp(typo), 'g'), fix);
    });
    Object.entries(AMC_ACRONYMS).forEach(([acronym, fullForm]) => {
        baseNarration = baseNarration.replace(new RegExp(`\\b${acronym}\\b`, 'g'), fullForm);
    });

    // --- 2. CREATE TOKEN NARRATION (For Isolated Noun Scoring) ---
    let tokenNarration = baseNarration;
    IGNORE_WORDS.forEach(word => {
        tokenNarration = tokenNarration.replace(new RegExp(`\\b${word}\\b`, 'g'), ' ');
    });

    // --- 3. HARD FALLBACKS ---
    if (type === 'PAYMENT') {
        if (baseNarration.includes('UPI') || baseNarration.includes('VPA') || baseNarration.includes('WITHDRAW')) {
            const w = getWithdrawalLedger(ledgerMaster);
            return w ? { name: w.name, confidence: 0.95 } : { name: "SUSPENSE A/C", confidence: 0.1 };
        }
        if (baseNarration.includes('CASH')) {
            const c = ledgerMaster.find(l => l.name.toUpperCase().includes('CASH'));
            return c ? { name: c.name, confidence: 0.95 } : { name: "SUSPENSE A/C", confidence: 0.1 };
        }
    }

    let bestMatch = null;
    let maxScore = 0;

    for (const ledger of ledgerMaster) {
        const ledgerName = ledger.name.toUpperCase();
        const ledgerGroup = (ledger.groupName || "").toUpperCase();
        let score = 0;
        
        // 4A. TOKEN SCORING (Uses the stripped tokenNarration)
        const tokens = ledgerName.split(/[\s-/()]+/).filter(t => t.length > 1 && !IGNORE_WORDS.includes(t.toUpperCase()));
        
        tokens.forEach(t => {
            try {
                const regex = new RegExp(`\\b${escapeRegExp(t.toUpperCase())}\\b`, 'g');
                if (regex.test(tokenNarration)) score += 60;
            } catch (e) {
                if (tokenNarration.includes(t.toUpperCase())) score += 10;
            }
        });

        // 4B. EXACT BONUS SCORING (Uses the intact baseNarration)
        if (baseNarration.includes(ledgerName)) score += 50;

        // 4C. AMC PRIORITY BONUS
        if (type === 'RECEIPT' && ledgerGroup.includes('SUNDRY DEBTOR') && score > 0) score += 40;

        if (score > maxScore) {
            maxScore = score;
            bestMatch = ledger.name;
        }
    }

    let confidence = Math.min(maxScore / 100, 0.99);

    // Final Fallback for Payments
    if (type === 'PAYMENT' && confidence < 0.2) {
        const w = getWithdrawalLedger(ledgerMaster);
        return w ? { name: w.name, confidence: 0.3 } : { name: "SUSPENSE A/C", confidence: 0.1 };
    }

    return bestMatch && confidence >= 0.2 
        ? { name: bestMatch, confidence: Math.round(confidence * 100) / 100 }
        : { name: "SUSPENSE A/C", confidence: 0.1 };
};

const getWithdrawalLedger = (ledgerMaster) => ledgerMaster.find(l => 
    l.name.toUpperCase().includes('WITHDRAW') || l.name.toUpperCase().includes('DRAWING')
);