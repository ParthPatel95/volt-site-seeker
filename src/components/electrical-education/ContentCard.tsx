import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, AlertTriangle, Info, Zap, Lightbulb } from 'lucide-react';

type ContentType = 'concept' | 'mining' | 'safety' | 'tip';

interface ContentCardProps {
  type: ContentType;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

const typeStyles: Record<ContentType, {
  borderColor: string;
  accentBg: string;
  iconBg: string;
  icon: LucideIcon;
  label: string;
}> = {
  concept: {
    borderColor: 'border-l-watt-coinbase',
    accentBg: 'bg-watt-coinbase/5',
    iconBg: 'bg-watt-coinbase/10 text-watt-coinbase',
    icon: Info,
    label: 'Core Concept',
  },
  mining: {
    borderColor: 'border-l-watt-success',
    accentBg: 'bg-watt-success/5',
    iconBg: 'bg-watt-success/10 text-watt-success',
    icon: Zap,
    label: 'Mining Application',
  },
  safety: {
    borderColor: 'border-l-destructive',
    accentBg: 'bg-destructive/5',
    iconBg: 'bg-destructive/10 text-destructive',
    icon: AlertTriangle,
    label: 'Safety Critical',
  },
  tip: {
    borderColor: 'border-l-watt-trust',
    accentBg: 'bg-watt-trust/5',
    iconBg: 'bg-watt-trust/10 text-watt-trust',
    icon: Lightbulb,
    label: 'Pro Tip',
  },
};

export const ContentCard: React.FC<ContentCardProps> = ({
  type,
  title,
  icon,
  children,
  className = '',
}) => {
  const styles = typeStyles[type];
  const Icon = icon || styles.icon;

  return (
    <Card className={`border-l-4 ${styles.borderColor} ${styles.accentBg} ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${styles.iconBg}`}>
            {styles.label}
          </span>
        </div>
        <CardTitle className="flex items-center gap-2 text-foreground text-lg">
          <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
    </Card>
  );
};

export default ContentCard;
