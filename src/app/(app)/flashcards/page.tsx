'use client';

// ──────────────────────────────────────────────────────────────────────────────
// The ANTS — Flashcards Library Shell Page
// Owner: ZLH
// ──────────────────────────────────────────────────────────────────────────────

import { useAuth } from '@/hooks/useAuth';
import DeckLibrary from '@/components/flashcards/DeckLibrary';

export default function FlashcardsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return <DeckLibrary userId={user.profile.id} />;
}
