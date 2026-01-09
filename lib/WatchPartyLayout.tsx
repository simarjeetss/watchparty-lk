'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ReceivedChatMessage,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useScreenShare } from './useScreenShare';
import { ConnectionQuality } from './ConnectionQuality';
import styles from '../styles/WatchParty.module.css';
import { format } from 'date-fns';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

const USER_COLORS = [
  '#f87171', // red-400
  '#fb923c', // orange-400
  '#fbbf24', // amber-400
  '#a3e635', // lime-400
  '#34d399', // emerald-400
  '#22d3ee', // cyan-400
  '#818cf8', // indigo-400
  '#e879f9', // fuchsia-400
  '#fb7185', // rose-400
];

function getUserColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

interface ChatMessagePayload {
  text: string;
  replyTo?: {
    id: string;
    sender: string;
    text: string;
  };
}

/**
 * Custom Chat Entry Component
 */
function CustomChatEntry({ 
  entry, 
  onReply 
}: { 
  entry: ReceivedChatMessage; 
  onReply: (entry: ReceivedChatMessage) => void; 
}) {
  const isLocal = !entry.from; 

  let content: ChatMessagePayload = { text: entry.message };
  try {
    const parsed = JSON.parse(entry.message);
    if (parsed && typeof parsed === 'object' && 'text' in parsed) {
      content = parsed;
    }
  } catch (e) {
    // legacy/plain text message
  }

  const displayName = entry.from?.name || entry.from?.identity || 'Me';
  const authorColor = isLocal ? undefined : getUserColor(displayName);

  return (
    <div className={`${styles.chatEntry} ${isLocal ? styles.local : ''}`}>
      <div className={styles.chatHeaderRow}>
        <span 
          className={styles.chatAuthor}
          style={authorColor ? { color: authorColor } : undefined}
        >
          {displayName}
        </span>
        <span className={styles.chatTimestamp}>
          {format(new Date(entry.timestamp), 'h:mm a')}
        </span>
        <button 
          className={styles.chatReplyButton}
          onClick={() => onReply(entry)}
          title="Reply to message"
        >
          ↩ Reply
        </button>
      </div>
      
      <div className={`${styles.chatBubble} ${!entry.from ? styles.local : ''}`}>
        {content.replyTo && (
          <div className={styles.chatReplyContext}>
            <div 
              className={styles.chatReplyAuthor}
              style={{ color: getUserColor(content.replyTo.sender) }}
            >
              Replying to {content.replyTo.sender}
            </div>
            <div className={styles.chatReplyText}>{content.replyTo.text}</div>
          </div>
        )}
        <div style={{ whiteSpace: 'pre-wrap' }}>{content.text}</div>
      </div>
    </div>
  );
}

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Chat functionality using useChat hook
  const { chatMessages, send, isSending } = useChat();
  const [chatInput, setChatInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReceivedChatMessage | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [chatMessages, chatVisible]);

  // Auto-focus input when chat becomes visible
  useEffect(() => {
    if (chatVisible && chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 50);
    }
  }, [chatVisible]);

  // Focus input when replying
  useEffect(() => {
    if (replyingTo && chatInputRef.current) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 50);
    }
  }, [replyingTo]);

  const handleSendMessage = async () => {
    if (chatInput.trim() && !isSending) {
      // Construct the message payload
      const payload: ChatMessagePayload = {
        text: chatInput.trim(),
      };

      if (replyingTo) {
        // Parse original message in case it was a complex object
        let originalText = replyingTo.message;
        try {
          const parsed = JSON.parse(replyingTo.message);
          if (parsed && typeof parsed === 'object' && 'text' in parsed) {
            originalText = parsed.text;
          }
        } catch {
          // ignore
        }

        payload.replyTo = {
          id: replyingTo.id,
          sender: replyingTo.from?.name || replyingTo.from?.identity || 'Unknown',
          text: originalText,
        };
      }

      await send(JSON.stringify(payload));
      setChatInput('');
      setReplyingTo(null);
      
      // Keep focus on input after sending
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      setShowEmojiPicker(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const input = chatInputRef.current;
    if (input) {
      const start = input.selectionStart ?? chatInput.length;
      const end = input.selectionEnd ?? chatInput.length;
      const text = chatInput;
      const emoji = emojiData.emoji;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      
      setChatInput(newText);
      
      // Update cursor position after render
      setTimeout(() => {
        input.focus();
        const newCursorPos = start + emoji.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      setChatInput((prev) => prev + emojiData.emoji);
    }
  };

  // Close emoji picker on Escape key
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEmojiPicker) {
        setShowEmojiPicker(false);
        chatInputRef.current?.focus();
      }
    };

    if (showEmojiPicker) {
      window.addEventListener('keydown', handleGlobalKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showEmojiPicker]);

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
                <div className={styles.chatMessages} ref={chatMessagesRef}>
                  {chatMessages.length === 0 ? (
                    <div className={styles.chatEmpty}>
                      No messages yet. Say hi! 👋
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <CustomChatEntry
                        key={msg.timestamp}
                        entry={msg}
                        onReply={setReplyingTo}
                      />
                    ))
                  )}
                </div>
                {/* Reply Preview Area */}
                {replyingTo && (
                  <div className={styles.replyPreview}>
                    <div className={styles.replyPreviewContent}>
                      <div className={styles.replyPreviewHeader}>
                        Replying to {replyingTo.from?.name || replyingTo.from?.identity || 'Unknown'}
                      </div>
                      <div className={styles.replyPreviewText}>
                        {(() => {
                           try {
                             const parsed = JSON.parse(replyingTo.message);
                             return parsed.text || replyingTo.message;
                           } catch {
                             return replyingTo.message;
                           }
                        })()}
                      </div>
                    </div>
                    <button 
                      className={styles.replyPreviewClose}
                      onClick={() => setReplyingTo(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className={styles.chatInputContainer}>
                  {showEmojiPicker && (
                    <div className={styles.emojiPickerContainer}>
                      <div className={styles.emojiHelpText}>
                        Press Esc to close
                      </div>
                      <EmojiPicker 
                        onEmojiClick={onEmojiClick} 
                        theme={Theme.DARK} 
                        width={300} 
                        height={400}
                      />
                    </div>
                  )}
                  <button 
                    className={styles.emojiButton}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    title="Add emoji"
                  >
                    😀
                  </button>
                  <input
                    ref={chatInputRef}
                    type="text"
                    className={styles.chatInput}
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    autoFocus
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
              <div className={styles.chatMessages} ref={chatMessagesRef}>
                {chatMessages.length === 0 ? (
                  <div className={styles.chatEmpty}>
                    No messages yet. Say hi! 👋
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <CustomChatEntry
                      key={msg.timestamp}
                      entry={msg}
                      onReply={setReplyingTo}
                    />
                  ))
                )}
              </div>
              {/* Reply Preview Area */}
              {replyingTo && (
                <div className={styles.replyPreview}>
                  <div className={styles.replyPreviewContent}>
                    <div className={styles.replyPreviewHeader}>
                      Replying to {replyingTo.from?.name || replyingTo.from?.identity || 'Unknown'}
                    </div>
                    <div className={styles.replyPreviewText}>
                      {(() => {
                          try {
                            const parsed = JSON.parse(replyingTo.message);
                            return parsed.text || replyingTo.message;
                          } catch {
                            return replyingTo.message;
                          }
                      })()}
                    </div>
                  </div>
                  <button 
                    className={styles.replyPreviewClose}
                    onClick={() => setReplyingTo(null)}
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className={styles.chatInputContainer}>
                {showEmojiPicker && (
                  <div className={styles.emojiPickerContainer}>
                    <div className={styles.emojiHelpText}>
                      Press Esc to close
                    </div>
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick} 
                      theme={Theme.DARK} 
                      width={300} 
                      height={400}
                    />
                  </div>
                )}
                <button 
                  className={styles.emojiButton}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add emoji"
                >
                  😀
                </button>
                <input
                  ref={chatInputRef}
                  type="text"
                  className={styles.chatInput}
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  autoFocus
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