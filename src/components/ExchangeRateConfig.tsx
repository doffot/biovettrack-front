// src/components/ExchangeRateConfig.tsx
import { useState, useEffect } from "react";
import { getCurrentManualRate, getExchangeRate, getExchangeRateMode, setAutoExchangeRate, setManualExchangeRate } from "../utils/exchangeRateService";


export function ExchangeRateConfig() {
  const [mode, setMode] = useState<'manual' | 'auto'>('auto');
  const [manualRate, setManualRate] = useState<string>('');
  const [currentRate, setCurrentRate] = useState<number>(36.50);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const savedMode = getExchangeRateMode();
      setMode(savedMode);
      
      if (savedMode === 'manual') {
        const rate = getCurrentManualRate();
        if (rate) setManualRate(rate.toString());
      }
      
      const rate = await getExchangeRate();
      setCurrentRate(rate);
    };
    
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (mode === 'manual') {
        const rate = parseFloat(manualRate);
        if (isNaN(rate) || rate <= 0) {
          throw new Error("Valor inválido");
        }
        setManualExchangeRate(rate);
      } else {
        setAutoExchangeRate();
      }
      
      const newRate = await getExchangeRate();
      setCurrentRate(newRate);
      
      // Aquí podrías guardar la configuración en localStorage o en la BD
      localStorage.setItem('exchangeRateMode', mode);
      if (mode === 'manual') {
        localStorage.setItem('manualExchangeRate', manualRate);
      }
    } catch (error) {
      alert("Error al guardar la configuración: " + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-vet-text mb-3">Configuración de Tipo de Cambio</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="auto"
            checked={mode === 'auto'}
            onChange={() => setMode('auto')}
            className="w-4 h-4 text-vet-primary"
          />
          <label htmlFor="auto" className="text-sm text-vet-text">Automático (API en tiempo real)</label>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="manual"
            checked={mode === 'manual'}
            onChange={() => setMode('manual')}
            className="w-4 h-4 text-vet-primary"
          />
          <label htmlFor="manual" className="text-sm text-vet-text">Manual</label>
        </div>
        
        {mode === 'manual' && (
          <div>
            <label className="block text-xs text-vet-muted mb-1">Tipo de cambio (Bs/USD)</label>
            <input
              type="number"
              step="0.01"
              value={manualRate}
              onChange={(e) => setManualRate(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              placeholder="36.50"
            />
          </div>
        )}
        
        <div className="text-xs text-vet-muted">
          Tipo de cambio actual: <span className="font-medium">{currentRate.toFixed(2)} Bs/USD</span>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-vet-primary text-white text-sm rounded hover:bg-vet-secondary disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
}