interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  action?: { label: string; onClick?: () => void };
}

/** Consistent section header used across the homepage/listing pages. */
export default function SectionHeading({ eyebrow, title, action }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between mb-3 sm:mb-6 animate-fade-up">
      <div>
        {eyebrow && (
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gold">{eyebrow}</span>
        )}
        <h2 className="font-display text-lg sm:text-2xl md:text-3xl text-forest-700 mt-0.5 sm:mt-1">{title}</h2>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs sm:text-sm font-semibold text-forest-700 hover:text-pista-700 flex items-center gap-1 shrink-0"
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}
