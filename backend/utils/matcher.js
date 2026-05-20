/**
 * GENIUS MATCHER (v2 - Proven Logic)
 * Restored to user's successful 10/11 accuracy version.
 */

const NOISE_WORDS = ['MANAN', 'UDAY', 'DALAL', 'MUTUAL', 'FUND', 'INDIA', 'LIMITED', 'PVT', 'LTD'];

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const performLedgerMatch = (narration, ledgerMaster) => {
    if (!narration || !ledgerMaster || ledgerMaster.length === 0) {
        return { name: "SUSPENSE A/C", confidence: 0.1 };
    }

    const cleanNarration = narration.toUpperCase();
    
    // Context Detection
    const isIncome = cleanNarration.includes("BROKERAGE") || 
                     cleanNarration.includes("COMMISSION") || 
                     cleanNarration.includes("BRK");
    
    let bestMatch = null;
    let maxScore = 0;

    for (const ledger of ledgerMaster) {
        const ledgerName = ledger.name.toUpperCase();
        
        // 1. STRICT CONTEXT FILTERING
        if (isIncome && (ledgerName.includes("MANAN") || ledgerName.includes("UDAY"))) {
            continue; 
        }

        let score = 0;
        const ledgerTokens = ledgerName.split(/[\s-/]+/).filter(t => t.length > 2);
        
        // 2. TOKEN SCORING
        ledgerTokens.forEach(token => {
            try {
                const safeToken = escapeRegExp(token);
                const regex = new RegExp(`\\b${safeToken}\\b`, 'g');
                
                if (regex.test(cleanNarration)) {
                    if (NOISE_WORDS.includes(token)) {
                        score += 10;
                    } else {
                        score += 55; 
                    }
                }
            } catch (e) {
                if (cleanNarration.includes(token)) score += 5;
            }
        });

        // 3. EXACT STRING BONUS
        if (cleanNarration.includes(ledgerName)) {
            score += 40;
        }

        if (score > maxScore) {
            maxScore = score;
            bestMatch = ledger.name;
        }
    }

    let confidence = Math.min(maxScore / 100, 0.99);

    if (isIncome && confidence < 0.4) {
        return { name: "BROKERAGE INCOME", confidence: 0.4 };
    }

    if (!bestMatch || confidence < 0.15) {
        return { name: "SUSPENSE A/C", confidence: 0.1 };
    }

    return { 
        name: bestMatch, 
        confidence: Math.round(confidence * 100) / 100 
    };
};