import { Destination, Subscription } from '@/shared/api/websocket/client';

export const isPartyroomSubscription = ({ destination }: Subscription) =>
  destination.startsWith('/sub/partyrooms/');

export const getPartyroomDestination = (partyroomId: string | number): Destination =>
  `/sub/partyrooms/${partyroomId}`;
