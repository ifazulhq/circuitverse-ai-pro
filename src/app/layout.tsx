import "./globals.css";

export const metadata = {
  title: "CircuitVerse AI Pro",
  description: "AI-powered digital circuit simulator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('circuitverse-theme');
                if (t === 'light' || t === 'cyberpunk' || t === 'dark') {
                  document.documentElement.dataset.theme = t;
                } else {
                  document.documentElement.dataset.theme = 'dark';
                }
                var m = localStorage.getItem('circuitverse-motion');
                if (m === 'reduced' || m === 'full') {
                  document.documentElement.dataset.motion = m;
                }
                var d = localStorage.getItem('circuitverse-interface-density');
                if (d === 'compact' || d === 'standard') {
                  document.documentElement.dataset.density = d;
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}