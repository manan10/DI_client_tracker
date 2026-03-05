import React, { useEffect, useState } from "react";
import { Clock, ShieldCheck, TrendingUp, Users, Home } from "lucide-react";
import StatCard from "./StatCard";
import { useApi } from "../../hooks/useApi";

const StatCards = () => {
  const { request } = useApi();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalFamilies: 0,
    totalAUM: 0,
    totalInteractions: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await request("/stats/dashboard");
        if (data) {
          setStats({
            totalClients: data.totalClients || 0,
            totalFamilies: data.totalFamilies || 0,
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
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-12">
      <StatCard
        title="Total Families"
        value={`${stats.totalFamilies}`}
        icon={<Home size={20} />}
        borderClass="border-l-slate-900 dark:border-l-slate-400"
        colorClass="text-slate-900 dark:text-slate-400"
        bgIconClass="bg-slate-50 dark:bg-slate-800"
      />
      <StatCard
        title="Total Clients"
        value={`${stats.totalClients}`}
        icon={<Users size={20} />}
        borderClass="border-l-amber-600"
        colorClass="text-amber-600"
        bgIconClass="bg-amber-50 dark:bg-amber-950/30"
      />
      <StatCard
        title="Meeting Logs"
        value={stats.totalInteractions}
        icon={<Clock size={20} />}
        borderClass="border-l-amber-500"
        colorClass="text-amber-500"
        bgIconClass="bg-amber-50 dark:bg-amber-950/30"
      />
      <StatCard
        title="Est. AUM"
        value={formatAUM(stats.totalAUM)}
        icon={<TrendingUp size={20} />}
        borderClass="border-l-amber-500"
        colorClass="text-amber-600"
        bgIconClass="bg-amber-50 dark:bg-amber-950/30"
      />
      <StatCard
        title="Compliance"
        value="100%"
        icon={<ShieldCheck size={20} />}
        borderClass="border-l-emerald-500"
        colorClass="text-emerald-600"
        bgIconClass="bg-emerald-50 dark:bg-emerald-950/30"
      />
    </div>
  );
};

export default StatCards;