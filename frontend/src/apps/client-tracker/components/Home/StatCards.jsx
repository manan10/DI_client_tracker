import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, TrendingUp, Users, Home as HomeIcon } from "lucide-react";
import StatCard from "./StatCard";
import { useApi } from '../../../../shared/hooks/useApi';

const StatCards = ({ refreshKey = 0 }) => {
  const { request } = useApi();
  const navigate = useNavigate();
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
  }, [request, refreshKey]);

  const formatAUM = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
      <StatCard 
        title="Total Families" 
        value={stats.totalFamilies.toLocaleString('en-IN')} 
        subtitle="Household groups"
        icon={<HomeIcon />} 
        onClick={() => navigate('/directory')}
      />
      
      <StatCard 
        title="Total Clients" 
        value={stats.totalClients.toLocaleString('en-IN')} 
        subtitle="Active accounts"
        icon={<Users />} 
        onClick={() => navigate('/directory')}
      />
      
      <StatCard 
        title="Interaction Logs" 
        value={stats.totalInteractions.toLocaleString('en-IN')} 
        subtitle="Recorded touchpoints"
        icon={<Clock />} 
      />
      
      <StatCard 
        title="Managed AUM" 
        value={formatAUM(stats.totalAUM)} 
        subtitle="Combined portfolio"
        icon={<TrendingUp />} 
        onClick={() => navigate('/directory')}
      />
    </div>
  );
};

export default StatCards;