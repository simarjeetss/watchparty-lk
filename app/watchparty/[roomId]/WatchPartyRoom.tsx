'use client';

import React from 'react';
import { decodePassphrase } from '@/lib/client-utils';
import { DebugMode } from '@/lib/Debug';
import { KeyboardShortcuts } from '@/lib/KeyboardShortcuts';
import { RecordingIndicator } from '@/lib/RecordingIndicator';
import { SettingsMenu } from '@/lib/SettingsMenu';
import { ConnectionDetails } from '@/lib/types';
import { WatchPartyLayout } from '@/lib/WatchPartyLayout';
import {
  formatChatMessageLinks,
  LocalUserChoices,
  PreJoin,
  RoomContext,
} from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  Room,
  DeviceUnsupportedError,
  RoomConnectOptions,
  RoomEvent,
  TrackPublishDefaults,
  VideoCaptureOptions,
  ScreenSharePresets,
} from 'livekit-client';
import { useRouter } from 'next/navigation';
import { useSetupE2EE } from '@/lib/useSetupE2EE';
import { useLowCPUOptimizer } from '@/lib/usePerfomanceOptimiser';

const CONN_DETAILS_ENDPOINT =
  process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details';
const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU == 'true';

export function WatchPartyRoom(props: {
  roomId: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const router = useRouter();
  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
    undefined,
  );
  // WatchParty: Default to video enabled but camera can be optional
  const preJoinDefaults = React.useMemo(() => {
    return {
      username: '',
      videoEnabled: true,
      audioEnabled: true,
    };
  }, []);
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | undefined>(
    undefined,
  );

  const handlePreJoinSubmit = React.useCallback(async (values: LocalUserChoices) => {
    setPreJoinChoices(values);
    const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
    url.searchParams.append('roomName', props.roomId);
    url.searchParams.append('participantName', values.username);
    if (props.region) {
      url.searchParams.append('region', props.region);
    }
    const connectionDetailsResp = await fetch(url.toString());
    const connectionDetailsData = await connectionDetailsResp.json();
    setConnectionDetails(connectionDetailsData);
  }, [props.roomId, props.region]);
  
  const handlePreJoinError = React.useCallback((e: any) => console.error(e), []);

  return (
    <main data-lk-theme="default" style={{ height: '100%', background: 'var(--bg, #0a0a0a)' }}>
      {connectionDetails === undefined || preJoinChoices === undefined ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100%',
          padding: 'clamp(4rem, 8vw, 6rem) clamp(1rem, 5vw, 2rem) clamp(2rem, 4vw, 4rem)',
          position: 'relative',
          gap: '2.5rem',
          overflowY: 'auto',
        }}>
          {/* Room label */}
          <span style={{
            position: 'absolute',
            top: '2rem',
            left: '5vw',
            fontFamily: 'var(--font-mono, "DM Mono", monospace)',
            fontSize: '0.65rem',
            color: 'var(--fg-3, #525050)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Room / {props.roomId}
          </span>

          {/* Heading */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-serif, "Instrument Serif", serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: 'var(--fg, #f0ede8)',
              margin: 0,
            }}>
              Join<span style={{ color: 'var(--accent, #e05c4a)' }}>.</span>
            </h1>
            <p style={{
              fontFamily: 'var(--font-mono, "DM Mono", monospace)',
              fontSize: '0.68rem',
              color: 'var(--fg-3, #525050)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: 0,
            }}>
              Set up your devices, then enter the room
            </p>
          </div>

          {/* PreJoin — themed wrapper */}
          <div className="wp-prejoin-wrapper" style={{
            width: '100%',
            maxWidth: 460,
            animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.12s both',
          }}>
            <PreJoin
              defaults={preJoinDefaults}
              onSubmit={handlePreJoinSubmit}
              onError={handlePreJoinError}
            />
          </div>

          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-mono, "DM Mono", monospace)',
              fontSize: '0.65rem',
              color: 'var(--fg-3, #525050)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.25rem 0',
              transition: 'color 0.2s',
              animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-2, #8a8585)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3, #525050)')}
          >
            ← Go back
          </button>
        </div>
      ) : (
        <WatchPartyConference
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
          options={{ codec: props.codec, hq: props.hq }}
        />
      )}
    </main>
  );
}

function WatchPartyConference(props: {
  userChoices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
  options: {
    hq: boolean;
    codec: VideoCodec;
  };
}) {
  const keyProvider = new ExternalE2EEKeyProvider();
  const { worker, e2eePassphrase } = useSetupE2EE();
  const e2eeEnabled = !!(e2eePassphrase && worker);

  const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);

  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    const videoCaptureDefaults: VideoCaptureOptions = {
      deviceId: props.userChoices.videoDeviceId ?? undefined,
      resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
    };

    const publishDefaults: TrackPublishDefaults = {
      dtx: false,
      videoSimulcastLayers: props.options.hq
        ? [VideoPresets.h1080, VideoPresets.h720]
        : [VideoPresets.h540, VideoPresets.h216],
      red: !e2eeEnabled,
      videoCodec,
      // WatchParty: High-quality screen share encoding for video watching
      screenShareEncoding: {
        maxBitrate: 8_000_000, // 8 Mbps for high-quality video content
        maxFramerate: 30,
        priority: 'high',
      },
      screenShareSimulcastLayers: [
        ScreenSharePresets.h1080fps30,
        ScreenSharePresets.h720fps30,
      ],
    };
    return {
      videoCaptureDefaults: videoCaptureDefaults,
      publishDefaults: publishDefaults,
      audioCaptureDefaults: {
        deviceId: props.userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: true,
      dynacast: true,
      e2ee: keyProvider && worker && e2eeEnabled ? { keyProvider, worker } : undefined,
      singlePeerConnection: true,
    };
  }, [props.userChoices, props.options.hq, props.options.codec, e2eeEnabled, keyProvider, worker]);

  const room = React.useMemo(() => new Room(roomOptions), []);

  React.useEffect(() => {
    if (e2eeEnabled) {
      keyProvider
        .setKey(decodePassphrase(e2eePassphrase))
        .then(() => {
          room.setE2EEEnabled(true).catch((e) => {
            if (e instanceof DeviceUnsupportedError) {
              alert(
                `You're trying to join an encrypted meeting, but your browser does not support it. Please update it to the latest version and try again.`,
              );
              console.error(e);
            } else {
              throw e;
            }
          });
        })
        .then(() => setE2eeSetupComplete(true));
    } else {
      setE2eeSetupComplete(true);
    }
  }, [e2eeEnabled, room, e2eePassphrase, keyProvider]);

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  React.useEffect(() => {
    room.on(RoomEvent.Disconnected, handleOnLeave);
    room.on(RoomEvent.EncryptionError, handleEncryptionError);
    room.on(RoomEvent.MediaDevicesError, handleError);

    if (e2eeSetupComplete) {
      room
        .connect(
          props.connectionDetails.serverUrl,
          props.connectionDetails.participantToken,
          connectOptions,
        )
        .catch((error) => {
          handleError(error);
        });
      if (props.userChoices.videoEnabled) {
        room.localParticipant.setCameraEnabled(true).catch((error) => {
          handleError(error);
        });
      }
      if (props.userChoices.audioEnabled) {
        room.localParticipant.setMicrophoneEnabled(true).catch((error) => {
          handleError(error);
        });
      }
    }
    return () => {
      room.off(RoomEvent.Disconnected, handleOnLeave);
      room.off(RoomEvent.EncryptionError, handleEncryptionError);
      room.off(RoomEvent.MediaDevicesError, handleError);
    };
  }, [e2eeSetupComplete, room, props.connectionDetails, props.userChoices, connectOptions]);

  const lowPowerMode = useLowCPUOptimizer(room);

  const router = useRouter();
  const handleOnLeave = React.useCallback(() => router.push('/'), [router]);
  const handleError = React.useCallback((error: Error) => {
    console.error(error);
    alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
  }, []);
  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error(error);
    alert(
      `Encountered an unexpected encryption error, check the console logs for details: ${error.message}`,
    );
  }, []);

  React.useEffect(() => {
    if (lowPowerMode) {
      console.warn('Low power mode enabled');
    }
  }, [lowPowerMode]);

  return (
    <div className="lk-room-container">
      <RoomContext.Provider value={room}>
        <KeyboardShortcuts />
        {/* WatchParty uses the cinema-style layout */}
        <WatchPartyLayout />
        {/* <DebugMode /> */}
        <RecordingIndicator />
      </RoomContext.Provider>
    </div>
  );
}
