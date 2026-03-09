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
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const data = await request("/stats/dashboard");
        if (data && isMounted) {
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
    return () => { isMounted = false; };
  }, [request]);

  const formatAUM = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <StatCard
        title="Families"
        value={stats.totalFamilies}
        icon={<Home />}
        colorClass="text-slate-600 dark:text-slate-400"
        bgIconClass="bg-slate-50 dark:bg-slate-800"
      />
      <StatCard
        title="Clients"
        value={stats.totalClients}
        icon={<Users />}
        colorClass="text-amber-600"
        bgIconClass="bg-amber-50 dark:bg-amber-950/20"
      />
      <StatCard
        title="Logs"
        value={stats.totalInteractions}
        icon={<Clock />}
        colorClass="text-amber-500"
        bgIconClass="bg-amber-50 dark:bg-amber-950/20"
      />
      <StatCard
        title="AUM"
        value={formatAUM(stats.totalAUM)}
        icon={<TrendingUp />}
        colorClass="text-emerald-600"
        bgIconClass="bg-emerald-50 dark:bg-emerald-950/20"
      />
      {/* Compliance hidden on smaller mobile screens to save space, visible from md up */}
      <div className="hidden md:block">
        <StatCard
          title="Status"
          value="Compliant"
          icon={<ShieldCheck />}
          colorClass="text-blue-600"
          bgIconClass="bg-blue-50 dark:bg-blue-950/20"
        />
      </div>
    </div>
  );
};

export default StatCards;