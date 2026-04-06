import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://watchparty.app',
  ),
  title: {
    default: 'WatchParty | Watch Videos Together in Real-Time',
    template: '%s | WatchParty',
  },
  description:
    'meow',
  twitter: {
    card: 'summary_large_image',
  },
  openGraph: {
    url: 'https://watchparty.app',
    images: [
      {
        url: '/images/livekit-meet-open-graph.png',
        width: 2000,
        height: 1000,
        type: 'image/png',
      },
    ],
    siteName: 'WatchParty',
  },
  icons: {
    icon: {
      rel: 'icon',
      // url: '/favicon.ico',
      url: 'test',
    },
    apple: [
      {
        rel: 'apple-touch-icon',
        url: '/images/livekit-apple-touch.png',
        sizes: '180x180',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body data-lk-theme="default">
        <Toaster
          toastOptions={{
            style: {
              background: '#141414',
              color: '#f0ede8',
              border: '1px solid #2a2a2a',
              borderRadius: '2px',
              fontFamily: "'DM Mono', monospace",
              fontSize: '0.8rem',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
