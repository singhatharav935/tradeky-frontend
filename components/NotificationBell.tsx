'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

type Notification = {
  _id: string;
  type: string;
  read: boolean;
  symbol?: string;
  timeframe?: string;
  triggerValue?: number;
  createdAt: string;
  from?: { name: string };
  meta?: {
    confidence?: number;
    trendBias?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
};

export default function NotificationBell() {
  const { socket } = useSocket();

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  /* ================= LOAD COUNT ================= */
  const loadCount = async () => {
    if (!token) return;

    const res = await fetch(
      'https://tradeky-backend.onrender.com/api/notifications/unread/count',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setCount(data.count || 0);
  };

  /* ================= LOAD NOTIFICATIONS ================= */
  const loadNotifications = async () => {
    if (!token) return;

    const res = await fetch(
      'https://tradeky-backend.onrender.com/api/notifications',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    setNotifications(data);
  };

  /* ================= MARK ALL READ ================= */
  const markAllRead = async () => {
    if (!token) return;

    await fetch(
      'https://tradeky-backend.onrender.com/api/notifications/read-all',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    loadCount();
    loadNotifications();
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    loadCount();
  }, []);

  /* ================= SOCKET REAL-TIME ================= */
  useEffect(() => {
    if (!socket) return;

    const onNotification = (notification: Notification) => {
      setCount(prev => prev + 1);
      setNotifications(prev => [notification, ...prev]);
    };

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
    };
  }, [socket]);

  /* ================= HELPERS ================= */
  const trendColor = (trend?: string) => {
    if (trend === 'BULLISH') return 'text-green-400';
    if (trend === 'BEARISH') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="relative">
      {/* 🔔 BELL */}
      <button
        onClick={() => {
          setOpen(!open);
          loadNotifications();
        }}
        className="relative"
      >
        🔔
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1 rounded">
            {count}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-zinc-800 rounded shadow-lg z-50">
          <div className="flex justify-between items-center px-3 py-2 border-b border-zinc-800">
            <span className="text-sm font-semibold">Notifications</span>
            <button
              onClick={markAllRead}
              className="text-xs text-yellow-400"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 p-3">
                No notifications
              </p>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`px-3 py-2 text-xs border-b border-zinc-800 ${
                    !n.read ? 'bg-zinc-800' : ''
                  }`}
                >
                  {n.type.startsWith('ALERT') ? (
                    <div className="space-y-1">
                      <div>
                        🚨 <b>{n.type.replace('ALERT_', '')}</b> on{' '}
                        <b>{n.symbol}</b> ({n.timeframe})
                        {n.triggerValue !== undefined && (
                          <> @ {n.triggerValue}</>
                        )}
                      </div>

                      {/* 🔥 LAYER 2 INFO */}
                      {(n.meta?.confidence || n.meta?.trendBias) && (
                        <div className="flex gap-2 text-[10px]">
                          {n.meta?.confidence !== undefined && (
                            <span className="bg-zinc-700 px-2 py-[1px] rounded">
                              CONF {n.meta.confidence}%
                            </span>
                          )}
                          {n.meta?.trendBias && (
                            <span
                              className={`px-2 py-[1px] rounded ${trendColor(
                                n.meta.trendBias
                              )}`}
                            >
                              {n.meta.trendBias}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>
                      🔔 {n.from?.name} {n.type.toLowerCase()}
                    </span>
                  )}

                  <div className="text-[10px] text-gray-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
