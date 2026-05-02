'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import * as Me from '@/entities/me/model/me.model';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { initAnalytics, track } from '@/shared/lib/analytics';
import { authTypeOf, identifyAuthenticatedUser } from '@/shared/lib/analytics/auth-tracking';
import type { AuthorityTierLabel } from '@/shared/lib/analytics/events';

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const sessionFiredRef = useRef(false);
  const lastIdentifiedUidRef = useRef<string | null>(null);

  // 1) Init Amplitude + fire `Session Started` once per page load.
  //    Non-triggering peek at the /me cache: if a previous visit warmed
  //    the cache, attach auth_type/authority_tier; otherwise fire unparametrized
  //    and rely on subsequent identify() to attach user properties.
  useEffect(() => {
    initAnalytics();
    if (sessionFiredRef.current) return;
    sessionFiredRef.current = true;

    const cached = queryClient.getQueryData<Me.Model>([QueryKeys.Me]);
    if (cached) {
      track('Session Started', {
        auth_type: authTypeOf(cached.authorityTier),
        authority_tier: cached.authorityTier as AuthorityTierLabel,
      });
    } else {
      track('Session Started');
    }
  }, [queryClient]);

  // 2) Identify the user whenever the /me cache populates with a new uid.
  //    Subscribing to QueryCache events does NOT trigger a fetch — we observe
  //    only what other parts of the app (sign-in flows, page-level useFetchMe)
  //    have already loaded.
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] !== QueryKeys.Me) return;
      const me = event.query.state.data as Me.Model | undefined;
      if (!me?.uid) return;
      if (lastIdentifiedUidRef.current === me.uid) return;
      lastIdentifiedUidRef.current = me.uid;
      identifyAuthenticatedUser({ uid: me.uid, authorityTier: me.authorityTier });
    });

    // Apply identity for cache that was already warm at mount.
    const cached = queryClient.getQueryData<Me.Model>([QueryKeys.Me]);
    if (cached?.uid && lastIdentifiedUidRef.current !== cached.uid) {
      lastIdentifiedUidRef.current = cached.uid;
      identifyAuthenticatedUser({ uid: cached.uid, authorityTier: cached.authorityTier });
    }

    return unsubscribe;
  }, [queryClient]);

  return <>{children}</>;
}
