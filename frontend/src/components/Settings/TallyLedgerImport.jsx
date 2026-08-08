import React, { useState, useEffect, useMemo } from 'react';
import { 
  Upload, Loader2, Database, Search, Layers, 
  CheckCircle2, Filter, FileSpreadsheet, Check
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const TallyLedgerImport = () => {
  const { request } = useApi();
  const [isUploading, setIsUploading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [file, setFile] = useState(null);
  
  const [arns, setArns] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [selectedArn, setSelectedArn] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCompany, setActiveCompany] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [arnRes, ledgerRes] = await Promise.all([
          request('/arns'),
          request('/ledgers') 
        ]);
        if (isMounted) {
          if (arnRes?.data) setArns(arnRes.data);
          if (ledgerRes?.data) setLedgers(ledgerRes.data);
        }
      } catch {
        toast.error("Failed to load ledger registry");
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [request]);

  const companies = useMemo(() => {
    const grouped = ledgers.reduce((acc, curr) => {
      const co = curr.tallyCompanyName || "Unassigned";
      if (!acc[co]) acc[co] = { name: co, count: 0, arn: curr.arnId?.nickname };
      acc[co].count++;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => b.count - a.count);
  }, [ledgers]);

  const filteredLedgers = useMemo(() => {
    return ledgers.filter(l => {
      const matchCo = activeCompany ? l.tallyCompanyName === activeCompany : true;
      const matchSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCo && matchSearch;
    });
  }, [ledgers, activeCompany, searchQuery]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.match(/\.(csv|xlsx|xls)$/)) {
      setFile(selectedFile);
      toast.success("File Staged for Import", { description: selectedFile.name });
    } else if (selectedFile) {
      toast.error("Invalid File Type", { description: "Please upload an Excel or CSV file." });
    }
  };

  const handleSync = async () => {
    if (!file || !selectedArn) return;

    setIsUploading(true);
    
    const targetArn = arns.find(a => a._id === selectedArn);
    const companyContext = targetArn?.linkedTallyFirms?.[0];

    if (!companyContext) {
      toast.error("ARN Mapping Missing", { description: "Please link a Tally Firm to this ARN in settings first." });
      setIsUploading(false);
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formattedLedgers = jsonData.map(row => ({
          name: row.Name || row.ledger || row.Particulars,
          parent: row.Parent || row.Group || row.Under
        })).filter(l => l.name);

        const res = await request('/ledgers/bulk-sync', 'POST', {
          ledgers: formattedLedgers,
          company: companyContext,
          arnId: selectedArn
        });

        if (res.success) {
          toast.success("Synchronization Complete", { 
            description: `Successfully updated ${res.stats.totalSynced} ledgers for ${companyContext}` 
          });
          setFile(null);
          const updated = await request('/ledgers');
          if (updated?.data) setLedgers(updated.data);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      toast.error("Sync Failed", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  if (isInitialLoading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="w-full pb-32 space-y-6 animate-in fade-in duration-300">
      
      {/* Mobile-Only Header */}
      <div className="lg:hidden border-b border-slate-200 dark:border-white/5 pb-4">
        <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">Tally Ledgers</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Master Accounting Bridge</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* SIDEBAR: COMPANY CLUSTERS (Horizontal on Mobile, Vertical on Desktop) */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar pb-2 lg:pb-0">
          <button 
            onClick={() => setActiveCompany(null)}
            className={`flex lg:flex-row flex-col items-center justify-center lg:justify-start gap-3 px-4 py-3 min-w-30 lg:min-w-0 rounded-md border transition-all text-left shadow-sm
              ${!activeCompany 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' 
                : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/30'
              }`}
          >
            <Layers size={16} className={!activeCompany ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400"} />
            <div className="flex flex-col min-w-0 text-center lg:text-left">
               <span className="text-xs font-bold uppercase tracking-wider truncate">Global Master</span>
               <span className={`text-[10px] font-medium mt-0.5 ${!activeCompany ? "text-slate-300 dark:text-slate-600" : "text-slate-400"}`}>{ledgers.length} Ledgers</span>
            </div>
          </button>

          <div className="hidden lg:block h-px bg-slate-200 dark:bg-white/10 my-2" />

          {companies.map(co => {
            const isActive = activeCompany === co.name;
            return (
              <button 
                key={co.name}
                onClick={() => setActiveCompany(co.name)}
                className={`flex lg:flex-row flex-col items-center justify-center lg:justify-start gap-3 px-4 py-3 min-w-35 lg:min-w-0 rounded-md border transition-all text-left shadow-sm
                  ${isActive 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' 
                    : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/30'
                  }`}
              >
                <Database size={16} className={isActive ? "text-emerald-400 dark:text-emerald-600" : "text-slate-400"} />
                <div className="flex flex-col min-w-0 w-full text-center lg:text-left">
                   <div className="flex items-center justify-center lg:justify-between w-full">
                     <span className="text-xs font-bold uppercase tracking-wider truncate">{co.name}</span>
                     {isActive && <CheckCircle2 size={14} className="hidden lg:block ml-2 text-emerald-400 dark:text-emerald-600 shrink-0" />}
                   </div>
                   <span className={`text-[10px] font-medium mt-0.5 truncate ${isActive ? "text-slate-300 dark:text-slate-600" : "text-slate-400"}`}>
                     {co.count} ledgers • {co.arn || 'Direct'}
                   </span>
                </div>
              </button>
            )
          })}
        </aside>

        {/* MAIN WORKSPACE */}
        <section className="flex-1 w-full flex flex-col gap-5 overflow-hidden">
          
          {/* COMMAND BAR (Unified Tooling) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-md p-3 flex flex-col xl:flex-row gap-3 shadow-sm">
            
            {/* Search */}
            <div className="flex-1 relative flex items-center group">
              <Search className="absolute left-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input 
                placeholder="Search Ledgers or Groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>

            <div className="hidden xl:block w-px bg-slate-200 dark:bg-white/10 mx-1" />

            {/* Import Controls */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 xl:w-auto w-full">
              <select 
                value={selectedArn}
                onChange={(e) => setSelectedArn(e.target.value)}
                className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/10 rounded-md px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm cursor-pointer min-w-40"
              >
                <option value="">Select ARN Map</option>
                {arns.map(arn => <option key={arn._id} value={arn._id}>{arn.nickname} ({arn.arnCode})</option>)}
              </select>
              
              <div className="flex gap-3">
                <label className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border transition-all cursor-pointer shadow-sm
                  ${file 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-white dark:bg-[#0B1120] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/30'
                  }`}
                >
                  <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                  {file ? <Check size={16} /> : <FileSpreadsheet size={16} />}
                  <span className="text-xs font-bold uppercase tracking-wider">{file ? 'File Ready' : 'Upload'}</span>
                </label>

                <button 
                  disabled={!file || !selectedArn || isUploading}
                  onClick={handleSync}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Sync
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE VIEW: Stacked Cards */}
          <div className="lg:hidden flex flex-col gap-3">
            {filteredLedgers.map((ledger) => (
              <div key={ledger._id} className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                    {ledger.name}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-sm text-[10px] font-bold uppercase tracking-widest">
                    {ledger.groupName || "Primary"}
                  </span>
                  <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-sm text-[10px] font-bold uppercase tracking-widest truncate max-w-50">
                    {ledger.tallyCompanyName}
                  </span>
                </div>
              </div>
            ))}
            {filteredLedgers.length === 0 && (
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-[#0B1120] rounded-md border border-slate-200 dark:border-white/5">
                <Filter size={28} className="mx-auto mb-2 opacity-30" />
                <div className="text-sm font-bold">No Ledgers Found</div>
              </div>
            )}
          </div>

          {/* DESKTOP VIEW: Data Table */}
          <div className="hidden lg:block bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/5 rounded-md shadow-sm overflow-hidden flex-1">
            <div className="overflow-x-auto max-h-200">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-200 dark:border-white/5 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-5/12">Ledger Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-3/12">Parent Group</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 w-4/12">Tally Context Firm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredLedgers.map((ledger) => (
                    <tr key={ledger._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-6 py-3">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {ledger.name}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-1 rounded-sm bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                          {ledger.groupName || "Primary"}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-75">
                            {ledger.tallyCompanyName}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                            Linked: {ledger.arnId?.nickname || "Direct Mapping"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLedgers.length === 0 && (
                    <tr>
                      <td colSpan="3" className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
                        <Filter size={32} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No Records Match View</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
};

export default TallyLedgerImport;