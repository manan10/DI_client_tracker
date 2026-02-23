const StatCard = ({ title, value, icon, color = "text-blue-700", accent }) => (
  <div
    className={`bg-white p-7 rounded-2xl shadow-sm border border-slate-200 border-l-8 ${accent} hover:shadow-md transition-all`}
  >
    <div className={`p-2 w-fit rounded-lg bg-slate-50 ${color} mb-4`}>
      {icon}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
      {title}
    </p>
    <p className="text-3xl font-black text-slate-900 mt-1 tabular-nums">
      {value}
    </p>
  </div>
);

export default StatCard;
