import React from 'react';
import { CreditCard, Users } from 'lucide-react';

const AccountIntelligence = ({ client }) => (
  <div className="lg:col-span-4 space-y-6">
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
      <h3 className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
        <CreditCard size={12} /> Account Intelligence
      </h3>
      <div className="space-y-5">
        <div>
          <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Total AUM</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500 tracking-tight">
            ₹{client.aum?.toLocaleString('en-IN') || '0'}
          </p>
        </div>
        <div className="pt-5 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Wealth Elite ID</p>
            <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{client.wealthEliteId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">ARN</p>
            <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200">{client.arn || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
      <h3 className="text-[10px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Users size={12} /> Family Structure
      </h3>
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Role in Family</span>
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded ${client.isFamilyHead ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-500' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
          {client.isFamilyHead ? 'Head' : 'Member'}
        </span>
      </div>
    </div>
  </div>
);

export default AccountIntelligence;