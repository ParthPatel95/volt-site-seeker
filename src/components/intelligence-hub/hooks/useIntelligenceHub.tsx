
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { 
  IntelHubState, 
  IntelHubAction, 
  IntelOpportunity, 
  IntelAlert 
} from '../types/intelligence-hub.types';

const initialState: IntelHubState = {
  opportunities: [],
  savedOpportunities: [],
  alerts: [],
  watchlist: [],
  isScanning: false,
  scanProgress: 0,
  currentPhase: '',
  scanStats: null,
  error: null,
  activeTab: 'discover'
};

function intelHubReducer(state: IntelHubState, action: IntelHubAction): IntelHubState {
  switch (action.type) {
    case 'SET_OPPORTUNITIES':
      return { ...state, opportunities: action.payload };
    case 'ADD_OPPORTUNITY':
      return { ...state, opportunities: [...state.opportunities, action.payload] };
    case 'SET_SAVED_OPPORTUNITIES':
      return { ...state, savedOpportunities: action.payload };
    case 'SAVE_OPPORTUNITY':
      const oppToSave = state.opportunities.find(o => o.id === action.payload);
      if (oppToSave && !state.savedOpportunities.find(o => o.id === action.payload)) {
        return { ...state, savedOpportunities: [...state.savedOpportunities, { ...oppToSave, status: 'saved' }] };
      }
      return state;
    case 'REMOVE_SAVED':
      return { ...state, savedOpportunities: state.savedOpportunities.filter(o => o.id !== action.payload) };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'MARK_ALERT_READ':
      return {
        ...state,
        alerts: state.alerts.map(a => a.id === action.payload ? { ...a, isRead: true } : a)
      };
    case 'ADD_TO_WATCHLIST':
      if (!state.watchlist.includes(action.payload)) {
        return { ...state, watchlist: [...state.watchlist, action.payload] };
      }
      return state;
    case 'REMOVE_FROM_WATCHLIST':
      return { ...state, watchlist: state.watchlist.filter(id => id !== action.payload) };
    case 'SET_SCANNING':
      return { ...state, isScanning: action.payload };
    case 'SET_PROGRESS':
      return { ...state, scanProgress: action.payload.progress, currentPhase: action.payload.phase };
    case 'SET_SCAN_STATS':
      return { ...state, scanStats: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'RESET_SCAN':
      return { ...state, opportunities: [], scanProgress: 0, currentPhase: '', scanStats: null, error: null };
    default:
      return state;
  }
}

interface IntelHubContextValue {
  state: IntelHubState;
  dispatch: React.Dispatch<IntelHubAction>;
  saveOpportunity: (id: string) => void;
  removeFromSaved: (id: string) => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  markAlertRead: (id: string) => void;
  setActiveTab: (tab: string) => void;
}

const IntelHubContext = createContext<IntelHubContextValue | undefined>(undefined);

export function IntelHubProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(intelHubReducer, initialState);

  const saveOpportunity = useCallback((id: string) => {
    dispatch({ type: 'SAVE_OPPORTUNITY', payload: id });
  }, []);

  const removeFromSaved = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SAVED', payload: id });
  }, []);

  const addToWatchlist = useCallback((id: string) => {
    dispatch({ type: 'ADD_TO_WATCHLIST', payload: id });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: id });
  }, []);

  const markAlertRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_ALERT_READ', payload: id });
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  return (
    <IntelHubContext.Provider value={{
      state,
      dispatch,
      saveOpportunity,
      removeFromSaved,
      addToWatchlist,
      removeFromWatchlist,
      markAlertRead,
      setActiveTab
    }}>
      {children}
    </IntelHubContext.Provider>
  );
}

export function useIntelligenceHub() {
  const context = useContext(IntelHubContext);
  if (!context) {
    throw new Error('useIntelligenceHub must be used within IntelHubProvider');
  }
  return context;
}
