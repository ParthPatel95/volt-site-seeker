import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

interface LastReviewedProps {
  /** The date when content was last reviewed (e.g., "December 2024") */
  date: string;
  /** Who reviewed the content */
  reviewer?: string;
  /** Additional CSS classes */
  className?: string;
  /** Display variant */
  variant?: 'badge' | 'inline' | 'footer';
}

const LastReviewed: React.FC<LastReviewedProps> = ({
  date,
  reviewer = 'WattByte Team',
  className = '',
  variant = 'badge',
}) => {
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
        <CheckCircle className="w-3 h-3 text-watt-success" />
        <span>Last reviewed: {date}</span>
      </span>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground border-t border-border mt-8 ${className}`}>
        <Calendar className="w-3.5 h-3.5" />
        <span>Content last reviewed {date} by {reviewer}</span>
      </div>
    );
  }

  // Default badge variant
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border rounded-full text-xs ${className}`}
    >
      <CheckCircle className="w-3 h-3 text-watt-success" />
      <span className="text-muted-foreground">
        Last reviewed: <span className="text-foreground font-medium">{date}</span>
      </span>
    </div>
  );
};

export default LastReviewed;
