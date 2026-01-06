'use client';

import { useMemo } from 'react';
import {
  useParticipants,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import { Track, TrackPublication, Participant } from 'livekit-client';

export interface ScreenShareState {
  /** Whether any participant is currently sharing their screen */
  isScreenShareActive: boolean;
  /** The participant who is sharing their screen (if any) */
  screenShareParticipant: Participant | null;
  /** The screen share track publication */
  screenShareTrack: TrackPublication | null;
  /** Whether the screen share includes audio */
  hasScreenShareAudio: boolean;
  /** Whether the local user is the one sharing */
  isLocalScreenShare: boolean;
  /** Number of participants in the room */
  participantCount: number;
}

/**
 * Hook to detect and manage screen share state in a WatchParty room.
 * This is useful for implementing cinema mode where the screen share
 * takes priority over participant videos.
 */
export function useScreenShare(): ScreenShareState {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  
  // Get all screen share tracks
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const screenShareAudioTracks = useTracks([Track.Source.ScreenShareAudio]);

  const screenShareState = useMemo(() => {
    const activeScreenShare = screenShareTracks.find(
      (track) => track.publication?.isSubscribed || track.participant.isLocal
    );

    if (!activeScreenShare) {
      return {
        isScreenShareActive: false,
        screenShareParticipant: null,
        screenShareTrack: null,
        hasScreenShareAudio: false,
        isLocalScreenShare: false,
        participantCount: participants.length,
      };
    }

    const screenShareParticipant = activeScreenShare.participant;
    const isLocalScreenShare = screenShareParticipant.identity === localParticipant.identity;

    // Check if there's accompanying audio
    const hasScreenShareAudio = screenShareAudioTracks.some(
      (track) => track.participant.identity === screenShareParticipant.identity
    );

    return {
      isScreenShareActive: true,
      screenShareParticipant,
      screenShareTrack: activeScreenShare.publication,
      hasScreenShareAudio,
      isLocalScreenShare,
      participantCount: participants.length,
    };
  }, [screenShareTracks, screenShareAudioTracks, participants, localParticipant]);

  return screenShareState;
}

/**
 * Hook that returns only the screen share track for rendering.
 * Useful for the main video area in cinema mode.
 */
export function useScreenShareTrack() {
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  
  return screenShareTracks.length > 0 ? screenShareTracks[0] : null;
}
