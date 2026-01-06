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
  useMaybeLayoutContext,
  Chat,
  formatChatMessageLinks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useScreenShare } from './useScreenShare';
import { ConnectionQuality } from './ConnectionQuality';
import styles from '../styles/WatchParty.module.css';

export interface WatchPartyLayoutProps {
  /** Show chat panel */
  showChat?: boolean;
}

/**
 * WatchParty Layout Component
 * 
 * This component provides a cinema-style layout optimized for watch parties:
 * - When screen share is active: Screen share takes up most of the viewport
 *   with participant videos as small floating thumbnails
 * - When no screen share: Standard grid layout for participants
 */
export function WatchPartyLayout({ showChat = true }: WatchPartyLayoutProps) {
  // Create layout context for ControlBar
  const layoutContext = useCreateLayoutContext();

  return (
    <LayoutContextProvider value={layoutContext}>
      <WatchPartyLayoutInner showChat={showChat} />
    </LayoutContextProvider>
  );
}

function WatchPartyLayoutInner({ showChat = true }: WatchPartyLayoutProps) {
  const {
    isScreenShareActive,
    screenShareParticipant,
    hasScreenShareAudio,
    participantCount,
  } = useScreenShare();

  const [thumbnailsCollapsed, setThumbnailsCollapsed] = useState(false);
  
  // Use layout context to get chat visibility (controlled by ControlBar's chat button)
  const layoutContext = useMaybeLayoutContext();
  const isChatOpen = showChat && (layoutContext?.widget?.state?.showChat ?? false);

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
              <div className={styles.screenShareIndicator}>
                {screenShareParticipant?.name || screenShareParticipant?.identity} is sharing
              </div>

              {/* Audio indicator */}
              {hasScreenShareAudio && (
                <div className={styles.audioIndicator}>
                  🔊 Audio shared
                </div>
              )}

              {/* Participant count and connection quality */}
              <div className={styles.participantCount}>
                👥 {participantCount} watching
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
              <button
                className={styles.toggleThumbnails}
                onClick={() => setThumbnailsCollapsed(!thumbnailsCollapsed)}
              >
                {thumbnailsCollapsed ? '👥 Show participants' : '👁️ Hide participants'}
              </button>

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

            {/* Chat panel - visibility controlled by ControlBar's chat button */}
            {isChatOpen && (
              <div className={styles.chatPanel}>
                <div className={styles.chatHeader}>
                  <span>💬 Chat</span>
                </div>
                <div className={styles.chatBody}>
                  <Chat messageFormatter={formatChatMessageLinks} />
                </div>
              </div>
            )}
          </div>

          {/* Control bar - chat button controls chat visibility via LayoutContext */}
          <ControlBar
            controls={{
              camera: true,
              microphone: true,
              screenShare: true,
              chat: showChat,
              leave: true,
            }}
          />
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
                <div className={styles.waitingIcon}>🎬</div>
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
              👥 {participantCount} in room
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

          {/* Chat panel - visibility controlled by ControlBar's chat button */}
          {isChatOpen && (
            <div className={styles.chatPanel}>
              <div className={styles.chatHeader}>
                <span>💬 Chat</span>
              </div>
              <div className={styles.chatBody}>
                <Chat messageFormatter={formatChatMessageLinks} />
              </div>
            </div>
          )}
        </div>

        {/* Control bar - chat button controls chat visibility via LayoutContext */}
        <ControlBar
          controls={{
            camera: true,
            microphone: true,
            screenShare: true,
            chat: showChat,
            leave: true,
          }}
        />
      </div>
    </div>
  );
}
