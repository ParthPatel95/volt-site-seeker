import React, { useState, useCallback } from 'react';
import { Bitcoin, ArrowUpDown, Zap, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const SATS_PER_BTC = 100_000_000;

interface ConversionResult {
  btc: string;
  sats: string;
  formattedBtc: string;
  formattedSats: string;
}

const SatoshiConverter: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('1');
  const [inputType, setInputType] = useState<'btc' | 'sats'>('btc');
  const [result, setResult] = useState<ConversionResult>({
    btc: '1',
    sats: '100000000',
    formattedBtc: '1.00000000',
    formattedSats: '100,000,000'
  });

  const convert = useCallback((value: string, type: 'btc' | 'sats') => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'btc') {
      const sats = Math.round(numValue * SATS_PER_BTC);
      setResult({
        btc: numValue.toFixed(8),
        sats: sats.toString(),
        formattedBtc: numValue.toFixed(8),
        formattedSats: sats.toLocaleString()
      });
    } else {
      const btc = numValue / SATS_PER_BTC;
      setResult({
        btc: btc.toFixed(8),
        sats: Math.round(numValue).toString(),
        formattedBtc: btc.toFixed(8),
        formattedSats: Math.round(numValue).toLocaleString()
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    convert(value, inputType);
  };

  const toggleInputType = () => {
    const newType = inputType === 'btc' ? 'sats' : 'btc';
    setInputType(newType);
    convert(inputValue, newType);
  };

  const presets = [
    { label: '0.001 BTC', btc: 0.001 },
    { label: '0.01 BTC', btc: 0.01 },
    { label: '0.1 BTC', btc: 0.1 },
    { label: '1 BTC', btc: 1 },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Satoshi Converter</h3>
          <p className="text-sm text-muted-foreground">1 BTC = 100,000,000 satoshis</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Input Section */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground">
              Enter {inputType === 'btc' ? 'Bitcoin (BTC)' : 'Satoshis (sats)'}
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              className="pr-20 text-lg font-mono"
              placeholder="0"
              step={inputType === 'btc' ? '0.00000001' : '1'}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
              {inputType === 'btc' ? 'BTC' : 'sats'}
            </span>
          </div>
        </div>

        {/* Toggle Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleInputType}
            className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Switch
          </motion.button>
        </div>

        {/* Result Display */}
        <motion.div 
          key={`${result.btc}-${result.sats}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Bitcoin className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Bitcoin</span>
            </div>
            <div className="font-mono text-lg font-bold text-foreground truncate">
              {result.formattedBtc}
            </div>
            <div className="text-xs text-muted-foreground">BTC</div>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">Satoshis</span>
            </div>
            <div className="font-mono text-lg font-bold text-foreground truncate">
              {result.formattedSats}
            </div>
            <div className="text-xs text-muted-foreground">sats</div>
          </div>
        </motion.div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <motion.button
              key={preset.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInputType('btc');
                setInputValue(preset.btc.toString());
                convert(preset.btc.toString(), 'btc');
              }}
              className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
            >
              {preset.label}
            </motion.button>
          ))}
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Satoshi</strong> is the smallest unit of Bitcoin, 
            named after its creator. It allows for micro-transactions and precise pricing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SatoshiConverter;
