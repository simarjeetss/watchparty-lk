import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
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
    <html lang="en">
      <body data-lk-theme="default">
        <Toaster />
        {children}
      </body>
    </html>
  );
}
