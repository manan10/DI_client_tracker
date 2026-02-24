const StatCard = ({
  title,
  value,
  icon,
  colorClass = "text-amber-600",
  borderClass = "border-l-amber-500",
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 flex items-center gap-5 border-l-4 ${borderClass} transition-all hover:shadow-2xl hover:-translate-y-1`}
    >
      <div className={`p-4 rounded-xl bg-slate-50 ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          {title}
        </p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
};

export default StatCard;
