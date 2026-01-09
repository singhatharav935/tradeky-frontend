'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickData,
  LineData,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';

const TIMEFRAMES = { '1m': 60, '5m': 300, '15m': 900 };
type IndicatorMap = Record<string, boolean>;

export default function TradingChart({ onPriceUpdate }: any) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const seriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});
  const candles = useRef<CandlestickData[]>([]);
  const volume = useRef<number[]>([]);

  const [tf, setTf] = useState<'1m' | '5m' | '15m'>('1m');
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* 🔥 25+ INDICATORS */
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

    wma20: false,
    hma20: false,

    vwap: false,
    bb: false,
  });

  /* ================= INIT ================= */
  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      height: 420,
      layout: { background: { color: '#000' }, textColor: '#d1d4dc' },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      timeScale: { timeVisible: true },
      rightPriceScale: { autoScale: true },
    });

    chartRef.current = chart;
    candleSeriesRef.current = chart.addCandlestickSeries();

    // CREATE ALL SERIES ONCE
    const mk = (color: string) =>
      chart.addLineSeries({ color, visible: false });

    seriesRef.current = {
      ema5: mk('#16a34a'),
      ema9: mk('#22c55e'),
      ema13: mk('#4ade80'),
      ema21: mk('#3b82f6'),
      ema50: mk('#60a5fa'),
      ema100: mk('#818cf8'),
      ema200: mk('#a855f7'),

      sma20: mk('#fbbf24'),
      sma50: mk('#f59e0b'),
      sma100: mk('#fb7185'),
      sma200: mk('#ef4444'),

      wma20: mk('#14b8a6'),
      hma20: mk('#06b6d4'),

      vwap: mk('#0ea5e9'),
      bb_upper: mk('#d946ef'),
      bb_lower: mk('#d946ef'),
    };

    initData();
    candleSeriesRef.current.setData(candles.current);
    chart.timeScale().fitContent();

    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  function initData() {
    candles.current = [];
    volume.current = [];

    let t = Math.floor(Date.now() / 1000) - TIMEFRAMES[tf] * 60;
    let price = 42000;

    for (let i = 0; i < 60; i++) {
      const close = price + (Math.random() - 0.5) * 50;
      candles.current.push({
        time: t as UTCTimestamp,
        open: price,
        high: Math.max(price, close),
        low: Math.min(price, close),
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
    const p = last.close + (Math.random() - 0.5) * 20;

    last.close = p;
    last.high = Math.max(last.high, p);
    last.low = Math.min(last.low, p);

    candleSeriesRef.current.update(last);
    recalcIndicators();
    onPriceUpdate?.(p);
  }

  function recalcIndicators() {
    seriesRef.current.ema5.setData(calcEMA(candles.current, 5));
    seriesRef.current.ema9.setData(calcEMA(candles.current, 9));
    seriesRef.current.ema13.setData(calcEMA(candles.current, 13));
    seriesRef.current.ema21.setData(calcEMA(candles.current, 21));
    seriesRef.current.ema50.setData(calcEMA(candles.current, 50));
    seriesRef.current.ema100.setData(calcEMA(candles.current, 100));
    seriesRef.current.ema200.setData(calcEMA(candles.current, 200));

    seriesRef.current.sma20.setData(calcSMA(candles.current, 20));
    seriesRef.current.sma50.setData(calcSMA(candles.current, 50));
    seriesRef.current.sma100.setData(calcSMA(candles.current, 100));
    seriesRef.current.sma200.setData(calcSMA(candles.current, 200));

    seriesRef.current.wma20.setData(calcWMA(candles.current, 20));
    seriesRef.current.hma20.setData(calcHMA(candles.current, 20));

    seriesRef.current.vwap.setData(calcVWAP(candles.current, volume.current));

    const { upper, lower } = calcBB(candles.current, 20);
    seriesRef.current.bb_upper.setData(upper);
    seriesRef.current.bb_lower.setData(lower);
  }

  useEffect(() => {
    Object.entries(ind).forEach(([k, v]) => {
      if (k === 'bb') {
        seriesRef.current.bb_upper.applyOptions({ visible: v });
        seriesRef.current.bb_lower.applyOptions({ visible: v });
      } else {
        seriesRef.current[k]?.applyOptions({ visible: v });
      }
    });
  }, [ind]);

  return (
    <div className="relative bg-zinc-900 p-2 rounded border border-zinc-800">
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
          className="ml-auto px-3 py-1 bg-zinc-800 rounded"
        >
          Indicators
        </button>
      </div>

      <div ref={containerRef} className="w-full h-[420px]" />

      {drawerOpen && (
        <div className="absolute top-0 right-0 h-full w-64 bg-black border-l border-zinc-700 p-3 overflow-y-auto">
          {Object.keys(ind).map(k => (
            <label key={k} className="flex gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={ind[k]}
                onChange={() => setInd(s => ({ ...s, [k]: !s[k] }))}
              />
              {k.toUpperCase()}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== MATH ===== */
function calcEMA(c: CandlestickData[], p: number): LineData[] {
  const k = 2 / (p + 1);
  let ema = c[0].close;
  return c.map(x => ({ time: x.time, value: (ema = x.close * k + ema * (1 - k)) }));
}
function calcSMA(c: CandlestickData[], p: number): LineData[] {
  return c.map((x, i) => ({
    time: x.time,
    value:
      i < p
        ? x.close
        : c.slice(i - p, i).reduce((a, b) => a + b.close, 0) / p,
  }));
}
function calcWMA(c: CandlestickData[], p: number): LineData[] {
  return c.map((x, i) => {
    if (i < p) return { time: x.time, value: x.close };
    let sum = 0,
      w = 0;
    for (let j = 0; j < p; j++) {
      sum += c[i - j].close * (p - j);
      w += p - j;
    }
    return { time: x.time, value: sum / w };
  });
}
function calcHMA(c: CandlestickData[], p: number) {
  return calcWMA(c, Math.floor(p / 2));
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
function calcVWAP(c: CandlestickData[], v: number[]) {
  let pv = 0,
    tv = 0;
  return c.map((x, i) => {
    pv += x.close * v[i];
    tv += v[i];
    return { time: x.time, value: pv / tv };
  });
}
