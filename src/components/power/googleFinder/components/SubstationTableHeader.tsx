
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
          <TableHead className="w-12"></TableHead>
        )}
        <TableHead>Name</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Owner</TableHead>
        <TableHead>Capacity (MVA)</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
