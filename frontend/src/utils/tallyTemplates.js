// src/utils/tallyTemplates.js

export const tallyTemplates = {
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
                <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
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
                <SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>
            </STATICVARIABLES>
        </DESC>
        <DATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER VCHTYPE="${type}" ACTION="Create" OBJSTATUSTYPE="Created">
                    <DATE>${tallyDate}</DATE>
                    <VOUCHERTYPENAME>${type}</VOUCHERTYPENAME>
                    <PARTYLEDGERNAME>${type === 'Receipt' ? ledgerName : bankAccount}</PARTYLEDGERNAME>
                    <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                    <NARRATION>${narration}</NARRATION>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>${ledgerName}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>${type === 'Payment' ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>
                        <AMOUNT>${ledgerAmount}</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>${bankAccount}</LEDGERNAME>
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

        const totalAmt = (baseAmt + cAmt + sAmt + iAmt).toFixed(2);

        // Generate Tax Nodes securely packed in LEDGERENTRIES.LIST
        let taxNodes = '';
        if (gstType === 'LOCAL') {
            taxNodes = `
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${cgstLedger}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${cAmt.toFixed(2)}</AMOUNT>
                    </LEDGERENTRIES.LIST>
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${sgstLedger}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${sAmt.toFixed(2)}</AMOUNT>
                    </LEDGERENTRIES.LIST>`;
        } else if (gstType === 'INTERSTATE') {
            taxNodes = `
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${igstLedger}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${iAmt.toFixed(2)}</AMOUNT>
                    </LEDGERENTRIES.LIST>`;
        }

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
                <SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>
            </STATICVARIABLES>
        </DESC>
        <DATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJSTATUSTYPE="Created" OBJVIEW="Invoice Voucher View">
                    <DATE>${tallyDate}</DATE>
                    <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                    <REFERENCE>${invoiceNumber}</REFERENCE>
                    <ISINVOICE>Yes</ISINVOICE>
                    <PARTYLEDGERNAME>${ledgerName}</PARTYLEDGERNAME>
                    <PARTYNAME>${ledgerName}</PARTYNAME>
                    <BASICBUYERNAME>${ledgerName}</BASICBUYERNAME>
                    <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
                    <NARRATION>${narration}</NARRATION>
                    
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${ledgerName}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
                        <AMOUNT>-${totalAmt}</AMOUNT>
                        <BILLALLOCATIONS.LIST>
                            <NAME>${invoiceNumber}</NAME>
                            <BILLTYPE>New Ref</BILLTYPE>
                            <AMOUNT>-${totalAmt}</AMOUNT>
                        </BILLALLOCATIONS.LIST>
                    </LEDGERENTRIES.LIST>
                    
                    <LEDGERENTRIES.LIST>
                        <LEDGERNAME>${incomeLedger}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <ISPARTYLEDGER>No</ISPARTYLEDGER>
                        <AMOUNT>${baseAmt.toFixed(2)}</AMOUNT>
                    </LEDGERENTRIES.LIST>
                    ${taxNodes}
                </VOUCHER>
            </TALLYMESSAGE>
        </DATA>
    </BODY>
</ENVELOPE>`.trim();
    }
};