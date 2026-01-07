'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickData,
  LineData,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';

/* ================= CONFIG ================= */
const TIMEFRAMES = { '1m': 60, '5m': 300, '15m': 900 };

type IndicatorMap = Record<string, boolean>;

export default function TradingChart({ onPriceUpdate }: any) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const candleSeries = useRef<any>(null);

  const indicatorSeries = useRef<Record<string, ISeriesApi<'Line'>>>({});

  const candles = useRef<CandlestickData[]>([]);
  const volume = useRef<number[]>([]);

  const [tf, setTf] = useState<'1m' | '5m' | '15m'>('1m');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [ind, setInd] = useState<IndicatorMap>({
    // EMA
    ema5: false,
    ema9: false,
    ema13: false,
    ema21: false,
    ema50: false,
    ema100: false,
    ema200: false,

    // SMA
    sma10: false,
    sma20: false,
    sma50: false,
    sma100: false,
    sma200: false,

    // Core
    vwap: false,
    bb: false,
    rsi: false,
    macd: false,
  });

  const now = (): UTCTimestamp =>
    Math.floor(Date.now() / 1000) as UTCTimestamp;

  /* ================= CHART INIT ================= */
  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      height: 420,
      width: containerRef.current.clientWidth,
      layout: { background: { color: '#000' }, textColor: '#d1d4dc' },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      timeScale: { timeVisible: true, secondsVisible: tf === '1m' },
      rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.25 } },
    });

    candleSeries.current = chartRef.current.addCandlestickSeries();

    initData();
    candleSeries.current.setData(candles.current);
    chartRef.current.timeScale().fitContent();

    const interval = setInterval(tick, 1000);
    return () => {
      clearInterval(interval);
      chartRef.current.remove();
      indicatorSeries.current = {};
    };
  }, [tf]);

  /* ================= DATA ================= */
  function initData() {
    candles.current = [];
    volume.current = [];

    let t = Number(now()) - TIMEFRAMES[tf] * 60;
    let price = 42000;

    for (let i = 0; i < 60; i++) {
      const close = price + (Math.random() - 0.5) * 50;
      candles.current.push({
        time: t as UTCTimestamp,
        open: price,
        high: Math.max(price, close) + 20,
        low: Math.min(price, close) - 20,
        close,
      });
      volume.current.push(Math.random() * 1000);
      price = close;
      t += TIMEFRAMES[tf];
    }
    recalcIndicators();
  }

  function tick() {
    const last = candles.current.at(-1)!;
    const newPrice = last.close + (Math.random() - 0.5) * 20;

    last.close = newPrice;
    last.high = Math.max(last.high, newPrice);
    last.low = Math.min(last.low, newPrice);
    candleSeries.current.update(last);

    recalcIndicators();
    onPriceUpdate?.(newPrice);
  }

  /* ================= INDICATORS ================= */
  function getSeries(key: string, color: string) {
    if (!indicatorSeries.current[key]) {
      indicatorSeries.current[key] =
        chartRef.current.addLineSeries({ color });
    }
    return indicatorSeries.current[key];
  }

  function hideSeries(key: string) {
    const s = indicatorSeries.current[key];
    if (s) s.setData([]);
  }

  function recalcIndicators() {
    Object.entries(ind).forEach(([key, enabled]) => {
      if (!enabled) {
        hideSeries(key);
        hideSeries(key + '_2');
        return;
      }

      if (key.startsWith('ema')) {
        const p = Number(key.replace('ema', ''));
        getSeries(key, '#22c55e').setData(calcEMA(candles.current, p));
      }

      if (key.startsWith('sma')) {
        const p = Number(key.replace('sma', ''));
        getSeries(key, '#f59e0b').setData(calcSMA(candles.current, p));
      }

      if (key === 'vwap') {
        getSeries(key, '#14b8a6').setData(calcVWAP(candles.current, volume.current));
      }

      if (key === 'bb') {
        const { upper, lower } = calcBB(candles.current, 20);
        getSeries('bb', '#a855f7').setData(upper);
        getSeries('bb_2', '#a855f7').setData(lower);
      }

      if (key === 'rsi') {
        getSeries(key, '#3b82f6').setData(calcRSI(candles.current, 14));
      }

      if (key === 'macd') {
        getSeries(key, '#ef4444').setData(calcMACD(candles.current));
      }
    });
  }

  return (
    <div className="relative bg-zinc-900 p-2 rounded border border-zinc-800">
      {/* TOP BAR */}
      <div className="flex gap-2 mb-2 text-xs">
        {(['1m', '5m', '15m'] as const).map(x => (
          <button
            key={x}
            onClick={() => setTf(x)}
            className={`px-2 py-1 rounded ${
              tf === x ? 'bg-yellow-500 text-black' : 'bg-zinc-800'
            }`}
          >
            {x}
          </button>
        ))}

        <button
          onClick={() => setDrawerOpen(v => !v)}
          className="ml-auto px-3 py-1 bg-zinc-800 rounded hover:bg-zinc-700"
        >
          Indicators
        </button>
      </div>

      <div ref={containerRef} className="w-full h-[420px]" />

      {/* DRAWER */}
      {drawerOpen && (
        <div className="absolute top-0 right-0 h-full w-64 bg-black border-l border-zinc-700 p-3 overflow-y-auto text-sm z-50">
          <h3 className="font-semibold mb-3">Indicators</h3>
          {Object.keys(ind).map(k => (
            <label key={k} className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={ind[k]}
                onChange={() =>
                  setInd(s => ({ ...s, [k]: !s[k] }))
                }
              />
              <span>{k.toUpperCase()}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= MATH ================= */
function calcEMA(c: CandlestickData[], p: number): LineData[] {
  const k = 2 / (p + 1);
  let ema = c[0].close;
  return c.map(x => {
    ema = x.close * k + ema * (1 - k);
    return { time: x.time, value: ema };
  });
}

function calcSMA(c: CandlestickData[], p: number): LineData[] {
  return c.map((x, i) => {
    if (i < p) return { time: x.time, value: x.close };
    const avg = c.slice(i - p, i).reduce((a, b) => a + b.close, 0) / p;
    return { time: x.time, value: avg };
  });
}

function calcBB(c: CandlestickData[], p: number) {
  const upper: LineData[] = [];
  const lower: LineData[] = [];
  c.forEach((x, i) => {
    if (i < p) return;
    const slice = c.slice(i - p, i);
    const mean = slice.reduce((a, b) => a + b.close, 0) / p;
    const std = Math.sqrt(
      slice.reduce((a, b) => a + (b.close - mean) ** 2, 0) / p
    );
    upper.push({ time: x.time, value: mean + 2 * std });
    lower.push({ time: x.time, value: mean - 2 * std });
  });
  return { upper, lower };
}

function calcVWAP(c: CandlestickData[], v: number[]): LineData[] {
  let pv = 0,
    tv = 0;
  return c.map((x, i) => {
    pv += x.close * v[i];
    tv += v[i];
    return { time: x.time, value: pv / tv };
  });
}

function calcRSI(c: CandlestickData[], p: number): LineData[] {
  let gains = 0,
    losses = 0;
  return c.map((x, i) => {
    if (i === 0) return { time: x.time, value: 50 };
    const diff = x.close - c[i - 1].close;
    gains += diff > 0 ? diff : 0;
    losses += diff < 0 ? -diff : 0;
    const rs = gains / (losses || 1);
    return { time: x.time, value: 100 - 100 / (1 + rs) };
  });
}

function calcMACD(c: CandlestickData[]): LineData[] {
  const fast = calcEMA(c, 12);
  const slow = calcEMA(c, 26);
  return fast.map((x, i) => ({
    time: x.time,
    value: x.value - (slow[i]?.value || 0),
  }));
}
