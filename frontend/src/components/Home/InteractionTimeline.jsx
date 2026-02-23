import { History, Search } from 'lucide-react';

const InteractionTimeline = ({ interactions = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
      {/* Header Section */}
      <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase tracking-tight text-sm">
          <History size={18} className="text-blue-700" />
          Interaction Timeline
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search interactions..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none w-64 focus:border-blue-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="overflow-x-auto text-center py-10">
        {interactions.length > 0 ? (
          <table className="w-full text-left">
             {/* Future table logic for real interactions will go here */}
          </table>
        ) : (
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">
            No recent interactions logged today.
          </p>
        )}
      </div>
      
      {/* Footer Action */}
      <button className="w-full py-4 bg-slate-50 text-[10px] font-black text-blue-700 uppercase tracking-[0.3em] hover:bg-blue-50 transition-colors border-t">
        View All Historical Data
      </button>
    </div>
  );
};

export default InteractionTimeline;