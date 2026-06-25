'use client';

// ──────────────────────────────────────────────────────────────────────────────
// The ANTS — useFlashcardSRS Hook
// Owner: ZLH
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import type { FlashCard, SRSRating, StudySessionState } from '@/types';
import { computeNextReview, getNewCardDefaults } from '@/lib/srs/algorithm';
import { getDueCards, getUserCardReview, upsertCardReview } from '@/lib/mock/database';

export interface UseFlashcardSRSReturn {
  /** Cards due for this session */
  dueCards: FlashCard[];
  /** Index of the currently displayed card */
  currentIndex: number;
  /** Whether the card is currently flipped to the back */
  isFlipped: boolean;
  /** Whether all due cards have been reviewed */
  sessionComplete: boolean;
  /** Tally of ratings given during this session */
  ratings: Record<SRSRating, number>;
  /** Total cards in this session */
  totalCards: number;
  /** Cards reviewed so far */
  reviewedCount: number;
  /** The current card object, or null if session is complete */
  currentCard: FlashCard | null;

  /** Flip the current card to reveal the answer */
  flip: () => void;
  /** Rate the current card and advance to the next */
  rate: (rating: SRSRating) => void;
  /** Restart the session from scratch (useful for re-review) */
  restartSession: () => void;
  /** Load due cards for a deck (call on mount or deck change) */
  loadDeck: (deckId: string, userId: string) => void;
}

export function useFlashcardSRS(): UseFlashcardSRSReturn {
  const [state, setState] = useState<StudySessionState>({
    deckId: '',
    dueCards: [],
    currentIndex: 0,
    isFlipped: false,
    sessionComplete: false,
    ratings: { again: 0, hard: 0, good: 0, easy: 0 },
  });

  const [userId, setUserId] = useState<string>('');

  const loadDeck = useCallback((deckId: string, uid: string) => {
    setUserId(uid);
    const dueCards = getDueCards(deckId, uid);
    setState({
      deckId,
      dueCards,
      currentIndex: 0,
      isFlipped: false,
      sessionComplete: dueCards.length === 0,
      ratings: { again: 0, hard: 0, good: 0, easy: 0 },
    });
  }, []);

  const flip = useCallback(() => {
    setState(prev => ({ ...prev, isFlipped: true }));
  }, []);

  const rate = useCallback((rating: SRSRating) => {
    setState(prev => {
      if (!prev.isFlipped) return prev; // must flip before rating
      const card = prev.dueCards[prev.currentIndex];
      if (!card) return prev;

      // Get current SRS state for this card
      const existingReview = getUserCardReview(card.id, userId);
      const defaults = getNewCardDefaults();
      const currentInterval = existingReview?.interval_days ?? defaults.interval_days;
      const currentEaseFactor = existingReview?.ease_factor ?? defaults.ease_factor;

      // Compute next SRS values
      const { newInterval, newEaseFactor, nextReviewDate } = computeNextReview(
        rating,
        currentInterval,
        currentEaseFactor
      );

      // Persist to mock DB
      upsertCardReview(card.id, userId, {
        interval_days: newInterval,
        ease_factor: newEaseFactor,
        next_review_date: nextReviewDate.toISOString(),
        last_rating: rating,
      });

      const newRatings = { ...prev.ratings, [rating]: prev.ratings[rating] + 1 };
      const nextIndex = prev.currentIndex + 1;
      const sessionComplete = nextIndex >= prev.dueCards.length;

      return {
        ...prev,
        currentIndex: nextIndex,
        isFlipped: false,
        sessionComplete,
        ratings: newRatings,
      };
    });
  }, [userId]);

  const restartSession = useCallback(() => {
    if (!state.deckId || !userId) return;
    loadDeck(state.deckId, userId);
  }, [state.deckId, userId, loadDeck]);

  const currentCard = state.sessionComplete ? null : (state.dueCards[state.currentIndex] ?? null);

  return {
    dueCards: state.dueCards,
    currentIndex: state.currentIndex,
    isFlipped: state.isFlipped,
    sessionComplete: state.sessionComplete,
    ratings: state.ratings,
    totalCards: state.dueCards.length,
    reviewedCount: state.currentIndex,
    currentCard,
    flip,
    rate,
    restartSession,
    loadDeck,
  };
}
