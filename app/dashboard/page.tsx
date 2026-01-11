'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import TradingChart from '@/components/TradingChart';
import TradePanel from '@/components/TradePanel';
import OrdersTable from '@/components/OrdersTable';
import { authFetch } from '@/lib/authFetch';

type Summary = {
  balance: number;
  unrealizedPnl: number;
  dailyPnl: number;
  capital: number;
};

type Position = {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entry: number;
  qty: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<'BTC' | 'NIFTY' | 'BANKNIFTY'>('BTC');
  const [price, setPrice] = useState<number>(0);
  const [positions, setPositions] = useState<Position[]>([]);

  const [showCertPanel, setShowCertPanel] = useState(false);
  const [showPropMessage, setShowPropMessage] = useState(false);

  const [summary, setSummary] = useState<Summary>({
    balance: 0,
    unrealizedPnl: 0,
    dailyPnl: 0,
    capital: 0,
  });

  const [loadingSummary, setLoadingSummary] = useState(true);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    authFetch('/api/protected')
      .then((data: any) => {
        if (data?.__unauthorized) {
          localStorage.removeItem('token');
          router.replace('/login');
          return;
        }
        setUserId(data.user.id);
      })
      .catch(() => {
        localStorage.removeItem('token');
        router.replace('/login');
      });
  }, [router]);

  /* ================= ACCOUNT SUMMARY ================= */
  const fetchAccountSummary = () => {
    setLoadingSummary(true);
    authFetch('/api/account/summary')
      .then((data: any) => {
        if (!data?.__unauthorized) {
          setSummary({
            balance: data.balance ?? 0,
            unrealizedPnl: 0,
            dailyPnl: data.dailyPnl ?? 0,
            capital: data.capital ?? 0,
          });
        }
      })
      .finally(() => setLoadingSummary(false));
  };

  useEffect(() => {
    fetchAccountSummary();
  }, []);

  /* ================= LIVE UNREALIZED P&L ================= */
  const liveUnrealizedPnl = useMemo(() => {
    if (!price) return 0;

    return positions.reduce((acc, p) => {
      const diff =
        p.side === 'BUY'
          ? price - p.entry
          : p.entry - price;

      return acc + diff * p.qty;
    }, 0);
  }, [positions, price]);

  const liveCapital = useMemo(() => {
    return summary.balance + summary.dailyPnl + liveUnrealizedPnl;
  }, [summary.balance, summary.dailyPnl, liveUnrealizedPnl]);

  /* ================= TRADE HANDLER ================= */
  async function handleTrade(side: 'BUY' | 'SELL') {
    if (!price) return;

    const res = await authFetch('/api/trades', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        side,
        price,
        quantity: 1,
      }),
    });

    if (res?.error) {
      alert(res.error);
      return;
    }

    setPositions(p => [
      ...p,
      {
        id: crypto.randomUUID(),
        symbol,
        side,
        entry: price,
        qty: 1,
      },
    ]);

    fetchAccountSummary();
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">

      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">TradeKY</h1>
          <p className="text-sm text-gray-400">
            User: {userId ?? 'Loading...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/community')}
            className="px-3 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
          >
            Community
          </button>

          <button
            onClick={() => router.push('/alerts/create')}
            className="px-3 py-2 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-400"
          >
            Create Alert
          </button>

          <button
            onClick={() => router.push('/contest')}
            className="px-3 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
          >
            Contest
          </button>

          <button
            onClick={() => {
              setShowCertPanel(true);
              setShowPropMessage(false);
            }}
            className="px-3 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
          >
            Certifications &amp; Badges
          </button>

          <select
            value={symbol}
            onChange={e =>
              setSymbol(e.target.value as 'BTC' | 'NIFTY' | 'BANKNIFTY')
            }
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
          >
            <option value="BTC">BTC</option>
            <option value="NIFTY">NIFTY</option>
            <option value="BANKNIFTY">BANKNIFTY</option>
          </select>
        </div>
      </div>

      {/* ===== CERTIFICATIONS PANEL ===== */}
      {showCertPanel && (
        <div className="border border-zinc-700 bg-zinc-900 rounded-lg p-6 max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Certifications & Badges</h2>
            <button
              onClick={() => setShowCertPanel(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            You haven’t earned any skill certificates or badges yet.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setShowPropMessage(true)}
              className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
            >
              Prop Funding Company Requirements
            </button>

            <button className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700">
              Upload Resume
            </button>

            <button className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700">
              Upload Certifications
            </button>
          </div>

          {showPropMessage && (
            <div className="text-sm text-gray-300 border border-zinc-700 bg-black rounded p-3">
              No requirements are open at the moment.
            </div>
          )}
        </div>
      )}

      {/* ===== MONEY / P&L ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Stat label="Balance" value={loadingSummary ? '—' : `₹${summary.balance.toFixed(2)}`} />
        <Stat label="Unrealized P&L (Live)" value={price ? `₹${liveUnrealizedPnl.toFixed(2)}` : '—'} />
        <Stat label="Daily P&L" value={loadingSummary ? '—' : `₹${summary.dailyPnl.toFixed(2)}`} />
        <Stat label="Capital (Live)" value={price ? `₹${liveCapital.toFixed(2)}` : '—'} />
      </div>

      <TradingChart onPriceUpdate={setPrice} />

      <TradePanel
        symbol={symbol}
        livePrice={price}
        onTrade={handleTrade}
      />

      <OrdersTable
        positions={positions}
        livePrice={price}
        onClose={id =>
          setPositions(p => p.filter(x => x.id !== id))
        }
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
