import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InventorySpreadsheet } from '../InventorySpreadsheet';
import type { InventoryItem } from '../../types/inventory.types';

const mockItems: InventoryItem[] = [
  {
    id: '1',
    workspace_id: 'w1',
    name: 'Test Item A',
    sku: 'SKU-A',
    quantity: 10,
    unit: 'pcs',
    unit_cost: 5.0,
    min_stock_level: 2,
    condition: 'new',
    status: 'in_stock',
    location: 'Warehouse A',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    workspace_id: 'w1',
    name: 'Test Item B',
    sku: 'SKU-B',
    quantity: 3,
    unit: 'pcs',
    unit_cost: 12.5,
    min_stock_level: 5,
    condition: 'good',
    status: 'low_stock',
    location: 'Warehouse B',
    created_at: '2024-01-02',
    updated_at: '2024-01-02',
  },
  {
    id: '3',
    workspace_id: 'w1',
    name: 'Test Item C',
    quantity: 0,
    unit: 'kg',
    unit_cost: 100,
    min_stock_level: 1,
    condition: 'fair',
    status: 'out_of_stock',
    created_at: '2024-01-03',
    updated_at: '2024-01-03',
  },
];

const defaultProps = {
  items: mockItems,
  onItemClick: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('InventorySpreadsheet', () => {
  it('renders all items', () => {
    render(<InventorySpreadsheet {...defaultProps} />);
    expect(screen.getByText('Test Item A')).toBeInTheDocument();
    expect(screen.getByText('Test Item B')).toBeInTheDocument();
    expect(screen.getByText('Test Item C')).toBeInTheDocument();
  });

  it('renders checkboxes for each row plus header', () => {
    render(<InventorySpreadsheet {...defaultProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(4); // 1 header + 3 rows
  });

  it('selects all items when header checkbox is clicked', () => {
    const onBulkDelete = vi.fn();
    render(<InventorySpreadsheet {...defaultProps} onBulkDelete={onBulkDelete} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('selects individual items when row checkbox is clicked', () => {
    const onBulkDelete = vi.fn();
    render(<InventorySpreadsheet {...defaultProps} onBulkDelete={onBulkDelete} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('calls onBulkDelete with selected ids', () => {
    const onBulkDelete = vi.fn();
    render(<InventorySpreadsheet {...defaultProps} onBulkDelete={onBulkDelete} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);
    expect(onBulkDelete).toHaveBeenCalledWith(expect.arrayContaining(['1', '2']));
  });

  it('calls onBulkExport with selected items', () => {
    const onBulkExport = vi.fn();
    render(<InventorySpreadsheet {...defaultProps} onBulkExport={onBulkExport} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    const exportBtn = screen.getByText('Export');
    fireEvent.click(exportBtn);
    expect(onBulkExport).toHaveBeenCalledWith([mockItems[0]]);
  });

  it('clears selection when X button is clicked', () => {
    const onBulkDelete = vi.fn();
    render(<InventorySpreadsheet {...defaultProps} onBulkDelete={onBulkDelete} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    const clearBtn = screen.getByTitle('Clear selection');
    fireEvent.click(clearBtn);
    expect(screen.queryByText('3 selected')).not.toBeInTheDocument();
  });

  it('displays correct status badges', () => {
    render(<InventorySpreadsheet {...defaultProps} />);
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows footer totals', () => {
    render(<InventorySpreadsheet {...defaultProps} />);
    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('shows analyze button only when onAnalyze provided and item has image', () => {
    const itemWithImage = { ...mockItems[0], primary_image_url: 'https://example.com/img.jpg' };
    const onAnalyze = vi.fn();
    render(
      <InventorySpreadsheet
        {...defaultProps}
        items={[itemWithImage, mockItems[1]]}
        onAnalyze={onAnalyze}
      />
    );
    const analyzeButtons = screen.getAllByTitle('AI Analyze');
    expect(analyzeButtons).toHaveLength(1);
  });
});
