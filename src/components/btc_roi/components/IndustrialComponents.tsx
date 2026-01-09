import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Industrial Card Component
interface IndustrialCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: 'positive' | 'negative' | 'warning' | 'primary' | 'bitcoin';
  noPadding?: boolean;
}

export const IndustrialCard: React.FC<IndustrialCardProps> = ({ 
  children, 
  className, 
  accent,
  noPadding 
}) => {
  const accentColors = {
    positive: 'border-l-data-positive',
    negative: 'border-l-destructive',
    warning: 'border-l-data-warning',
    primary: 'border-l-primary',
    bitcoin: 'border-l-watt-bitcoin',
  };

  return (
    <div className={cn(
      "bg-card border-2 border-border rounded-md overflow-hidden",
      accent && `border-l-4 ${accentColors[accent]}`,
      !noPadding && "p-3 sm:p-4",
      className
    )}>
      {children}
    </div>
  );
};

// Industrial Card Header
interface IndustrialCardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const IndustrialCardHeader: React.FC<IndustrialCardHeaderProps> = ({ 
  icon, 
  title, 
  badge,
  action,
  className 
}) => (
  <div className={cn(
    "flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border",
    className
  )}>
    <div className="flex items-center gap-2 min-w-0 flex-1">
      {icon && <span className="flex-shrink-0 text-primary">{icon}</span>}
      <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{title}</h3>
      {badge}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// Data Row Component
interface DataRowProps {
  label: string;
  value: string | React.ReactNode;
  highlight?: 'positive' | 'negative' | 'neutral';
  mono?: boolean;
  size?: 'sm' | 'md';
}

export const DataRow: React.FC<DataRowProps> = ({ 
  label, 
  value, 
  highlight,
  mono = true,
  size = 'md'
}) => (
  <div className="flex justify-between items-center py-1.5 sm:py-2 border-b border-border/50 last:border-0 gap-2">
    <span className={cn(
      "text-muted-foreground truncate",
      size === 'sm' ? "text-xs" : "text-xs sm:text-sm"
    )}>
      {label}
    </span>
    <span className={cn(
      "font-medium flex-shrink-0",
      size === 'sm' ? "text-xs" : "text-sm sm:text-base",
      mono && "font-mono",
      highlight === 'positive' && "text-data-positive",
      highlight === 'negative' && "text-destructive",
      !highlight && "text-foreground"
    )}>
      {value}
    </span>
  </div>
);

// Industrial Input Component
interface IndustrialInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
}

export const IndustrialInput: React.FC<IndustrialInputProps> = ({ 
  label, 
  unit,
  className,
  ...props 
}) => (
  <div className="space-y-1.5">
    <Label className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide font-medium">
      {label}
    </Label>
    <div className="relative">
      <Input
        {...props}
        className={cn(
          "font-mono h-9 sm:h-10 bg-background border-2 border-border",
          "focus:border-primary transition-colors",
          "text-sm text-foreground",
          unit && "pr-10",
          className
        )}
      />
      {unit && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
          {unit}
        </span>
      )}
    </div>
  </div>
);

// Industrial Stat Card
interface IndustrialStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: 'primary' | 'bitcoin' | 'trust' | 'warning' | 'success' | 'muted';
  trend?: 'up' | 'down' | 'stable';
}

export const IndustrialStatCard: React.FC<IndustrialStatCardProps> = ({ 
  icon, 
  label, 
  value, 
  color = 'muted'
}) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    bitcoin: 'bg-watt-bitcoin/10 text-watt-bitcoin',
    trust: 'bg-watt-trust/10 text-watt-trust',
    warning: 'bg-data-warning/10 text-data-warning',
    success: 'bg-data-positive/10 text-data-positive',
    muted: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="bg-card border-2 border-border rounded-md p-2 sm:p-3 min-w-0">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
        <div className={cn(
          "p-1 sm:p-1.5 rounded flex-shrink-0",
          colorClasses[color]
        )}>
          {icon}
        </div>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide truncate">
          {label}
        </span>
      </div>
      <div className="font-mono text-xs sm:text-sm lg:text-base font-bold text-foreground truncate">
        {value}
      </div>
    </div>
  );
};

// Industrial Result Card
interface IndustrialResultCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const IndustrialResultCard: React.FC<IndustrialResultCardProps> = ({ 
  label, 
  value, 
  subValue,
  trend,
  highlight,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl lg:text-2xl',
    lg: 'text-xl sm:text-2xl lg:text-3xl',
  };

  return (
    <div className={cn(
      "rounded-md border-2 p-2.5 sm:p-3 lg:p-4 transition-all min-w-0",
      trend === 'positive' && "border-l-4 border-l-data-positive border-t-border border-r-border border-b-border",
      trend === 'negative' && "border-l-4 border-l-destructive border-t-border border-r-border border-b-border",
      !trend && "border-border",
      highlight && "bg-primary/5 border-primary/30"
    )}>
      <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5 sm:mb-1 truncate">
        {label}
      </div>
      <div className={cn(
        "font-mono font-bold truncate",
        sizeClasses[size],
        trend === 'positive' && "text-data-positive",
        trend === 'negative' && "text-destructive",
        !trend && "text-foreground"
      )}>
        {value}
      </div>
      {subValue && (
        <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-mono truncate">
          {subValue}
        </div>
      )}
    </div>
  );
};

// Mode Selector Button
interface ModeSelectorButtonProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}

export const ModeSelectorButton: React.FC<ModeSelectorButtonProps> = ({
  icon,
  label,
  description,
  active,
  onClick
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-md border-2 transition-all w-full",
      "active:scale-[0.98] touch-target",
      active 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-card text-foreground border-border hover:border-muted-foreground hover:bg-muted/50"
    )}
  >
    <span className={cn(
      "p-1.5 sm:p-2 rounded-md flex-shrink-0",
      active ? "bg-primary-foreground/20" : "bg-muted"
    )}>
      {icon}
    </span>
    <div className="text-left min-w-0 flex-1">
      <div className="font-semibold text-xs sm:text-sm truncate">{label}</div>
      {description && (
        <div className={cn(
          "text-[10px] sm:text-xs truncate",
          active ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {description}
        </div>
      )}
    </div>
  </button>
);

// Section Divider
interface SectionDividerProps {
  label?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ label }) => (
  <div className="flex items-center gap-2 py-2">
    <div className="flex-1 h-px bg-border" />
    {label && (
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest px-2">
        {label}
      </span>
    )}
    <div className="flex-1 h-px bg-border" />
  </div>
);
