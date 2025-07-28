
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SubstationTableHeaderProps {
  showCheckboxes: boolean;
}

export function SubstationTableHeader({ showCheckboxes }: SubstationTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        {showCheckboxes && (
          <TableHead className="w-12 min-w-[48px] sticky left-0 bg-background z-10"></TableHead>
        )}
        <TableHead className={`min-w-[150px] ${showCheckboxes ? 'sticky left-12' : 'sticky left-0'} bg-background z-10`}>Name</TableHead>
        <TableHead className="min-w-[200px]">Location</TableHead>
        <TableHead className="min-w-[120px]">Owner</TableHead>
        <TableHead className="min-w-[120px]">Capacity (MVA)</TableHead>
        <TableHead className="min-w-[100px]">Status</TableHead>
        <TableHead className="min-w-[140px] text-center sticky right-0 bg-background z-10">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
