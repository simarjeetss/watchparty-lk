import React from 'react';
import ReactMarkdown from 'react-markdown';

const markdown = `
# LiveKit Meet: How It Works

LiveKit Meet is a video conferencing and watch party app built with Next.js and LiveKit Components.

## How It Works
- **Room Creation & Join:** Users create or join rooms, each identified by a unique ID.
- **WebSocket Connection:** The app fetches a server URL and token, then connects to a LiveKit server using WebSockets for real-time media and chat.
- **Media Handling:** Audio, video, and screen sharing are managed by the LiveKit SDK, which handles all signaling and media transport.
- **UI Components:** The interface is built with reusable React components for chat, participant tiles, settings, and more.
- **Security:** End-to-end encryption (E2EE) is supported for private meetings.

## Tech Stack
- **Next.js** for server-side rendering and routing
- **React** for UI
- **LiveKit SDK** for real-time media

## Key Features
- Video conferencing
- Watch party mode
- Screen sharing
- Chat
- End-to-end encryption
`;

export default function TestPage() {
  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', padding: 24, background: '#18181b', color: '#fff', borderRadius: 12 }}>
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </main>
  );
}
