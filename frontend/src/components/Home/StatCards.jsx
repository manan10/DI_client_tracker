import { useEffect, useState } from "react";
import { Clock, ShieldCheck, TrendingUp, Users } from "lucide-react";
import StatCard from "./StatCard";
import { useApi } from "../../hooks/useApi";

const StatCards = () => {
  const { request } = useApi();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAUM: 0,
    totalInteractions: 0
});

useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await request("/stats/dashboard");
        console.log("Raw Stats Data from API:", data); // Check if this is {} or populated
        
        if (data) {
          setStats({
            totalClients: data.totalClients || 0,
            totalAUM: data.totalAUM || 0,
            totalInteractions: data.totalInteractions || 0
          });
        }
      } catch (err) {
        console.error("Fetch failed", err);
      }
    };
    fetchStats();
}, [request]);

  const formatAUM = (value) => {
  if (value >= 10000000) {
    // Format as Crores
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  } else if (value >= 100000) {
    // Format as Lakhs
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  // Standard format for smaller amounts
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <StatCard
        title="Active Clients"
        value={`${stats.totalClients}`}
        icon={<Users size={20} />}
        borderClass="border-l-amber-600"
        colorClass="text-amber-600"
      />
      <StatCard
        title="Meeting Logs"
        value={stats.totalInteractions}
        icon={<Clock size={20} />}
        borderClass="border-l-amber-500"
        colorClass="text-amber-500"
      />
      <StatCard
        title="Est. AUM"
        value={formatAUM(stats.totalAUM)}
        icon={<TrendingUp size={20} />}
        borderClass="border-l-amber-500"
        colorClass="text-amber-600"
      />
      <StatCard
        title="Compliance"
        value="100%"
        icon={<ShieldCheck size={20} />}
        borderClass="border-l-emerald-500"
        colorClass="text-emerald-600"
      />
    </div>
  );
};

export default StatCards;