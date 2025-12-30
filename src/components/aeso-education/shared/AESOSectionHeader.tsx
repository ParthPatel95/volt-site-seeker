import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AESOSectionHeaderProps {
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  description: string;
  theme?: 'light' | 'dark';
  align?: 'left' | 'center';
}

export function AESOSectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  theme = 'light',
  align = 'center',
}: AESOSectionHeaderProps) {
  const isDark = theme === 'dark';
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-6 mb-12 md:mb-16 ${alignment}`}>
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
          isDark
            ? 'bg-[hsl(var(--watt-bitcoin)/0.15)] border-[hsl(var(--watt-bitcoin)/0.3)]'
            : 'bg-[hsl(var(--watt-bitcoin)/0.1)] border-[hsl(var(--watt-bitcoin)/0.2)]'
        }`}
      >
        <BadgeIcon className="w-4 h-4 text-[hsl(var(--watt-bitcoin))]" />
        <span className="text-sm font-semibold text-[hsl(var(--watt-bitcoin))]">
          {badge}
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight ${
          isDark ? 'text-white' : 'text-foreground'
        }`}
      >
        {title}
      </motion.h2>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`text-lg md:text-xl max-w-3xl leading-relaxed ${
          isDark ? 'text-white/70' : 'text-muted-foreground'
        }`}
      >
        {description}
      </motion.p>
    </div>
  );
}
