import * as React from 'react';
import { WatchPartyRoom } from './WatchPartyRoom';
import { isVideoCodec } from '@/lib/types';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{
    region?: string;
    hq?: string;
    codec?: string;
  }>;
}) {
  const _params = await params;
  const _searchParams = await searchParams;
  const codec =
    typeof _searchParams.codec === 'string' && isVideoCodec(_searchParams.codec)
      ? _searchParams.codec
      : 'vp9';
  // WatchParty defaults to high quality for better video watching experience
  const hq = _searchParams.hq === 'false' ? false : true;

  return (
    <WatchPartyRoom
      roomId={_params.roomId}
      region={_searchParams.region}
      hq={hq}
      codec={codec}
    />
  );
}
