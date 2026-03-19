import React, { useEffect, useState } from "react";
import { Clock, ShieldCheck, TrendingUp, Users, Home as HomeIcon } from "lucide-react";
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
      } catch (err) { console.error("Stats fetch failed", err); }
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
    /* GRID STRATEGY:
       - grid-cols-2: 2 cards per row on mobile (No scrolling!)
       - md:flex: Reverts to a single row on tablets/desktop
    */
    <div className="grid grid-cols-2 md:flex md:flex-row md:items-center gap-3 sm:gap-4 md:justify-center px-1 sm:px-4 py-2">
      <StatCard 
        title="Families" 
        value={stats.totalFamilies} 
        icon={<HomeIcon />} 
        colorClass="text-slate-600 dark:text-slate-400" 
      />
      
      <StatCard 
        title="Clients" 
        value={stats.totalClients} 
        icon={<Users />} 
        colorClass="text-orange-600 dark:text-orange-500" 
      />
      
      <StatCard 
        title="Logs" 
        value={stats.totalInteractions} 
        icon={<Clock />} 
        colorClass="text-amber-600 dark:text-amber-500" 
      />
      
      <StatCard 
        title="AUM" 
        value={formatAUM(stats.totalAUM)} 
        icon={<TrendingUp />} 
        colorClass="text-emerald-700 dark:text-emerald-500" 
      />
    </div>
  );
};

export default StatCards;