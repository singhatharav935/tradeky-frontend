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

  const [ind, setInd] = useState<IndicatorMap>({
    ema9: false,
    ema21: false,
    sma50: false,
    sma200: false,
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
      rightPriceScale: {
        autoScale: true,
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    candleSeriesRef.current = chart.addCandlestickSeries({
      priceScaleId: 'right',
    });

    // 🔒 CREATE ALL INDICATORS ON SAME PRICE SCALE
    seriesRef.current = {
      ema9: chart.addLineSeries({ color: '#22c55e', visible: false, priceScaleId: 'right' }),
      ema21: chart.addLineSeries({ color: '#3b82f6', visible: false, priceScaleId: 'right' }),
      sma50: chart.addLineSeries({ color: '#f59e0b', visible: false, priceScaleId: 'right' }),
      sma200: chart.addLineSeries({ color: '#ef4444', visible: false, priceScaleId: 'right' }),
      vwap: chart.addLineSeries({ color: '#14b8a6', visible: false, priceScaleId: 'right' }),
      bb_upper: chart.addLineSeries({ color: '#a855f7', visible: false, priceScaleId: 'right' }),
      bb_lower: chart.addLineSeries({ color: '#a855f7', visible: false, priceScaleId: 'right' }),
    };

    initData();
    candleSeriesRef.current.setData(candles.current);
    chart.timeScale().fitContent();

    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  /* ================= DATA ================= */
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
    const newPrice = last.close + (Math.random() - 0.5) * 20;

    last.close = newPrice;
    last.high = Math.max(last.high, newPrice);
    last.low = Math.min(last.low, newPrice);

    candleSeriesRef.current.update(last);
    recalcIndicators();
    onPriceUpdate?.(newPrice);
  }

  /* ================= INDICATORS ================= */
  function recalcIndicators() {
    seriesRef.current.ema9.setData(calcEMA(candles.current, 9));
    seriesRef.current.ema21.setData(calcEMA(candles.current, 21));
    seriesRef.current.sma50.setData(calcSMA(candles.current, 50));
    seriesRef.current.sma200.setData(calcSMA(candles.current, 200));
    seriesRef.current.vwap.setData(calcVWAP(candles.current, volume.current));

    const { upper, lower } = calcBB(candles.current, 20);
    seriesRef.current.bb_upper.setData(upper);
    seriesRef.current.bb_lower.setData(lower);
  }

  /* ================= VISIBILITY ================= */
  useEffect(() => {
    seriesRef.current.ema9.applyOptions({ visible: ind.ema9 });
    seriesRef.current.ema21.applyOptions({ visible: ind.ema21 });
    seriesRef.current.sma50.applyOptions({ visible: ind.sma50 });
    seriesRef.current.sma200.applyOptions({ visible: ind.sma200 });
    seriesRef.current.vwap.applyOptions({ visible: ind.vwap });
    seriesRef.current.bb_upper.applyOptions({ visible: ind.bb });
    seriesRef.current.bb_lower.applyOptions({ visible: ind.bb });
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
        <div className="absolute top-0 right-0 h-full w-64 bg-black border-l border-zinc-700 p-3">
          {Object.keys(ind).map(k => (
            <label key={k} className="flex gap-2 mb-2 text-sm">
              <input
                type="checkbox"
                checked={ind[k]}
                onChange={() =>
                  setInd(s => ({ ...s, [k]: !s[k] }))
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
  let pv = 0;
  let tv = 0;
  return c.map((x, i) => {
    pv += x.close * v[i];
    tv += v[i];
    return { time: x.time, value: pv / tv };
  });
}
