import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Flashcard, FlashcardDeck } from '@/constants/flashcard-data';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickFlashcardProps {
  deck: FlashcardDeck;
  className?: string;
}

export const QuickFlashcard: React.FC<QuickFlashcardProps> = ({ deck, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());

  const currentCard = deck.cards[currentIndex];
  const isMastered = masteredCards.has(currentCard.id);

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + deck.cards.length) % deck.cards.length);
    }, 150);
  };

  const toggleMastered = () => {
    setMasteredCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentCard.id)) {
        newSet.delete(currentCard.id);
      } else {
        newSet.add(currentCard.id);
      }
      return newSet;
    });
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    // Fisher-Yates shuffle visual effect
    setCurrentIndex(Math.floor(Math.random() * deck.cards.length));
  };

  return (
    <div className={cn('bg-muted/30 rounded-xl p-6 border border-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{deck.title}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{masteredCards.size}/{deck.cards.length} mastered</span>
          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Shuffle cards"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-4">
        {deck.cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => {
              setIsFlipped(false);
              setCurrentIndex(index);
            }}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex
                ? 'w-4 bg-primary'
                : masteredCards.has(card.id)
                ? 'bg-green-500'
                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
            )}
          />
        ))}
      </div>

      {/* Card */}
      <div className="relative perspective-1000 mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${isFlipped}`}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleFlip}
            className={cn(
              'min-h-[200px] p-6 rounded-xl cursor-pointer transition-shadow',
              'flex flex-col justify-center items-center text-center',
              isFlipped
                ? 'bg-primary/10 border-2 border-primary/30'
                : 'bg-background border-2 border-border hover:border-primary/50',
              isMastered && 'ring-2 ring-green-500/30'
            )}
          >
            {!isFlipped ? (
              <>
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  {currentCard.category}
                </span>
                <h4 className="text-2xl font-bold text-foreground mb-2">{currentCard.term}</h4>
                <span className="text-sm text-muted-foreground">Click to reveal</span>
              </>
            ) : (
              <>
                <p className="text-foreground mb-3">{currentCard.definition}</p>
                {currentCard.example && (
                  <p className="text-sm text-muted-foreground italic">
                    Example: {currentCard.example}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={toggleMastered}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            isMastered
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20'
              : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
          )}
        >
          {isMastered ? '✓ Mastered' : 'Mark as Mastered'}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Card counter */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        Card {currentIndex + 1} of {deck.cards.length}
      </p>
    </div>
  );
};
