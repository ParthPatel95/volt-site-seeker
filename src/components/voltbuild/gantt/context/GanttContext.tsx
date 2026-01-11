import React, { createContext, useContext, useReducer, useMemo, useCallback, ReactNode } from 'react';
import { 
  GanttTask, 
  GanttPhase, 
  GanttDependency, 
  GanttMilestone,
  GanttConfig, 
  GanttViewport, 
  GanttSelection,
  ZoomLevel,
  DEFAULT_GANTT_CONFIG,
  ZOOM_CONFIGS,
  ZoomConfig,
} from '../types/gantt.types';

// State interface
interface GanttState {
  tasks: GanttTask[];
  phases: GanttPhase[];
  dependencies: GanttDependency[];
  milestones: GanttMilestone[];
  config: GanttConfig;
  zoomLevel: ZoomLevel;
  viewport: GanttViewport;
  selection: GanttSelection;
  expandedPhases: Set<string>;
  editingTaskId: string | null;
  contextMenuPosition: { x: number; y: number; taskId: string } | null;
  isDragging: boolean;
  dragPreview: { taskId: string; left: number; width: number } | null;
}

// Action types
type GanttAction =
  | { type: 'SET_TASKS'; payload: GanttTask[] }
  | { type: 'SET_PHASES'; payload: GanttPhase[] }
  | { type: 'SET_DEPENDENCIES'; payload: GanttDependency[] }
  | { type: 'SET_MILESTONES'; payload: GanttMilestone[] }
  | { type: 'SET_ZOOM_LEVEL'; payload: ZoomLevel }
  | { type: 'SET_VIEWPORT'; payload: Partial<GanttViewport> }
  | { type: 'SELECT_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'HOVER_TASK'; payload: string | null }
  | { type: 'FOCUS_TASK'; payload: string | null }
  | { type: 'START_LINKING'; payload: string }
  | { type: 'CANCEL_LINKING' }
  | { type: 'TOGGLE_PHASE'; payload: string }
  | { type: 'EXPAND_ALL_PHASES' }
  | { type: 'COLLAPSE_ALL_PHASES' }
  | { type: 'SET_EDITING_TASK'; payload: string | null }
  | { type: 'SET_CONTEXT_MENU'; payload: { x: number; y: number; taskId: string } | null }
  | { type: 'UPDATE_CONFIG'; payload: Partial<GanttConfig> }
  | { type: 'SET_DRAGGING'; payload: boolean }
  | { type: 'SET_DRAG_PREVIEW'; payload: { taskId: string; left: number; width: number } | null }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<GanttTask> } };

// Initial state factory
const createInitialState = (phases: GanttPhase[]): GanttState => ({
  tasks: [],
  phases: [],
  dependencies: [],
  milestones: [],
  config: DEFAULT_GANTT_CONFIG,
  zoomLevel: 'week',
  viewport: {
    startDate: new Date(),
    endDate: new Date(),
    scrollLeft: 0,
    scrollTop: 0,
  },
  selection: {
    selectedTaskIds: new Set(),
    hoveredTaskId: null,
    focusedTaskId: null,
    linkingFromId: null,
  },
  expandedPhases: new Set(phases.map(p => p.id)),
  editingTaskId: null,
  contextMenuPosition: null,
  isDragging: false,
  dragPreview: null,
});

// Reducer
function ganttReducer(state: GanttState, action: GanttAction): GanttState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'SET_PHASES':
      return { 
        ...state, 
        phases: action.payload,
        expandedPhases: new Set([...state.expandedPhases, ...action.payload.map(p => p.id)])
      };
    
    case 'SET_DEPENDENCIES':
      return { ...state, dependencies: action.payload };
    
    case 'SET_MILESTONES':
      return { ...state, milestones: action.payload };
    
    case 'SET_ZOOM_LEVEL':
      return { ...state, zoomLevel: action.payload };
    
    case 'SET_VIEWPORT':
      return { ...state, viewport: { ...state.viewport, ...action.payload } };
    
    case 'SELECT_TASK': {
      const newSelection = new Set<string>([action.payload]);
      return { 
        ...state, 
        selection: { ...state.selection, selectedTaskIds: newSelection, focusedTaskId: action.payload } 
      };
    }
    
    case 'TOGGLE_TASK_SELECTION': {
      const newSelection = new Set(state.selection.selectedTaskIds);
      if (newSelection.has(action.payload)) {
        newSelection.delete(action.payload);
      } else {
        newSelection.add(action.payload);
      }
      return { ...state, selection: { ...state.selection, selectedTaskIds: newSelection } };
    }
    
    case 'CLEAR_SELECTION':
      return { 
        ...state, 
        selection: { ...state.selection, selectedTaskIds: new Set(), focusedTaskId: null } 
      };
    
    case 'HOVER_TASK':
      return { ...state, selection: { ...state.selection, hoveredTaskId: action.payload } };
    
    case 'FOCUS_TASK':
      return { ...state, selection: { ...state.selection, focusedTaskId: action.payload } };
    
    case 'START_LINKING':
      return { ...state, selection: { ...state.selection, linkingFromId: action.payload } };
    
    case 'CANCEL_LINKING':
      return { ...state, selection: { ...state.selection, linkingFromId: null } };
    
    case 'TOGGLE_PHASE': {
      const newExpanded = new Set(state.expandedPhases);
      if (newExpanded.has(action.payload)) {
        newExpanded.delete(action.payload);
      } else {
        newExpanded.add(action.payload);
      }
      return { ...state, expandedPhases: newExpanded };
    }
    
    case 'EXPAND_ALL_PHASES':
      return { ...state, expandedPhases: new Set(state.phases.map(p => p.id)) };
    
    case 'COLLAPSE_ALL_PHASES':
      return { ...state, expandedPhases: new Set() };
    
    case 'SET_EDITING_TASK':
      return { ...state, editingTaskId: action.payload };
    
    case 'SET_CONTEXT_MENU':
      return { ...state, contextMenuPosition: action.payload };
    
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    
    case 'SET_DRAG_PREVIEW':
      return { ...state, dragPreview: action.payload };
    
    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map(t => 
        t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
      );
      return { ...state, tasks: updatedTasks };
    }
    
    default:
      return state;
  }
}

// Context type
interface GanttContextType {
  state: GanttState;
  dispatch: React.Dispatch<GanttAction>;
  // Computed values
  zoomConfig: ZoomConfig;
  visibleTasks: GanttTask[];
  taskPositions: Map<string, { rowIndex: number; phaseId: string }>;
  criticalPathTasks: Set<string>;
  // Actions
  selectTask: (taskId: string) => void;
  toggleTaskSelection: (taskId: string) => void;
  clearSelection: () => void;
  hoverTask: (taskId: string | null) => void;
  setZoomLevel: (level: ZoomLevel) => void;
  togglePhase: (phaseId: string) => void;
  startLinking: (taskId: string) => void;
  cancelLinking: () => void;
  openContextMenu: (x: number, y: number, taskId: string) => void;
  closeContextMenu: () => void;
  updateConfig: (config: Partial<GanttConfig>) => void;
}

const GanttContext = createContext<GanttContextType | null>(null);

// Provider props
interface GanttProviderProps {
  children: ReactNode;
  tasks: GanttTask[];
  phases: GanttPhase[];
  dependencies?: GanttDependency[];
  milestones?: GanttMilestone[];
  initialConfig?: Partial<GanttConfig>;
}

export function GanttProvider({
  children,
  tasks,
  phases,
  dependencies = [],
  milestones = [],
  initialConfig,
}: GanttProviderProps) {
  const [state, dispatch] = useReducer(
    ganttReducer, 
    phases,
    createInitialState
  );

  // Sync external data with state
  React.useEffect(() => {
    dispatch({ type: 'SET_TASKS', payload: tasks });
  }, [tasks]);

  React.useEffect(() => {
    dispatch({ type: 'SET_PHASES', payload: phases });
  }, [phases]);

  React.useEffect(() => {
    dispatch({ type: 'SET_DEPENDENCIES', payload: dependencies });
  }, [dependencies]);

  React.useEffect(() => {
    dispatch({ type: 'SET_MILESTONES', payload: milestones });
  }, [milestones]);

  React.useEffect(() => {
    if (initialConfig) {
      dispatch({ type: 'UPDATE_CONFIG', payload: initialConfig });
    }
  }, [initialConfig]);

  // Computed values
  const zoomConfig = useMemo(() => ZOOM_CONFIGS[state.zoomLevel], [state.zoomLevel]);

  const visibleTasks = useMemo(() => {
    return state.tasks.filter(task => {
      const phase = state.phases.find(p => p.id === task.phase_id);
      return phase && state.expandedPhases.has(phase.id);
    });
  }, [state.tasks, state.phases, state.expandedPhases]);

  const taskPositions = useMemo(() => {
    const positions = new Map<string, { rowIndex: number; phaseId: string }>();
    let rowIndex = 0;

    state.phases.forEach(phase => {
      rowIndex++; // Phase row
      if (state.expandedPhases.has(phase.id)) {
        const phaseTasks = state.tasks.filter(t => t.phase_id === phase.id);
        phaseTasks.forEach(task => {
          positions.set(task.id, { rowIndex, phaseId: phase.id });
          rowIndex++;
        });
      }
    });

    return positions;
  }, [state.phases, state.tasks, state.expandedPhases]);

  // Calculate critical path (simplified - tasks marked as critical + their dependents)
  const criticalPathTasks = useMemo(() => {
    const critical = new Set<string>();
    
    // Add tasks explicitly marked as critical
    state.tasks.forEach(task => {
      if (task.is_critical_path) {
        critical.add(task.id);
      }
    });

    // Add dependencies on critical path
    state.dependencies.forEach(dep => {
      if (critical.has(dep.predecessor_task_id)) {
        critical.add(dep.successor_task_id);
      }
    });

    return critical;
  }, [state.tasks, state.dependencies]);

  // Actions
  const selectTask = useCallback((taskId: string) => {
    dispatch({ type: 'SELECT_TASK', payload: taskId });
  }, []);

  const toggleTaskSelection = useCallback((taskId: string) => {
    dispatch({ type: 'TOGGLE_TASK_SELECTION', payload: taskId });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const hoverTask = useCallback((taskId: string | null) => {
    dispatch({ type: 'HOVER_TASK', payload: taskId });
  }, []);

  const setZoomLevel = useCallback((level: ZoomLevel) => {
    dispatch({ type: 'SET_ZOOM_LEVEL', payload: level });
  }, []);

  const togglePhase = useCallback((phaseId: string) => {
    dispatch({ type: 'TOGGLE_PHASE', payload: phaseId });
  }, []);

  const startLinking = useCallback((taskId: string) => {
    dispatch({ type: 'START_LINKING', payload: taskId });
  }, []);

  const cancelLinking = useCallback(() => {
    dispatch({ type: 'CANCEL_LINKING' });
  }, []);

  const openContextMenu = useCallback((x: number, y: number, taskId: string) => {
    dispatch({ type: 'SET_CONTEXT_MENU', payload: { x, y, taskId } });
  }, []);

  const closeContextMenu = useCallback(() => {
    dispatch({ type: 'SET_CONTEXT_MENU', payload: null });
  }, []);

  const updateConfig = useCallback((config: Partial<GanttConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  }, []);

  const value: GanttContextType = {
    state,
    dispatch,
    zoomConfig,
    visibleTasks,
    taskPositions,
    criticalPathTasks,
    selectTask,
    toggleTaskSelection,
    clearSelection,
    hoverTask,
    setZoomLevel,
    togglePhase,
    startLinking,
    cancelLinking,
    openContextMenu,
    closeContextMenu,
    updateConfig,
  };

  return (
    <GanttContext.Provider value={value}>
      {children}
    </GanttContext.Provider>
  );
}

export function useGantt() {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGantt must be used within a GanttProvider');
  }
  return context;
}
