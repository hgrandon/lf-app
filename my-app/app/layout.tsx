import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LF App",
  description: "Gestión de Clientes - LF",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-100 text-gray-800">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/file.svg"
                alt="LF"
                className="h-8 w-8"
              />
              <div className="leading-tight">
                <h1 className="text-lg font-bold text-indigo-600">LF App</h1>
                <p className="text-xs text-gray-500">Gestión rápida y simple</p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <a
                href="/test"
                className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 text-indigo-700"
              >
                Clientes
              </a>
              <a
                href="/test-conn"
                className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 text-indigo-700"
              >
                Conexión
              </a>
            </nav>
          </div>
        </header>

        {/* Main content wrapper */}
        <main className="mx-auto max-w-5xl p-4">{children}</main>

        {/* Footer chico */}
        <footer className="mt-8 border-t border-gray-200 bg-white/60">
          <div className="mx-auto max-w-5xl px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
            <span>© {new Date().getFullYear()} LF</span>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:opacity-80"
              title="Deploy"
            >
              <img src="/vercel.svg" alt="vercel" className="h-3" />
              <span>Deploy</span>
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}



