import { useState, useEffect, useCallback, useRef } from 'react';

interface HardwareBarcodeScannerOptions {
  enabled?: boolean;
  maxKeystrokeDelay?: number;
  minBarcodeLength?: number;
  terminatorKey?: string;
  audioFeedback?: boolean;
  onScan: (barcode: string) => void;
}

export function useHardwareBarcodeScanner({
  enabled = true,
  maxKeystrokeDelay = 50,
  minBarcodeLength = 4,
  terminatorKey = 'Enter',
  audioFeedback = true,
  onScan,
}: HardwareBarcodeScannerOptions) {
  const [isListening, setIsListening] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const bufferRef = useRef<string>('');
  const lastKeystrokeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playBeep = useCallback(() => {
    if (!audioFeedback) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1200;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported
    }
  }, [audioFeedback]);

  const clearBuffer = useCallback(() => {
    bufferRef.current = '';
  }, []);

  const processBuffer = useCallback(() => {
    const barcode = bufferRef.current.trim();
    
    if (barcode.length >= minBarcodeLength) {
      setLastScan(barcode);
      playBeep();
      onScan(barcode);
    }
    
    clearBuffer();
  }, [minBarcodeLength, playBeep, onScan, clearBuffer]);

  useEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const now = Date.now();
      const timeSinceLastKeystroke = now - lastKeystrokeRef.current;
      lastKeystrokeRef.current = now;

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If too much time has passed, start fresh
      if (timeSinceLastKeystroke > maxKeystrokeDelay && bufferRef.current.length > 0) {
        clearBuffer();
      }

      // Check for terminator key
      if (event.key === terminatorKey) {
        event.preventDefault();
        processBuffer();
        return;
      }

      // Add printable characters to buffer
      if (event.key.length === 1) {
        bufferRef.current += event.key;
        setIsListening(true);

        // Set timeout to process buffer if no more keystrokes
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length >= minBarcodeLength) {
            processBuffer();
          } else {
            clearBuffer();
          }
          setIsListening(false);
        }, maxKeystrokeDelay * 2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, maxKeystrokeDelay, minBarcodeLength, terminatorKey, processBuffer, clearBuffer]);

  return {
    isListening,
    lastScan,
    clearLastScan: () => setLastScan(null),
  };
}
