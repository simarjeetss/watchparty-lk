'use client';

import React from 'react';
import { useConnectionState, useLocalParticipant } from '@livekit/components-react';
import { ConnectionState, ConnectionQuality as LKConnectionQuality } from 'livekit-client';
import styles from '../styles/WatchParty.module.css';

export interface ConnectionQualityProps {
  /** Show text label alongside the indicator */
  showLabel?: boolean;
}

/**
 * Connection Quality Indicator for WatchParty
 * 
 * Displays the current connection quality to help users understand
 * if any issues they experience are network-related.
 */
export function ConnectionQuality({ showLabel = true }: ConnectionQualityProps) {
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();

  // Get connection quality from local participant
  const quality = localParticipant?.connectionQuality ?? LKConnectionQuality.Unknown;

  const getQualityInfo = () => {
    switch (quality) {
      case LKConnectionQuality.Excellent:
        return { label: 'Excellent', color: '#22c55e', bars: 4 };
      case LKConnectionQuality.Good:
        return { label: 'Good', color: '#22c55e', bars: 3 };
      case LKConnectionQuality.Poor:
        return { label: 'Poor', color: '#eab308', bars: 2 };
      case LKConnectionQuality.Lost:
        return { label: 'Disconnected', color: '#ef4444', bars: 0 };
      default:
        return { label: 'Connecting...', color: '#6b7280', bars: 1 };
    }
  };

  const getConnectionStateLabel = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return null; // Don't show when connected
      case ConnectionState.Connecting:
        return 'Connecting...';
      case ConnectionState.Reconnecting:
        return 'Reconnecting...';
      case ConnectionState.Disconnected:
        return 'Disconnected';
      default:
        return null;
    }
  };

  const qualityInfo = getQualityInfo();
  const connectionLabel = getConnectionStateLabel();

  // Show connection state issues prominently
  if (connectionLabel) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          fontSize: '12px',
        }}
      >
        <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
        <span>{connectionLabel}</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        fontSize: '12px',
      }}
    >
      {/* Signal bars */}
      <div className={styles.connectionQuality}>
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`${styles.qualityBar} ${bar <= qualityInfo.bars ? 'active' : ''}`}
            style={{
              height: `${bar * 4}px`,
              backgroundColor: bar <= qualityInfo.bars ? qualityInfo.color : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
      
      {/* Label */}
      {showLabel && (
        <span style={{ color: qualityInfo.color }}>{qualityInfo.label}</span>
      )}
    </div>
  );
}

/**
 * Compact connection quality indicator (just bars, no label)
 */
export function ConnectionQualityBars() {
  return <ConnectionQuality showLabel={false} />;
}
