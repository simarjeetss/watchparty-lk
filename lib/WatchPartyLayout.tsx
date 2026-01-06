'use client';

import React, { useState } from 'react';
import {
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
  TrackRefContext,
  ControlBar,
  GridLayout,
  ParticipantTile,
  TrackLoop,
  useLocalParticipant,
  LayoutContextProvider,
  useCreateLayoutContext,
  useChat,
  ChatEntry,
  formatChatMessageLinks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useScreenShare } from './useScreenShare';
import { ConnectionQuality } from './ConnectionQuality';
import styles from '../styles/WatchParty.module.css';

/**
 * WatchParty Layout Component
 * 
 * This component provides a cinema-style layout optimized for watch parties:
 * - When screen share is active: Screen share takes up most of the viewport
 *   with participant videos as small floating thumbnails
 * - When no screen share: Standard grid layout for participants
 */
export function WatchPartyLayout() {
  // Create layout context for ControlBar
  const layoutContext = useCreateLayoutContext();

  return (
    <LayoutContextProvider value={layoutContext}>
      <WatchPartyLayoutInner />
    </LayoutContextProvider>
  );
}

function WatchPartyLayoutInner() {
  const {
    isScreenShareActive,
    screenShareParticipant,
    hasScreenShareAudio,
    participantCount,
  } = useScreenShare();

  const [thumbnailsCollapsed, setThumbnailsCollapsed] = useState(false);
  const [chatVisible, setChatVisible] = useState(true);

  // Chat functionality using useChat hook
  const { chatMessages, send, isSending } = useChat();
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = () => {
    if (chatInput.trim() && !isSending) {
      send(chatInput.trim());
      setChatInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get all tracks for rendering
  const screenShareTrackRefs = useTracks([Track.Source.ScreenShare]);
  const screenShareAudioTrackRefs = useTracks([Track.Source.ScreenShareAudio]);
  const cameraTracks = useTracks([Track.Source.Camera]);
  const participantTracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]);

  const participants = useParticipants();

  if (isScreenShareActive && screenShareTrackRefs.length > 0) {
    // Cinema Mode: Screen share is active
    return (
      <div className={styles.watchPartyContainer}>
        <div className={styles.cinemaMode}>
          {/* Content area: main content + chat */}
          <div className={styles.contentArea}>
            <div className={styles.mainContent}>
              {/* Screen share indicator */}
              {/* <div className={styles.screenShareIndicator}>
                {screenShareParticipant?.name || screenShareParticipant?.identity} is sharing
              </div> */}


              {/* Participant count and connection quality */}
              <div className={styles.participantCount}>
                    {participantCount} watching
                <span style={{ marginLeft: '12px' }}>
                  <ConnectionQuality showLabel={false} />
                </span>
              </div>

              {/* Main screen share view */}
              <div className={styles.screenShareView}>
                <TrackRefContext.Provider value={screenShareTrackRefs[0]}>
                  <VideoTrack
                    trackRef={screenShareTrackRefs[0]}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </TrackRefContext.Provider>
              </div>

              {/* Render screen share audio if available */}
              {screenShareAudioTrackRefs.map((trackRef) => (
                <AudioTrack key={trackRef.publication?.trackSid} trackRef={trackRef} />
              ))}

              {/* Toggle button for thumbnails */}
              {/* <button
                className={styles.toggleThumbnails}
                onClick={() => setThumbnailsCollapsed(!thumbnailsCollapsed)}
              >
                {thumbnailsCollapsed ? '👥 Show participants' : '👁️ Hide participants'}
              </button> */}

              {/* Floating participant thumbnails */}
              {!thumbnailsCollapsed && cameraTracks.length > 0 && (
                <div className={styles.participantThumbnails}>
                  <TrackLoop tracks={cameraTracks.slice(0, 6)}>
                    <div className={styles.thumbnailItem}>
                      <ParticipantTile />
                    </div>
                  </TrackLoop>
                  {cameraTracks.length > 6 && (
                    <div className={styles.thumbnailItem} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px'
                    }}>
                      +{cameraTracks.length - 6} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Panel */}
            {chatVisible && (
              <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                  <span>Chat</span>
                  <button 
                    className={styles.chatCloseButton}
                    onClick={() => setChatVisible(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.chatMessages}>
                  {chatMessages.length === 0 ? (
                    <div className={styles.chatEmpty}>
                      No messages yet. Say hi! 👋
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <ChatEntry
                        key={msg.timestamp}
                        entry={msg}
                        messageFormatter={formatChatMessageLinks}
                      />
                    ))
                  )}
                </div>
                <div className={styles.chatInputContainer}>
                  <input
                    type="text"
                    className={styles.chatInput}
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                  />
                  <button
                    className={styles.chatSendButton}
                    onClick={handleSendMessage}
                    disabled={isSending || !chatInput.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Control bar */}
          <ControlBar
            controls={{
              camera: true,
              microphone: true,
              screenShare: true,
              chat: false,
              leave: true,
            }}
          />
          
          {/* Custom chat toggle button */}
          {!chatVisible && (
            <button 
              className={styles.chatToggleButton}
              onClick={() => setChatVisible(true)}
            >
            </button>
          )}
        </div>
      </div>
    );
  }

  // Gallery Mode: No screen share active
  return (
    <div className={styles.watchPartyContainer}>
      <div className={styles.galleryMode}>
        {/* Content area: main content + chat */}
        <div className={styles.contentArea}>
          <div className={styles.mainContent}>
            {/* Waiting state message */}
            {participantCount <= 1 && (
              <div className={styles.waitingState}>
                {/* <div className={styles.waitingIcon}>🎬</div> */}
                <div className={styles.waitingText}>
                  Ready to start the WatchParty!
                </div>
                    <div className={styles.waitingHint}>
                  Click &quot;Share Screen&quot; to start sharing content with everyone
                </div>
              </div>
            )}

            {/* Participant count and connection quality */}
            <div className={styles.participantCount}>
              {participantCount} in room
              <span style={{ marginLeft: '12px' }}>
                <ConnectionQuality showLabel={false} />
              </span>
            </div>

            {/* Grid layout for participants */}
            {cameraTracks.length > 0 && (
              <GridLayout tracks={participantTracks}>
                <ParticipantTile />
              </GridLayout>
            )}

            {cameraTracks.length === 0 && participantCount === 1 && (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ maxWidth: '400px', maxHeight: '300px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  <p>Camera is off</p>
                  <p style={{ fontSize: '14px' }}>Enable your camera or wait for others to join</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          {chatVisible && (
            <div className={styles.chatPanel}>
              <div className={styles.chatHeader}>
                <span>Chat</span>
                <button 
                  className={styles.chatCloseButton}
                  onClick={() => setChatVisible(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.chatMessages}>
                {chatMessages.length === 0 ? (
                  <div className={styles.chatEmpty}>
                    No messages yet. Say hi! 👋
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <ChatEntry
                      key={msg.timestamp}
                      entry={msg}
                      messageFormatter={formatChatMessageLinks}
                    />
                  ))
                )}
              </div>
              <div className={styles.chatInputContainer}>
                <input
                  type="text"
                  className={styles.chatInput}
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                />
                <button
                  className={styles.chatSendButton}
                  onClick={handleSendMessage}
                  disabled={isSending || !chatInput.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Control bar */}
        <ControlBar
          controls={{
            camera: true,
            microphone: true,
            screenShare: true,
            chat: false,
            leave: true,
          }}
        />
        
        {/* Custom chat toggle button */}
        {!chatVisible && (
          <button 
            className={styles.chatToggleButton}
            onClick={() => setChatVisible(true)}
          >
            💬
          </button>
        )}
      </div>
    </div>
  );
}
