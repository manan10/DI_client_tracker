// Helper to make strings safe for Tally's strict XML parser
const escapeXml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return "";
    return unsafe.toString().replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
};

// Helper to decode Tally's XML entities back to normal readable text for your DB/UI
const unescapeXml = (safe) => {
    if (safe === null || safe === undefined) return "";
    return safe.toString()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
};

export const tallyTemplates = {
    escapeXml,
    unescapeXml,

    getCompanies: () => `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>List of Companies</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`.trim(),

    getLedgers: (companyName) => `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>Ledger</ID>
    </HEADER>
    <BODY>
        <DESC>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="Ledger" ISMODIFY="No">
                        <TYPE>Ledger</TYPE>
                        <FETCH>Name, Parent</FETCH>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`.trim(),

    generateVoucher: (data) => {
        if (data.type === 'Sales') {
            return tallyTemplates.generateSalesVoucher(data);
        }

        const { company, type, date, ledgerName, bankAccount, amount, narration } = data;
        const tallyDate = date.replace(/-/g, '');
        
        // Receipts and Payments use standard Voucher View
        const ledgerAmount = type === 'Receipt' ? amount : `-${amount}`;
        const bankAmount = type === 'Payment' ? amount : `-${amount}`;

        return `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Vouchers</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY>${escapeXml(company)}</SVCURRENTCOMPANY>
            </STATICVARIABLES>
        </DESC>
        <DATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER VCHTYPE="${escapeXml(type)}" ACTION="Create" OBJSTATUSTYPE="Created">
                    <DATE>${tallyDate}</DATE>
                    <VOUCHERTYPENAME>${escapeXml(type)}</VOUCHERTYPENAME>
                    <PARTYLEDGERNAME>${escapeXml(type === 'Receipt' ? ledgerName : bankAccount)}</PARTYLEDGERNAME>
                    <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                    <NARRATION>${escapeXml(narration)}</NARRATION>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(ledgerName)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>${type === 'Payment' ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
                        <AMOUNT>${ledgerAmount}</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(bankAccount)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>${type === 'Receipt' ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
                        <AMOUNT>${bankAmount}</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                </VOUCHER>
            </TALLYMESSAGE>
        </DATA>
    </BODY>
</ENVELOPE>`.trim();
    },

    generateSalesVoucher: ({ 
        company, date, invoiceNumber, ledgerName, incomeLedger, amount, 
        gstType, cgstLedger, sgstLedger, igstLedger, cgstAmount, sgstAmount, igstAmount, narration 
    }) => {
        const tallyDate = date.replace(/-/g, '');
        const baseAmt = parseFloat(amount) || 0;
        
        let cAmt = 0;
        let sAmt = 0;
        let iAmt = 0;

        if (gstType === 'LOCAL') {
            cAmt = parseFloat(cgstAmount) || 0;
            sAmt = parseFloat(sgstAmount) || 0;
        } else if (gstType === 'INTERSTATE') {
            iAmt = parseFloat(igstAmount) || 0;
        }

        // =========================================================================
        // STRICT MATH FIX: Summing the explicitly formatted strings to prevent
        // invisible 0.01 floating point drifts from throwing a Tally exception.
        // =========================================================================
        const strBase = baseAmt.toFixed(2);
        const strC = cAmt.toFixed(2);
        const strS = sAmt.toFixed(2);
        const strI = iAmt.toFixed(2);

        const totalAmt = (
            parseFloat(strBase) + 
            parseFloat(strC) + 
            parseFloat(strS) + 
            parseFloat(strI)
        ).toFixed(2);

        // Generate Tax Nodes securely packed in LEDGERENTRIES.LIST
        let taxNodes = '';
        if (gstType === 'LOCAL') {
            taxNodes = `
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(cgstLedger)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${strC}</AMOUNT>
                    </LEDGERENTRIES.LIST>
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(sgstLedger)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${strS}</AMOUNT>
                    </LEDGERENTRIES.LIST>`;
        } else if (gstType === 'INTERSTATE') {
            taxNodes = `
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(igstLedger)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${strI}</AMOUNT>
                    </LEDGERENTRIES.LIST>`;
        }

        // Updated exactly matching the Tally Export
        return `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Vouchers</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY>${escapeXml(company)}</SVCURRENTCOMPANY>
            </STATICVARIABLES>
        </DESC>
        <DATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
                    <DATE>${tallyDate}</DATE>
                    <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                    <VOUCHERNUMBER>${escapeXml(invoiceNumber)}</VOUCHERNUMBER>
                    <REFERENCE>${escapeXml(invoiceNumber)}</REFERENCE>
                    <ISINVOICE>Yes</ISINVOICE>
                    <PARTYLEDGERNAME>${escapeXml(ledgerName)}</PARTYLEDGERNAME>
                    <PARTYNAME>${escapeXml(ledgerName)}</PARTYNAME>
                    <BASICBUYERNAME>${escapeXml(ledgerName)}</BASICBUYERNAME>
                    <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
                    <NARRATION>${escapeXml(narration)}</NARRATION>
                    
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(ledgerName)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
                        <AMOUNT>-${totalAmt}</AMOUNT>
                        <BILLALLOCATIONS.LIST>
                            <NAME>${escapeXml(invoiceNumber)}</NAME>
                            <BILLTYPE>New Ref</BILLTYPE>
                            <AMOUNT>-${totalAmt}</AMOUNT>
                        </BILLALLOCATIONS.LIST>
                    </LEDGERENTRIES.LIST>
                    
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(incomeLedger)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${strBase}</AMOUNT>
                    </LEDGERENTRIES.LIST>
                    ${taxNodes}
                </VOUCHER>
            </TALLYMESSAGE>
        </DATA>
    </BODY>
</ENVELOPE>`.trim();
    }
};