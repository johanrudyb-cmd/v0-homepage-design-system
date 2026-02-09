'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function TrendViewRecorder({ trendId }: { trendId: string }) {
  const router = useRouter();
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current || !trendId) return;
    recorded.current = true;

    fetch('/api/trends/record-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trendId }),
    })
      .then((r) => {
        if (r.status === 403) {
          router.replace('/trends?limit=reached');
        }
      })
      .catch(() => {});
  }, [trendId, router]);

  return null;
}
