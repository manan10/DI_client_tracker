import React from 'react';
import { CreditCard, Users } from 'lucide-react';

const AccountIntelligence = ({ client }) => (
  <div className="lg:col-span-4 space-y-6">
    <div className="bg-white dark:bg-[#161B26] rounded-lg shadow-sm border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8">
      <h3 className="sora-font text-[10px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
        <CreditCard size={12} className="text-sky-500" /> Account Intelligence
      </h3>
      <div className="space-y-5">
        <div>
          <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Total AUM</p>
          <p className="text-2xl font-mono font-bold text-sky-600 dark:text-sky-400 tracking-tight">
            ₹{client.aum?.toLocaleString('en-IN') || '0'}
          </p>
        </div>
        <div className="pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Wealth Elite ID</p>
            <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{client.wealthEliteId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">ARN</p>
            <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{client.arn || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-[#161B26] rounded-lg shadow-sm border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8">
      <h3 className="sora-font text-[10px] font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Users size={12} className="text-sky-500" /> Family Structure
      </h3>
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1C2230] rounded-lg border border-slate-200/80 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role in Family</span>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${client.isFamilyHead ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
          {client.isFamilyHead ? 'Head' : 'Member'}
        </span>
      </div>
    </div>
  </div>
);

export default AccountIntelligence;