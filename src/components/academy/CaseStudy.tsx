import { MapPin, Calendar, Zap, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface CaseStudyMetric {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface CaseStudyProps {
  title: string;
  location?: string;
  date?: string;
  capacity?: string;
  metrics?: CaseStudyMetric[];
  whatWorked: string[];
  lessonsLearned: string[];
  proTip?: string;
  sourceUrl?: string;
  sourceName?: string;
}

export default function CaseStudy({
  title,
  location,
  date,
  capacity,
  metrics = [],
  whatWorked,
  lessonsLearned,
  proTip,
  sourceUrl,
  sourceName
}: CaseStudyProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header with gradient */}
      <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          {location && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location}
            </span>
          )}
          {date && (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {date}
            </span>
          )}
          {capacity && (
            <span className="flex items-center gap-1.5 text-sm text-primary font-medium">
              <Zap className="w-4 h-4" />
              {capacity}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
      </div>

      {/* Metrics Row */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 border-b border-border">
          {metrics.map((metric, i) => (
            <div key={i} className="text-center">
              {metric.icon && <div className="mb-1">{metric.icon}</div>}
              <div className="text-lg font-bold text-foreground">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* What Worked */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              What Worked
            </h4>
            <ul className="space-y-2">
              {whatWorked.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lessons Learned */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Lessons Learned
            </h4>
            <ul className="space-y-2">
              {lessonsLearned.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pro Tip */}
        {proTip && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <span className="text-sm font-medium text-foreground">Key Takeaway: </span>
                <span className="text-sm text-muted-foreground">{proTip}</span>
              </div>
            </div>
          </div>
        )}

        {/* Source */}
        {sourceUrl && (
          <div className="mt-4 pt-4 border-t border-border">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Source: {sourceName || 'View Details'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
