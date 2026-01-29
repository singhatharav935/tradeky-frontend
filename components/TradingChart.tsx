'use client';

import { useEffect, useRef, useState } from 'react';
import { datafeed } from '@/lib/tradingViewDatafeed';

/* ================= TRADINGVIEW GLOBAL ================= */
declare global {
  interface Window {
    TradingView: any;
  }
}

/* ================= TIMEFRAMES ================= */
const TF_MAP: Record<string, string> = {
  '1m': '1',
  '5m': '5',
  '10m': '10',
  '15m': '15',
  '30m': '30',
  '60m': '60',
};

type IndicatorMap = Record<string, boolean>;

export default function TradingChart({ onPriceUpdate }: any) {
  const tvRef = useRef<HTMLDivElement | null>(null);
  const tvWidgetRef = useRef<any>(null);
  const studiesRef = useRef<Record<string, any>>({});

  const [tf, setTf] =
    useState<'1m' | '5m' | '10m' | '15m' | '30m' | '60m'>('1m');
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ================= INDICATORS ================= */
  const [ind, setInd] = useState<IndicatorMap>({
    ema5: false,
    ema9: false,
    ema13: false,
    ema21: false,
    ema50: false,
    ema100: false,
    ema200: false,

    sma20: false,
    sma50: false,
    sma100: false,
    sma200: false,

    vwap: false,
    bb: false,
  });

  /* ================= INIT TRADINGVIEW ================= */
  useEffect(() => {
    if (!tvRef.current) return;

    tvWidgetRef.current = new window.TradingView.widget({
      symbol: 'NSE:NIFTY',
      interval: TF_MAP[tf],
      container: tvRef.current,
      library_path: '/charting_library/',
      datafeed,
      autosize: true,
      theme: 'dark',
      timezone: 'Asia/Kolkata',
      disabled_features: [
        'header_symbol_search',
        'header_compare',
        'use_localstorage_for_settings',
      ],
    });

    tvWidgetRef.current.onChartReady(() => {
      const chart = tvWidgetRef.current.activeChart();

      // 🔥 REAL PRICE FROM BACKEND
      chart.onDataLoaded().subscribe(null, () => {
        chart.getSeries().then((series: any) => {
          series.onRealtimeCallback((bar: any) => {
            if (bar?.close) onPriceUpdate?.(bar.close);
          });
        });
      });

      syncIndicators();
    });

    return () => {
      tvWidgetRef.current?.remove();
    };
  }, []);

  /* ================= TIMEFRAME CHANGE ================= */
  useEffect(() => {
    if (!tvWidgetRef.current) return;
    tvWidgetRef.current.activeChart().setResolution(TF_MAP[tf]);
  }, [tf]);

  /* ================= INDICATOR SYNC ================= */
  useEffect(() => {
    if (!tvWidgetRef.current) return;
    syncIndicators();
  }, [ind]);

  function syncIndicators() {
    const chart = tvWidgetRef.current.activeChart();
    if (!chart) return;

    const map: Record<string, { name: string; opts: any }> = {
      ema5: { name: 'Moving Average Exponential', opts: { length: 5 } },
      ema9: { name: 'Moving Average Exponential', opts: { length: 9 } },
      ema13: { name: 'Moving Average Exponential', opts: { length: 13 } },
      ema21: { name: 'Moving Average Exponential', opts: { length: 21 } },
      ema50: { name: 'Moving Average Exponential', opts: { length: 50 } },
      ema100: { name: 'Moving Average Exponential', opts: { length: 100 } },
      ema200: { name: 'Moving Average Exponential', opts: { length: 200 } },

      sma20: { name: 'Moving Average', opts: { length: 20 } },
      sma50: { name: 'Moving Average', opts: { length: 50 } },
      sma100: { name: 'Moving Average', opts: { length: 100 } },
      sma200: { name: 'Moving Average', opts: { length: 200 } },

      vwap: { name: 'VWAP', opts: {} },
      bb: { name: 'Bollinger Bands', opts: {} },
    };

    Object.entries(map).forEach(([key, cfg]) => {
      if (ind[key]) {
        if (!studiesRef.current[key]) {
          chart.createStudy(cfg.name, false, false, cfg.opts, studyId => {
            studiesRef.current[key] = studyId;
          });
        }
      } else {
        if (studiesRef.current[key]) {
          chart.removeEntity(studiesRef.current[key]);
          delete studiesRef.current[key];
        }
      }
    });
  }

  /* ================= UI ================= */
  return (
    <div className="relative bg-zinc-900 p-2 rounded border border-zinc-800">
      <div className="flex gap-2 mb-2 text-xs">
        {Object.keys(TF_MAP).map(x => (
          <button
            key={x}
            onClick={() => setTf(x as any)}
            className={`px-2 py-1 rounded ${
              tf === x ? 'bg-yellow-500 text-black' : 'bg-zinc-800'
            }`}
          >
            {x}
          </button>
        ))}

        <button
          onClick={() => setDrawerOpen(v => !v)}
          className="ml-auto px-3 py-1 bg-zinc-800 rounded"
        >
          Indicators
        </button>
      </div>

      {/* ✅ MODERN TRADINGVIEW CHART */}
      <div ref={tvRef} className="w-full h-[420px]" />

      {drawerOpen && (
        <div className="absolute top-0 right-0 h-full w-64 bg-black border-l border-zinc-700 p-3 overflow-y-auto z-50">
          {Object.keys(ind).map(k => (
            <label key={k} className="flex gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={ind[k]}
                onChange={e =>
                  setInd(p => ({ ...p, [k]: e.target.checked }))
                }
              />
              {k.toUpperCase()}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
