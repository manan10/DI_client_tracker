import React, { useState, useEffect, useMemo } from 'react';
import { 
  Upload, FileText, Loader2, Terminal, 
  Building2, Sparkles, Search, Layers, ChevronRight, 
  Database, RefreshCcw, Filter, CheckCircle2
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'sonner';
import * as XLSX from 'xlsx'; // Assuming you use xlsx for client-side parsing

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
    const fetchData = async () => {
      try {
        const [arnRes, ledgerRes] = await Promise.all([
          request('/arns'),
          request('/ledgers') 
        ]);
        if (arnRes?.data) setArns(arnRes.data);
        if (ledgerRes?.data) setLedgers(ledgerRes.data);
      } catch {
        toast.error("Registry Load Failed");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
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
    if (selectedFile?.name.match(/\.(csv|xlsx|xls)$/)) {
      setFile(selectedFile);
      toast.success("File Staged", { description: selectedFile.name });
    } else {
      toast.error("Invalid File Type");
    }
  };

  const handleSync = async () => {
    if (!file || !selectedArn) return;

    setIsUploading(true);
    
    // 1. Find the Tally Company Name linked to this ARN for context
    const targetArn = arns.find(a => a._id === selectedArn);
    const companyContext = targetArn?.linkedTallyFirms?.[0]; // Default to first linked firm

    if (!companyContext) {
      toast.error("ARN Mapping Missing", { description: "Link a Tally Firm to this ARN in settings first." });
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

        // Map spreadsheet columns to our Ledger schema
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
          toast.success("Sync Complete", { 
            description: `Updated ${res.stats.totalSynced} records for ${companyContext}` 
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

  if (isInitialLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-8 animate-in fade-in duration-500">
      
      {/* 1. SIDEBAR: COMPANY CLUSTERS */}
      <aside className="w-80 flex flex-col gap-6 shrink-0">
        <div className="flex flex-col gap-2 border-l-4 border-emerald-500 pl-6">
          <h3 className="text-xl font-black uppercase tracking-tighter italic dark:text-white leading-none">
            Master <span className="text-emerald-500">Registry</span>
          </h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
            Accounting Bridge Control
          </p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-2">
          <button 
            onClick={() => setActiveCompany(null)}
            className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border-2 
            ${!activeCompany ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-white/5 border-transparent hover:border-slate-200'}`}
          >
            <div className="flex items-center gap-3">
              <Layers size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Master</span>
            </div>
            <span className="text-[10px] font-black opacity-50">{ledgers.length}</span>
          </button>

          <div className="h-px bg-slate-100 dark:bg-white/5 my-4" />

          {companies.map(co => (
            <button 
              key={co.name}
              onClick={() => setActiveCompany(co.name)}
              className={`w-full p-5 rounded-2xl flex flex-col gap-3 transition-all border-2 text-left group
              ${activeCompany === co.name ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white dark:bg-white/2 border-transparent hover:border-slate-200'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-[1000] uppercase italic tracking-tight transition-colors ${activeCompany === co.name ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                  {co.name}
                </span>
                {activeCompany === co.name && <CheckCircle2 size={14} className="text-emerald-500 animate-in zoom-in" />}
              </div>
              <div className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-2">
                  <Database size={10} />
                  <span className="text-[9px] font-black uppercase tracking-tighter">{co.count} Records</span>
                </div>
                <span className="text-[9px] font-black uppercase italic">{co.arn}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* 2. WORKSPACE: FILTER & DATA GRID */}
      <section className="flex-1 flex flex-col gap-6 overflow-hidden">
        
        {/* COMMAND BAR */}
        <div className="bg-slate-50 dark:bg-white/2 p-3 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
              placeholder="FILTER BY LEDGER OR GROUP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 rounded-xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none border-2 border-transparent focus:border-emerald-500/20 transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />

          {/* SYNC TOOLS */}
          <div className="flex items-center gap-2">
            <select 
              value={selectedArn}
              onChange={(e) => setSelectedArn(e.target.value)}
              className="bg-white dark:bg-slate-900 px-4 py-3 rounded-xl text-[9px] font-black uppercase outline-none border border-slate-200 dark:border-white/10 cursor-pointer hover:border-emerald-500/50 transition-colors"
            >
              <option value="">Select ARN Context</option>
              {arns.map(arn => <option key={arn._id} value={arn._id}>{arn.nickname} ({arn.arnCode})</option>)}
            </select>
            
            <label className={`cursor-pointer p-3 rounded-xl border border-dashed transition-all ${file ? 'bg-emerald-500/10 border-emerald-500' : 'bg-white dark:bg-white/5 border-slate-300 dark:border-white/20 hover:border-emerald-500'}`}>
              <input type="file" className="hidden" onChange={handleFileChange} />
              <Upload size={16} className={file ? 'text-emerald-500' : 'text-slate-400'} />
            </label>

            <button 
              disabled={!file || !selectedArn || isUploading}
              onClick={handleSync}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${!file ? 'opacity-20 grayscale pointer-events-none' : 'bg-slate-950 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-lg hover:scale-105 active:scale-95'}`}
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
              Sync
            </button>
          </div>
        </div>

        {/* LEDGER DATA GRID */}
        <div className="flex-1 overflow-y-auto no-scrollbar border border-slate-100 dark:border-white/5 rounded-[2rem] bg-white dark:bg-[#050607] shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md z-10 border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Ledger Name</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Parent Group</th>
                <th className="px-10 py-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Context Firm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filteredLedgers.map((ledger) => (
                <tr key={ledger._id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-10 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        <Sparkles size={12} />
                      </div>
                      <span className="text-[11px] font-[1000] uppercase italic tracking-tight text-slate-900 dark:text-white leading-none">
                        {ledger.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors">
                      {ledger.groupName || "Primary"}
                    </span>
                  </td>
                  <td className="px-10 py-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase italic leading-none truncate max-w-[180px]">
                        {ledger.tallyCompanyName}
                      </span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter mt-1">
                        Linked to {ledger.arnId?.nickname || "Direct"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLedgers.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-32 text-center opacity-20">
                    <Filter size={64} className="mx-auto mb-6 stroke-1" />
                    <p className="text-[11px] font-black uppercase tracking-[0.4em]">No Records in Current View</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default TallyLedgerImport;