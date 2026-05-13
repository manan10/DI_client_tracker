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
</ENVELOPE>`,

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
</ENVELOPE>`,

    // This is now just a helper to generate the initial editable string
    generateVoucher: ({ company, type, date, ledgerName, bankAccount, amount, narration }) => {
        const tallyDate = date.replace(/-/g, '');
        const ledgerAmount = type === 'Payment' ? amount : `-${amount}`;
        const bankAmount = type === 'Receipt' ? amount : `-${amount}`;

        return `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import Data</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Vouchers</ID>
    </HEADER>
    <BODY>
        <IMPORTDATA>
            <REQUESTDESC>
                <REPORTNAME>Vouchers</REPORTNAME>
                <STATICVARIABLES>
                    <SVCURRENTCOMPANY>${company}</SVCURRENTCOMPANY>
                </STATICVARIABLES>
            </REQUESTDESC>
            <REQUESTDATA>
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
            </REQUESTDATA>
        </IMPORTDATA>
    </BODY>
</ENVELOPE>`;
    }
};