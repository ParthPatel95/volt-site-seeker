
interface SubstationEmptyStateProps {
  hasFilters: boolean;
  totalCount: number;
}

export function SubstationEmptyState({ hasFilters, totalCount }: SubstationEmptyStateProps) {
  if (hasFilters && totalCount > 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No substations match your current filters. Try adjusting your search criteria.
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No substations found in the database.
      </div>
    );
  }

  return null;
}
