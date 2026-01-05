import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, HardHat } from 'lucide-react';
import { VoltBuildProject, PROJECT_STATUS_CONFIG } from './types/voltbuild.types';

interface VoltBuildHeaderProps {
  projects: VoltBuildProject[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string) => void;
  onNewProject: () => void;
  selectedProject: VoltBuildProject | null;
}

export function VoltBuildHeader({
  projects,
  selectedProjectId,
  onProjectSelect,
  onNewProject,
  selectedProject,
}: VoltBuildHeaderProps) {
  const statusConfig = selectedProject
    ? PROJECT_STATUS_CONFIG[selectedProject.status]
    : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <HardHat className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Build Management</h1>
          <p className="text-sm text-muted-foreground">
            Track construction & build-out projects
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Select
            value={selectedProjectId || ''}
            onValueChange={onProjectSelect}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
              {projects.length === 0 && (
                <div className="px-2 py-4 text-sm text-center text-muted-foreground">
                  No projects yet
                </div>
              )}
            </SelectContent>
          </Select>

          {selectedProject && statusConfig && (
            <Badge variant={statusConfig.variant} className="whitespace-nowrap">
              {statusConfig.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button size="sm" onClick={onNewProject}>
            <Plus className="w-4 h-4 mr-1" />
            New Project
          </Button>
        </div>
      </div>
    </div>
  );
}
