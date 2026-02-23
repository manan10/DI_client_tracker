import { Clock, ShieldCheck, TrendingUp, Users } from "lucide-react";
import StatCard from "./StatCard";

const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <StatCard
        title="Active Clients"
        value="443+"
        icon={<Users size={20} />}
        accent="border-l-blue-600"
      />
      <StatCard
        title="Meeting Logs"
        value="842"
        icon={<Clock size={20} />}
        accent="border-l-indigo-600"
      />
      <StatCard
        title="Est. AUM"
        value="₹ --"
        icon={<TrendingUp size={20} />}
        accent="border-l-amber-500"
        color="text-amber-600"
      />
      <StatCard
        title="Compliance"
        value="100%"
        icon={<ShieldCheck size={20} />}
        accent="border-l-emerald-500"
        color="text-emerald-600"
      />
    </div>
  );
};

export default StatCards;
