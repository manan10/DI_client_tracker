import React from "react";
import { Megaphone, Clock } from "lucide-react";
import TabHeader from "../../../../shared/components/TabHeader";

const MarketingHub = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');
        .sora-font {
          font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
        }
      `}</style>

      {/* SUBORDINATE TAB HEADER */}
      <TabHeader
        kicker="Client Outreach & Templates"
        title="Marketing"
        accent="Hub"
        description="Ready-to-send WhatsApp templates, portfolio review invites, and investor awareness notes."
      />

      {/* COMING SOON WORKSPACE STAGE */}
      <div className="relative bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-800/80 rounded-lg p-8 sm:p-14 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-sky-600 via-cyan-400 to-transparent" />

        <div className="max-w-md mx-auto text-center py-8 sm:py-12 space-y-4">
          <div className="w-11 h-11 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
            <Megaphone size={20} strokeWidth={2} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 dark:bg-sky-500/10 border border-sky-200/70 dark:border-sky-500/25 text-[11px] font-mono font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            <Clock size={12} />
            <span>Coming Soon</span>
          </div>

          <h3 className="sora-font text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Outreach Studio{" "}
            <span className="font-normal text-sky-600 dark:text-sky-300">
              In Development
            </span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Client referral templates, annual portfolio review invites, and branded WhatsApp broadcast notes are being prepared for this module.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketingHub;