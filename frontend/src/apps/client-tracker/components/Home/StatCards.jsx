import React, { useEffect, useState } from "react";
import { Clock, TrendingUp, Users, Home as HomeIcon } from "lucide-react";
import StatCard from "./StatCard";
import { useApi } from '../../../../shared/hooks/useApi';

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
        console.error("Stats fetch failed", err); 
      }
    };
    
    fetchStats();
    
    return () => { 
      isMounted = false; 
    };
  }, [request]);

  const formatAUM = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Structured Themes for the Ambient Glows and Icons
  const themes = {
    families: {
      bg: "bg-slate-50 dark:bg-slate-500/10",
      border: "border-slate-200 dark:border-slate-500/20",
      text: "text-slate-600 dark:text-slate-400",
      glow: "bg-slate-400/20 dark:bg-slate-500/20"
    },
    clients: {
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-200 dark:border-orange-500/20",
      text: "text-orange-600 dark:text-orange-400",
      glow: "bg-orange-400/20 dark:bg-orange-500/20"
    },
    logs: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-200 dark:border-amber-500/20",
      text: "text-amber-600 dark:text-amber-400",
      glow: "bg-amber-400/20 dark:bg-amber-500/20"
    },
    aum: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-200 dark:border-emerald-500/20",
      text: "text-emerald-600 dark:text-emerald-400",
      glow: "bg-emerald-400/20 dark:bg-emerald-500/20"
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 w-full min-w-0">
      <StatCard 
        title="Total Families" 
        value={stats.totalFamilies} 
        icon={<HomeIcon />} 
        theme={themes.families}
      />
      
      <StatCard 
        title="Total Clients" 
        value={stats.totalClients} 
        icon={<Users />} 
        theme={themes.clients}
      />
      
      <StatCard 
        title="Interaction Logs" 
        value={stats.totalInteractions} 
        icon={<Clock />} 
        theme={themes.logs}
      />
      
      <StatCard 
        title="Managed AUM" 
        value={formatAUM(stats.totalAUM)} 
        icon={<TrendingUp />} 
        theme={themes.aum}
      />
    </div>
  );
};

export default StatCards;