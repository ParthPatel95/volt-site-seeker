import { format, parseISO, differenceInDays } from 'date-fns';
import { GanttTask, GanttPhase } from '../types/gantt.types';
import { generateTaskWbsCode, generatePhaseWbsCode } from './wbsCalculations';

// CSV Export
export interface CSVExportOptions {
  includePhases?: boolean;
  includeNotes?: boolean;
  dateFormat?: string;
  projectStartDate?: Date | null;
}

export function exportToCSV(
  phases: GanttPhase[],
  tasks: GanttTask[],
  options: CSVExportOptions = {}
): string {
  const {
    includePhases = true,
    includeNotes = true,
    dateFormat = 'yyyy-MM-dd',
    projectStartDate = null,
  } = options;

  // CSV header
  const headers = [
    'WBS',
    'Task Name',
    'Type',
    'Status',
    'Start Date',
    'End Date',
    'Duration (Days)',
    'Start Day',
    'End Day',
    'Progress (%)',
    'Critical Path',
    'Assigned Role',
  ];

  if (includeNotes) {
    headers.push('Notes');
  }

  const rows: string[][] = [headers];

  phases.forEach((phase, phaseIndex) => {
    const phaseTasks = tasks.filter(t => t.phase_id === phase.id);
    
    // Calculate phase rollup
    const tasksWithDates = phaseTasks.filter(t => t.estimated_start_date && t.estimated_end_date);
    let phaseStart: Date | null = null;
    let phaseEnd: Date | null = null;
    
    if (tasksWithDates.length > 0) {
      const startDates = tasksWithDates.map(t => parseISO(t.estimated_start_date!));
      const endDates = tasksWithDates.map(t => parseISO(t.estimated_end_date!));
      phaseStart = new Date(Math.min(...startDates.map(d => d.getTime())));
      phaseEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
    }

    const phaseProgress = phaseTasks.length > 0 
      ? Math.round(phaseTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / phaseTasks.length)
      : 0;

    const phaseDuration = phaseStart && phaseEnd 
      ? differenceInDays(phaseEnd, phaseStart) + 1 
      : '';

    const phaseStartDay = phaseStart && projectStartDate 
      ? differenceInDays(phaseStart, projectStartDate) + 1 
      : '';

    const phaseEndDay = phaseEnd && projectStartDate 
      ? differenceInDays(phaseEnd, projectStartDate) + 1 
      : '';

    // Add phase row if enabled
    if (includePhases) {
      const phaseRow = [
        generatePhaseWbsCode(phaseIndex),
        phase.name,
        'Phase',
        phase.status || '',
        phaseStart ? format(phaseStart, dateFormat) : '',
        phaseEnd ? format(phaseEnd, dateFormat) : '',
        String(phaseDuration),
        String(phaseStartDay),
        String(phaseEndDay),
        String(phaseProgress),
        '',
        '',
      ];

      if (includeNotes) {
        phaseRow.push('');
      }

      rows.push(phaseRow);
    }

    // Add task rows
    phaseTasks.forEach((task, taskIndex) => {
      const duration = task.estimated_start_date && task.estimated_end_date
        ? differenceInDays(parseISO(task.estimated_end_date), parseISO(task.estimated_start_date)) + 1
        : '';

      const startDay = task.estimated_start_date && projectStartDate
        ? differenceInDays(parseISO(task.estimated_start_date), projectStartDate) + 1
        : '';

      const endDay = task.estimated_end_date && projectStartDate
        ? differenceInDays(parseISO(task.estimated_end_date), projectStartDate) + 1
        : '';

      const taskRow = [
        generateTaskWbsCode(phaseIndex, taskIndex),
        task.name,
        'Task',
        task.status.replace('_', ' '),
        task.estimated_start_date ? format(parseISO(task.estimated_start_date), dateFormat) : '',
        task.estimated_end_date ? format(parseISO(task.estimated_end_date), dateFormat) : '',
        String(duration),
        String(startDay),
        String(endDay),
        String(task.progress || 0),
        task.is_critical_path ? 'Yes' : 'No',
        task.assigned_role || '',
      ];

      if (includeNotes) {
        taskRow.push(task.description || '');
      }

      rows.push(taskRow);
    });
  });

  // Convert to CSV string with proper escaping
  return rows.map(row => 
    row.map(cell => {
      const cellStr = String(cell);
      // Escape cells that contain commas, quotes, or newlines
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  ).join('\n');
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// PNG Export using html2canvas
export async function exportToPNG(
  element: HTMLElement,
  filename: string
): Promise<void> {
  try {
    // Dynamically import html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Failed to export PNG:', error);
    throw new Error('Failed to export PNG image');
  }
}

// PDF Export using jsPDF + html2canvas (secure replacement for html2pdf.js)
export async function exportToPDF(
  element: HTMLElement,
  filename: string,
  options: {
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'a4' | 'letter' | 'legal';
  } = {}
): Promise<void> {
  try {
    const { exportToPDF: securePDFExport } = await import('@/utils/pdfExport');
    
    const { orientation = 'landscape', pageSize = 'a4' } = options;
    
    await securePDFExport(element, {
      filename,
      margin: 10,
      orientation,
      format: pageSize,
      imageQuality: 0.98,
      scale: 2,
      useCORS: true,
    });
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw new Error('Failed to export PDF document');
  }
}

// Parse imported CSV/Excel data
export interface ParsedTaskData {
  wbs?: string;
  name: string;
  type?: 'phase' | 'task';
  status?: string;
  startDate?: string;
  endDate?: string;
  duration?: number;
  progress?: number;
  isCriticalPath?: boolean;
  assignedRole?: string;
  notes?: string;
}

export function parseCSVContent(csvContent: string): ParsedTaskData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header to find column indices
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  
  const getColumnIndex = (possibleNames: string[]): number => {
    return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
  };

  const wbsIdx = getColumnIndex(['wbs', 'id', 'code']);
  const nameIdx = getColumnIndex(['name', 'task', 'title', 'activity']);
  const typeIdx = getColumnIndex(['type']);
  const statusIdx = getColumnIndex(['status', 'state']);
  const startIdx = getColumnIndex(['start', 'begin']);
  const endIdx = getColumnIndex(['end', 'finish', 'complete']);
  const durationIdx = getColumnIndex(['duration', 'days', 'length']);
  const progressIdx = getColumnIndex(['progress', 'percent', '%']);
  const criticalIdx = getColumnIndex(['critical', 'crit']);
  const roleIdx = getColumnIndex(['role', 'assigned', 'resource', 'owner']);
  const notesIdx = getColumnIndex(['notes', 'description', 'comment', 'remarks']);

  const results: ParsedTaskData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || !values.some(v => v.trim())) continue;

    const name = nameIdx >= 0 ? values[nameIdx]?.trim() : '';
    if (!name) continue;

    const parsed: ParsedTaskData = {
      wbs: wbsIdx >= 0 ? values[wbsIdx]?.trim() : undefined,
      name,
      type: typeIdx >= 0 && values[typeIdx]?.toLowerCase().includes('phase') ? 'phase' : 'task',
      status: statusIdx >= 0 ? values[statusIdx]?.trim().toLowerCase().replace(' ', '_') : undefined,
      startDate: startIdx >= 0 ? parseFlexibleDate(values[startIdx]) : undefined,
      endDate: endIdx >= 0 ? parseFlexibleDate(values[endIdx]) : undefined,
      duration: durationIdx >= 0 ? parseInt(values[durationIdx]) || undefined : undefined,
      progress: progressIdx >= 0 ? parseInt(values[progressIdx]) || 0 : 0,
      isCriticalPath: criticalIdx >= 0 ? values[criticalIdx]?.toLowerCase() === 'yes' : false,
      assignedRole: roleIdx >= 0 ? values[roleIdx]?.trim() : undefined,
      notes: notesIdx >= 0 ? values[notesIdx]?.trim() : undefined,
    };

    results.push(parsed);
  }

  return results;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

// Parse flexible date formats
function parseFlexibleDate(dateStr: string | undefined): string | undefined {
  if (!dateStr || !dateStr.trim()) return undefined;
  
  const cleaned = dateStr.trim();
  
  // Try ISO format first
  if (/^\d{4}-\d{2}-\d{2}/.test(cleaned)) {
    return cleaned.substring(0, 10);
  }
  
  // Try MM/DD/YYYY
  const mdyMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Try parsing with Date
  try {
    const date = new Date(cleaned);
    if (!isNaN(date.getTime())) {
      return format(date, 'yyyy-MM-dd');
    }
  } catch {
    // Ignore parsing errors
  }
  
  return undefined;
}

// Generate CSV template for import
export function generateImportTemplate(): string {
  const headers = [
    'WBS',
    'Task Name',
    'Type',
    'Status',
    'Start Date',
    'End Date',
    'Duration (Days)',
    'Progress (%)',
    'Critical Path',
    'Assigned Role',
    'Notes',
  ];

  const exampleRows = [
    ['1', 'Site Preparation', 'Phase', 'in_progress', '2025-03-01', '2025-04-15', '46', '25', 'No', '', 'Phase for site prep work'],
    ['1.1', 'Site Survey', 'Task', 'complete', '2025-03-01', '2025-03-07', '7', '100', 'No', 'Surveyor', 'Initial survey completed'],
    ['1.2', 'Permitting', 'Task', 'in_progress', '2025-03-08', '2025-03-31', '24', '50', 'Yes', 'Project Manager', 'Permits in review'],
    ['2', 'Foundation', 'Phase', 'not_started', '2025-04-01', '2025-05-15', '45', '0', 'No', '', ''],
    ['2.1', 'Excavation', 'Task', 'not_started', '2025-04-01', '2025-04-10', '10', '0', 'Yes', 'Contractor', ''],
  ];

  return [headers, ...exampleRows].map(row => row.join(',')).join('\n');
}
