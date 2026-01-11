'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';

type Condition = 'GT' | 'LT' | 'CROSS_ABOVE' | 'CROSS_BELOW';
type TriggerType = 'ENTRY' | 'EXIT';

export default function CreateAlertPage() {
  const router = useRouter();

  const [symbol, setSymbol] = useState('BTC');
  const [timeframe, setTimeframe] = useState('5m');
  const [indicator, setIndicator] = useState('EMA');
  const [condition, setCondition] = useState<Condition>('CROSS_ABOVE');
  const [triggerType, setTriggerType] = useState<TriggerType>('ENTRY');

  const [params, setParams] = useState({
    fast: 9,
    slow: 21,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createAlert() {
    setError(null);
    setLoading(true);

    const res = await authFetch('/api/alert-rules', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        timeframe,
        triggerType,
        logic: {
          indicator,
          condition,
          params,
        },
      }),
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

    // ✅ success → go back to dashboard
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto space-y-6">

      <h1 className="text-2xl font-semibold">
        Create Alert
      </h1>

      {/* SYMBOL */}
      <div>
        <label className="text-sm text-gray-400">Symbol</label>
        <select
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="BTC">BTC</option>
          <option value="NIFTY">NIFTY</option>
          <option value="BANKNIFTY">BANKNIFTY</option>
        </select>
      </div>

      {/* TIMEFRAME */}
      <div>
        <label className="text-sm text-gray-400">Timeframe</label>
        <select
          value={timeframe}
          onChange={e => setTimeframe(e.target.value)}
          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
        </select>
      </div>

      {/* INDICATOR */}
      <div>
        <label className="text-sm text-gray-400">Indicator</label>
        <select
          value={indicator}
          onChange={e => setIndicator(e.target.value)}
          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="EMA">EMA</option>
          <option value="RSI">RSI</option>
          <option value="VWAP">VWAP</option>
        </select>
      </div>

      {/* CONDITION */}
      <div>
        <label className="text-sm text-gray-400">Condition</label>
        <select
          value={condition}
          onChange={e => setCondition(e.target.value as Condition)}
          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="GT">Greater Than</option>
          <option value="LT">Less Than</option>
          <option value="CROSS_ABOVE">Cross Above</option>
          <option value="CROSS_BELOW">Cross Below</option>
        </select>
      </div>

      {/* EMA PARAMS */}
      {indicator === 'EMA' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-400">Fast EMA</label>
            <input
              type="number"
              value={params.fast}
              onChange={e =>
                setParams(p => ({ ...p, fast: Number(e.target.value) }))
              }
              className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Slow EMA</label>
            <input
              type="number"
              value={params.slow}
              onChange={e =>
                setParams(p => ({ ...p, slow: Number(e.target.value) }))
              }
              className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
            />
          </div>
        </div>
      )}

      {/* ENTRY / EXIT */}
      <div>
        <label className="text-sm text-gray-400">Trigger Type</label>
        <select
          value={triggerType}
          onChange={e => setTriggerType(e.target.value as TriggerType)}
          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2"
        >
          <option value="ENTRY">ENTRY</option>
          <option value="EXIT">EXIT</option>
        </select>
      </div>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={createAlert}
        disabled={loading}
        className="w-full bg-yellow-500 text-black font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Alert'}
      </button>
    </div>
  );
}
