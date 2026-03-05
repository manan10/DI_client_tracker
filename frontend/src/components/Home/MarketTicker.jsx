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
      // Only set state if the data actually contains the expected keys
      if (data && data.nifty) {
        setMarket(data);
      }
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

  // SKELETON: Show while loading OR if data is malformed
  if (!market || !market.nifty) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl mb-8 animate-pulse flex items-center justify-between">
        <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-5 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
      </div>
    );
  }

  const indices = [
    { label: 'NIFTY 50', data: market.nifty },
    { label: 'SENSEX', data: market.sensex }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="flex items-center gap-4 border-r border-slate-100 dark:border-slate-800 pr-6 hidden lg:flex">
          <div className={`p-2.5 rounded-xl ${market.source === 'live' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {market.source === 'live' ? 'Market Live' : 'Market Closed'}
            </p>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 tabular-nums">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex flex-1 gap-12 overflow-x-auto scrollbar-hide py-1 px-1">
          {indices.map((idx) => (
            <div key={idx.label} className="flex items-center gap-5 min-w-max">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {idx.label} {market.source !== 'live' && '(CLOSE)'}
                </p>
                <p className="text-md font-black text-slate-800 dark:text-slate-100 font-mono">
                  {/* OPTIONAL CHAINING TO PREVENT CRASH */}
                  ₹{idx.data?.last_price?.toLocaleString('en-IN') || '0'}
                </p>
              </div>
              
              <div className={`flex flex-col items-end ${idx.data?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <div className="flex items-center gap-1">
                  {idx.data?.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="text-xs font-black tracking-tight">{idx.data?.percent_change?.toFixed(2) || '0.00'}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-slate-100 dark:border-slate-800">
          <button onClick={fetchStatus} className="p-2 text-slate-400 hover:text-amber-600">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;