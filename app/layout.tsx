import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import NotificationBell from '@/components/NotificationBell';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <AuthProvider>
          <SocketProvider>
            {/* ================= TOP BAR ================= */}
            <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4">
              <span className="font-semibold text-sm">
                TradeKY
              </span>

              {/* 🔔 NOTIFICATIONS */}
              <NotificationBell />
            </header>

            {/* ================= PAGE CONTENT ================= */}
            <main className="pt-4">
              {children}
            </main>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
