
interface SectionDividerProps {
  /** Kept for backwards compatibility; ignored in the institutional variant. */
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'cyan';
}

/**
 * Neutral hairline divider — institutional, not playful.
 * Uses the design system `--border` token so it adapts to theme.
 */
export const SectionDivider = (_props: SectionDividerProps) => {
  return (
    <div className="relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-border/60" />
      </div>
    </div>
  );
};
