import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "../../hooks/useApi"; 

// Import all the separated steps
import InitialScreen from "./ARNTransferMailerSteps/InitialScreen";
import UpdateInfoStep from "./ARNTransferMailerSteps/UpdateInfoStep";
import ChooseClientsStep from "./ARNTransferMailerSteps/ChooseClientsStep";
import ReviewStep from "./ARNTransferMailerSteps/ReviewStep";
import StatusStep from "./ARNTransferMailerSteps/StatusStep";

const ARNTransferMailer = () => {
  const { request } = useApi();

  // --- WIZARD STATE ---
  const [currentStep, setCurrentStep] = useState(0);

  // --- UI STATES ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailStatuses, setEmailStatuses] = useState({});
  
  // --- CLIENT DATA STATES ---
  const [allClients, setAllClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [selectedClientIds, setSelectedClientIds] = useState(new Set());
  
  // --- TABLE STATES ---
  const [clientSearch, setClientSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- TEMPLATE VARIABLES ---
  const [variables, setVariables] = useState({
    transferorName: "",
    transferorARN: "",
    transfereeName: "",
    transfereeARN: "",
    transfereeEmail: "",
    transfereePhone: "",
    transfereeAddress: "",
    cutoffDate: "",
  });

  // Updated with the new legal template
  const [template, setTemplate] = useState(`Dear {{CLIENT_NAME}},

Sub:: Change of distributor code (ARN) in respect of your Mutual Fund Folios under our ARN {{TRANSFEROR_ARN}}

At the outset, I/we would like to thank you for being my/our valued client and investing in mutual funds through my/our distributorship under AMFI Registration Number (ARN {{TRANSFEROR_ARN}}).

This is to inform you that I/ we have decided to transfer / merge my/our mutual fund distribution business activities* to/with the below named mutual fund distributor, who will be servicing you henceforth :

{{TRANSFEREE_NAME}} [ARN {{TRANSFEREE_ARN}}]
Address: {{TRANSFEREE_ADDRESS}}
Email ID: {{TRANSFEREE_EMAIL}} 
Tel./ Mobile no: {{TRANSFEREE_PHONE}}

In this regard, I /we have requested all the concerned asset management companies (AMCs) to replace the ARN code in the MF folios of all my mutual fund clients (including yourself) currently linked to my/our ARN {{TRANSFEROR_ARN}} under all the schemes of their respective mutual funds with the ARN {{TRANSFEREE_ARN}} of above mentioned the Transferee distributor.

Once the respective AMCs complete the necessary action in this regard, my / our ARN / distributor code in all of your mutual fund folios will be replaced by ARN {{TRANSFEREE_ARN}} of {{TRANSFEREE_NAME}} and going forward, you will be serviced by the aforesaid Distributor in respect of all your mutual fund investments which are being currently serviced by me/us. Please note that there will be no change in your mutual fund holdings whatsoever.

In this regard, if you do not wish to transfer your MF holdings/folios to ARN {{TRANSFEREE_ARN}} of the aforesaid transferee distributor, and wish to shift to some other mutual fund distributor or investment adviser of your choice, OR wish to SWITCH your units to Direct Plan, you are requested to inform the concerned mutual funds/ AMCs accordingly through a written communication within 15 days from the date of this letter /email i.e. by {{CUTOFF_DATE}}.

Please note that if the AMC(s) do not receive any written communication/objection for the proposed change in the distributor/ARN code from you within 15 days i.e., by {{CUTOFF_DATE}}, it will be deemed that you have no objection for the aforesaid change of distributor code and the concerned AMC/RTA shall proceed with the change the ARN code in your mutual fund folios as above, i.e., the distributor code in your existing MF folio/s and all your existing SIP/ STP mandates, if any, along with the holdings under my/our ARN {{TRANSFEROR_ARN}} shall be shifted by the mutual fund under the ARN {{TRANSFEREE_ARN}} of the aforesaid transferee distributor.

On change of the ARN in your folios, you will receive an appropriate communication from the concerned AMC/RTA giving details of your accounts/folios which are mapped to ARN {{TRANSFEREE_ARN}} of {{TRANSFEREE_NAME}}.

Kindly note that if you are agreeable to the aforesaid change of distributor / ARN code in respect of your MF holdings/folios to ARN {{TRANSFEREE_ARN}} of the aforesaid transferee distributor, then no action is required from you.

If you choose to shift your mutual fund holding / folios under my/our ARN to any other mutual fund distributor of your choice, please submit a written request to the concerned mutual fund / RTA specifying the name and ARN the mutual fund distributor within 15 days of this email.

If you decide to Switch your unitholding to Direct Plan, please submit a Switch request to shift all mutual fund units in your folio under my/our ARN {{TRANSFEROR_ARN}} to Direct Plan in the prescribed format to the concerned mutual fund/RTA, within 15 days of this email/letter. Please note that the Switch transaction to Direct Plan shall be processed by the mutual fund at applicable NAV as per the applicable cut-off timing regulations for MF transactions as per the date and time of receipt of the switch request.

[Note: Please note that as per current Income Tax laws, switching of Units from a Regular Plan to a Direct Plan (or vice-versa) within the same mutual fund scheme is subjected to Capital Gains Tax, even though there is no cashflow involved.]

Thanking you,
Yours sincerely,
{{TRANSFEROR_NAME}}
ARN: {{TRANSFEROR_ARN}}`);

  // --- EFFECTS ---
  useEffect(() => {
    let isMounted = true;
    const fetchClients = async () => {
      try {
        const res = await request('/clients', 'GET');
        if (isMounted) {
          const clientsData = res?.data || res || [];
          const sortedClients = [...clientsData].sort((a, b) => (b.aum || 0) - (a.aum || 0));
          setAllClients(sortedClients);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        toast.error("Database Error", { description: "Could not retrieve client list." });
      } finally {
        if (isMounted) setIsLoadingClients(false);
      }
    };

    fetchClients();
    return () => { isMounted = false; };
  }, [request]);

  useEffect(() => {
    setCurrentPage(1);
  }, [clientSearch]);


  // --- HANDLERS ---
  const handleVariableChange = (e) => {
    setVariables({ ...variables, [e.target.name]: e.target.value });
  };

  const toggleClientSelection = (clientId) => {
    const newSelection = new Set(selectedClientIds);
    if (newSelection.has(clientId)) {
      newSelection.delete(clientId);
    } else {
      newSelection.add(clientId);
    }
    setSelectedClientIds(newSelection);
  };

  const selectAllFiltered = () => {
    const newSelection = new Set(selectedClientIds);
    filteredClients.forEach(c => newSelection.add(c._id));
    setSelectedClientIds(newSelection);
  };

  const deselectAllFiltered = () => {
    const newSelection = new Set(selectedClientIds);
    filteredClients.forEach(c => newSelection.delete(c._id));
    setSelectedClientIds(newSelection);
  };

  const handleProcessMailing = async () => {
    if (selectedClientIds.size === 0) {
      toast.error("No Clients Selected", { description: "Please go back and select clients." });
      return;
    }
    
    setCurrentStep(4);
    setIsProcessing(true);
    
    const statuses = {};
    Array.from(selectedClientIds).forEach(id => statuses[id] = 'pending');
    setEmailStatuses(statuses);

    const selectedArray = Array.from(selectedClientIds);
    for (let i = 0; i < selectedArray.length; i++) {
      const clientId = selectedArray[i];
      
      setEmailStatuses(prev => ({ ...prev, [clientId]: 'sending' }));
      await new Promise(resolve => setTimeout(resolve, 800)); 
      setEmailStatuses(prev => ({ ...prev, [clientId]: 'sent' }));
    }

    setIsProcessing(false);
    toast.success("Emails Dispatched Successfully", {
      description: `Transfer notices sent to ${selectedClientIds.size} clients.`,
    });
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setSelectedClientIds(new Set());
    setClientSearch("");
    setEmailStatuses({});
  };

  // --- DERIVED DATA & PAGINATION ---
  const filteredClients = useMemo(() => {
    if (!clientSearch) return allClients;
    const lower = clientSearch.toLowerCase();
    return allClients.filter(c => 
      c.name?.toLowerCase().includes(lower) || 
      c.email?.toLowerCase().includes(lower)
    );
  }, [allClients, clientSearch]);

  const selectedClientsData = useMemo(() => {
    return allClients.filter(c => selectedClientIds.has(c._id));
  }, [allClients, selectedClientIds]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-350 mx-auto space-y-6 animate-in fade-in duration-500 pb-24 font-sans w-full px-4 md:px-8">
      
      {/* GLOBAL PAGE HEADER (Hidden on Initial Screen) */}
      {currentStep > 0 && (
        <div className="mb-8 flex items-center justify-between w-full">
          <div>
            <h1 className="text-3xl font-[1000] text-slate-900 uppercase tracking-tighter italic">
              Bulk ARN <span className="text-emerald-600">Transfer</span>
            </h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Automated Client Notification System
            </p>
          </div>
          
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-2">
            {[1, 2, 3, 4].map(stepIndex => (
              <React.Fragment key={stepIndex}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                  currentStep === stepIndex 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : currentStep > stepIndex 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {currentStep > stepIndex ? <CheckCircle2 size={14} strokeWidth={3} /> : stepIndex}
                </div>
                {stepIndex < 4 && (
                  <div className={`w-8 h-0.5 rounded-full transition-colors ${currentStep > stepIndex ? 'bg-emerald-200' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* RENDER CURRENT STEP */}
      {currentStep === 0 && <InitialScreen setCurrentStep={setCurrentStep} />}
      
      {currentStep === 1 && (
        <UpdateInfoStep 
          variables={variables} 
          handleVariableChange={handleVariableChange} 
          setCurrentStep={setCurrentStep} 
        />
      )}
      
      {currentStep === 2 && (
        <ChooseClientsStep 
          clientSearch={clientSearch}
          setClientSearch={setClientSearch}
          isLoadingClients={isLoadingClients}
          paginatedClients={paginatedClients}
          filteredClients={filteredClients}
          selectedClientIds={selectedClientIds}
          toggleClientSelection={toggleClientSelection}
          selectAllFiltered={selectAllFiltered}
          deselectAllFiltered={deselectAllFiltered}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          setCurrentStep={setCurrentStep}
        />
      )}
      
      {currentStep === 3 && (
        <ReviewStep 
          variables={variables}
          selectedClientIds={selectedClientIds}
          selectedClientsData={selectedClientsData}
          template={template}
          setTemplate={setTemplate}
          setCurrentStep={setCurrentStep}
          handleProcessMailing={handleProcessMailing}
        />
      )}
      
      {currentStep === 4 && (
        <StatusStep 
          isProcessing={isProcessing}
          selectedClientIds={selectedClientIds}
          selectedClientsData={selectedClientsData}
          emailStatuses={emailStatuses}
          resetWizard={resetWizard}
        />
      )}
      
      {/* Global Custom Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

    </div>
  );
};

export default ARNTransferMailer;