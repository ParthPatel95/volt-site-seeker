import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface ExportControlsProps {
  data: any;
  dateRange?: DateRange;
}

export function ExportControls({ data, dateRange }: ExportControlsProps) {
  const { toast } = useToast();

  const exportToCSV = () => {
    if (!data?.recentActivity?.length) {
      toast({
        title: "No data to export",
        description: "There's no activity data available for export.",
        variant: "destructive"
      });
      return;
    }

    // Create CSV header
    const headers = [
      'Date',
      'Viewer Email',
      'Document',
      'Pages Viewed',
      'Total Time (min)',
      'Engagement Score',
      'Device',
      'Location'
    ];

    // Create CSV rows
    const rows = data.recentActivity.map((activity: any) => [
      format(new Date(activity.opened_at), 'yyyy-MM-dd HH:mm'),
      activity.viewer_email || 'Anonymous',
      activity.document?.file_name || 'N/A',
      activity.pages_viewed?.length || 0,
      Math.round((activity.total_time_seconds || 0) / 60),
      activity.engagement_score || 0,
      activity.device_type || 'N/A',
      activity.location || 'N/A'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secure-share-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Analytics data has been exported to CSV.",
    });
  };

  const exportToPDF = () => {
    toast({
      title: "PDF Export",
      description: "PDF report generation will be available soon.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Generate PDF Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
