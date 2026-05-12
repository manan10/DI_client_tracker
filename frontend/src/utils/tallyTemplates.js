/**
 * Tally XML Templates - Production Grade (Human-Friendly)
 * Validated for TallyPrime 2.0+
 */

export const tallyTemplates = {
    // Fetch all companies visible in Tally
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

    // Fetch Ledgers with their Parent Groups for smart filtering
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

    // Production-Perfect Voucher Import
    generateVoucher: ({ company, type, date, ledgerName, bankAccount, amount, narration }) => {
        const tallyDate = date.replace(/-/g, '');
        
        // Tally Math: Credits are Negative
        const ledgerAmount = type === 'Payment' ? amount : `-${amount}`;
        const bankAmount = type === 'Receipt' ? amount : `-${amount}`;
        const isLedgerPositive = type === 'Payment' ? 'Yes' : 'No';
        const isBankPositive = type === 'Receipt' ? 'Yes' : 'No';

        return `
        <ENVELOPE>
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
                                    <ISDEEMEDPOSITIVE>${isLedgerPositive}</ISDEEMEDPOSITIVE>
                                    <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
                                    <AMOUNT>${ledgerAmount}</AMOUNT>
                                </ALLLEDGERENTRIES.LIST>
                                <ALLLEDGERENTRIES.LIST>
                                    <LEDGERNAME>${bankAccount}</LEDGERNAME>
                                    <ISDEEMEDPOSITIVE>${isBankPositive}</ISDEEMEDPOSITIVE>
                                    <ISPARTYLEDGER>No</ISPARTYLEDGER>
                                    <AMOUNT>${bankAmount}</AMOUNT>
                                </ALLLEDGERENTRIES.LIST>
                            </VOUCHER>
                        </TALLYMESSAGE>
                    </REQUESTDATA>
                </IMPORTDATA>
            </BODY>
        </ENVELOPE>`.trim();
    }
};