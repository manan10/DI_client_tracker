import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const MarketTicker = () => {
  const { request } = useApi();
  const [market, setMarket] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const data = await request('/settings/market-status');
      if (data && data.nifty) setMarket(data);
    } catch {
      console.error("Market fetch failed");
    }
  }, [request]);

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initFetch = async () => { if (isMounted) await fetchStatus(); };
    initFetch();
    const marketTimer = setInterval(fetchStatus, 300000);
    return () => { isMounted = false; clearInterval(marketTimer); };
  }, [fetchStatus]);

  // SKELETON: Compact height to match StatCards
  if (!market || !market.nifty) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl animate-pulse flex items-center justify-between">
        <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div>
      </div>
    );
  }

  const indices = [
    { label: 'NIFTY 50', data: market.nifty },
    { label: 'SENSEX', data: market.sensex }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl transition-all hover:border-amber-500/20">
      <div className="flex items-center justify-between gap-4">
        
        {/* Time & Status Strip */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-100 dark:border-slate-800 shrink-0">
          <div className={`p-1.5 rounded-lg ${market.source === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <Clock size={14} />
          </div>
          <div className="hidden sm:block">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">
              {market.source === 'live' ? 'LIVE' : 'CLOSED'}
            </p>
            <p className="text-[11px] font-black text-slate-800 dark:text-slate-100 tabular-nums leading-none">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Ticker Content */}
        <div className="flex flex-1 items-center gap-6 overflow-hidden">
          {indices.map((idx) => (
            <div key={idx.label} className="flex items-center gap-3 min-w-max">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                  {idx.label}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                    {idx.data?.last_price?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  <div className={`flex items-center text-[10px] font-bold ${idx.data?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {idx.data?.change >= 0 ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                    {idx.data?.percent_change?.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action */}
        <button 
          onClick={fetchStatus} 
          className="p-2 text-slate-300 hover:text-amber-600 transition-colors"
          title="Refresh Market"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  );
};

export default MarketTicker;