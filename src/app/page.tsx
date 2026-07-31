'use client';

import { Suspense } from 'react';
import { Chat } from '@/components/Chat';
import { ChatSkeleton } from '@/components/ChatSkeleton';

export default function Home() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <Chat />
    </Suspense>
  );
}
