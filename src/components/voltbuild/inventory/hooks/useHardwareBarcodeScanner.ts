import { useEffect, useRef, useCallback, useState } from 'react';

interface UseHardwareBarcodeScannerOptions {
  /** Enable/disable the scanner (default: true) */
  enabled?: boolean;
  /** Minimum time between keystrokes in ms to be considered scanner input (default: 50) */
  maxKeystrokeDelay?: number;
  /** Minimum barcode length to trigger a scan (default: 4) */
  minBarcodeLength?: number;
  /** Key that terminates a scan (default: 'Enter') */
  terminatorKey?: 'Enter' | 'Tab';
  /** Callback when a barcode is scanned */
  onScan: (barcode: string) => void;
  /** Optional callback for debug logging */
  onDebug?: (message: string) => void;
  /** Play a beep sound on successful scan (default: true) */
  audioFeedback?: boolean;
}

interface ScannerState {
  isListening: boolean;
  lastScan: string | null;
  lastScanTime: Date | null;
}

export function useHardwareBarcodeScanner({
  enabled = true,
  maxKeystrokeDelay = 50,
  minBarcodeLength = 4,
  terminatorKey = 'Enter',
  onScan,
  onDebug,
  audioFeedback = true,
}: UseHardwareBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [state, setState] = useState<ScannerState>({
    isListening: enabled,
    lastScan: null,
    lastScanTime: null,
  });

  const log = useCallback((message: string) => {
    onDebug?.(`[HardwareScanner] ${message}`);
  }, [onDebug]);

  const playBeep = useCallback(() => {
    if (!audioFeedback) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not available
    }
  }, [audioFeedback]);

  const clearBuffer = useCallback(() => {
    bufferRef.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const processScan = useCallback((barcode: string) => {
    if (barcode.length >= minBarcodeLength) {
      log(`Valid scan detected: ${barcode}`);
      playBeep();
      setState(prev => ({
        ...prev,
        lastScan: barcode,
        lastScanTime: new Date(),
      }));
      onScan(barcode);
    } else {
      log(`Scan too short (${barcode.length} chars, need ${minBarcodeLength})`);
    }
    clearBuffer();
  }, [minBarcodeLength, onScan, playBeep, clearBuffer, log]);

  useEffect(() => {
    if (!enabled) {
      setState(prev => ({ ...prev, isListening: false }));
      return;
    }

    setState(prev => ({ ...prev, isListening: true }));

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      const target = event.target as HTMLElement;
      
      // Ignore if user is typing in an input field
      const isInputField = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.isContentEditable;
      
      // Check if this is the terminator key
      if (event.key === terminatorKey) {
        if (bufferRef.current.length > 0) {
          log(`Terminator key pressed, processing buffer: ${bufferRef.current}`);
          event.preventDefault();
          processScan(bufferRef.current);
          return;
        }
        // If buffer is empty, let the event pass through normally
        return;
      }

      // If in an input field and not rapid input, ignore
      if (isInputField) {
        const timeSinceLastKey = now - lastKeyTimeRef.current;
        // Allow scanner input even in input fields if it's rapid
        if (timeSinceLastKey > maxKeystrokeDelay && bufferRef.current.length === 0) {
          return;
        }
      }

      // Only capture printable characters
      if (event.key.length !== 1) {
        return;
      }

      const timeSinceLastKey = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If too much time has passed, start a new buffer
      if (timeSinceLastKey > maxKeystrokeDelay && bufferRef.current.length > 0) {
        log(`Timeout exceeded (${timeSinceLastKey}ms), clearing buffer`);
        clearBuffer();
      }

      // Add character to buffer
      bufferRef.current += event.key;
      log(`Buffer: ${bufferRef.current} (delay: ${timeSinceLastKey}ms)`);

      // Set a timeout to clear the buffer if no terminator comes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (bufferRef.current.length >= minBarcodeLength) {
          // Some scanners don't send a terminator, so process after timeout
          log(`Processing buffer on timeout: ${bufferRef.current}`);
          processScan(bufferRef.current);
        } else {
          clearBuffer();
        }
      }, 100);

      // If this looks like scanner input (rapid), prevent default
      if (timeSinceLastKey < maxKeystrokeDelay && bufferRef.current.length > 2) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, maxKeystrokeDelay, minBarcodeLength, terminatorKey, processScan, clearBuffer, log]);

  const resetScanner = useCallback(() => {
    clearBuffer();
    setState(prev => ({
      ...prev,
      lastScan: null,
      lastScanTime: null,
    }));
  }, [clearBuffer]);

  return {
    ...state,
    resetScanner,
  };
}
