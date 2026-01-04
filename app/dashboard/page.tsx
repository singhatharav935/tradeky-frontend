'use client';

import { useEffect, useState } from 'react';
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

export default function DashboardPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<'BTC' | 'NIFTY' | 'BANKNIFTY'>('BTC');
  const [price, setPrice] = useState<number>(0);
  const [positions, setPositions] = useState<any[]>([]);

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
  useEffect(() => {
    authFetch('/api/account/summary')
      .then((data: any) => {
        if (!data?.__unauthorized) {
          setSummary({
            balance: data.balance ?? 0,
            unrealizedPnl: data.unrealizedPnl ?? 0,
            dailyPnl: data.dailyPnl ?? 0,
            capital: data.capital ?? 0,
          });
        }
      })
      .finally(() => setLoadingSummary(false));
  }, []);

  /* ================= TRADE HANDLER ================= */
  function handleTrade(side: 'BUY' | 'SELL') {
    if (!price) return;

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

      {/* ===== MONEY / P&L SECTION ===== */}
      <div className="grid grid-cols-4 gap-4">
        <Stat
          label="Balance"
          value={loadingSummary ? '—' : `₹${summary.balance}`}
        />
        <Stat
          label="Unrealized P&L"
          value={loadingSummary ? '—' : `₹${summary.unrealizedPnl}`}
        />
        <Stat
          label="Daily P&L"
          value={loadingSummary ? '—' : `₹${summary.dailyPnl}`}
        />
        <Stat
          label="Capital"
          value={loadingSummary ? '—' : `₹${summary.capital}`}
        />
      </div>

      {/* ===== CHART ===== */}
      <TradingChart onPriceUpdate={setPrice} />

      {/* ===== TRADE PANEL ===== */}
      <TradePanel
        symbol={symbol}
        livePrice={price}
        onTrade={handleTrade}
      />

      {/* ===== ORDERS ===== */}
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

/* ================= STAT CARD ================= */
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
