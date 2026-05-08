import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ENERGY_TYPE_COLORS, type PipelineProject } from '@/data/advisory-pipeline';

interface Props {
  project: PipelineProject;
  onClose: () => void;
}

export const PipelineProjectCard: React.FC<Props> = ({ project, onClose }) => {
  return (
    <Card className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 p-4 bg-background/95 backdrop-blur border-border shadow-xl animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{project.flagEmoji}</span> {project.country}
          </div>
          <h4 className="font-bold text-foreground leading-tight">{project.location}</h4>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant="secondary" className="font-mono">{project.capacityMw} MW</Badge>
        <Badge
          style={{ backgroundColor: ENERGY_TYPE_COLORS[project.energyType].hex, color: '#fff' }}
          className="border-0"
        >
          {project.energyType}
        </Badge>
        <Badge variant="outline" className="text-[10px]">{project.status}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{project.description}</p>
    </Card>
  );
};