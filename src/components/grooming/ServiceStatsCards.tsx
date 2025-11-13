// src/components/grooming/ServiceStatsCards.tsx
import { Scissors, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency, getPaymentMethodInfo } from '../../utils/currencyUtils';

interface CurrencyTotals {
  total: number;
  paid: number;
  count: number;
}

interface StatsCardsProps {
  filteredServices: any[];
}

export default function ServiceStatsCards({ filteredServices }: StatsCardsProps) {
  // Calcular estadísticas por moneda
  const totalsByCurrency = filteredServices.reduce((acc: Record<string, CurrencyTotals>, service) => {
    const paymentInfo = getPaymentMethodInfo(service.paymentMethod);
    console.log(paymentInfo);
    const currency = paymentInfo.currency;
    
    if (!acc[currency]) {
      acc[currency] = { total: 0, paid: 0, count: 0 };
    }
    
    acc[currency].total += service.cost;
    acc[currency].paid += service.amountPaid || 0;
    acc[currency].count += 1;
    
    return acc;
  }, {});

  const totalServices = filteredServices.length;
  const completedServices = filteredServices.filter(s => s.status === 'Completado').length;
  const completionRate = totalServices > 0 ? (completedServices / totalServices) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {/* Total Servicios - Compacto */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Servicios</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                {completionRate.toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{completedServices} completados</p>
          </div>
          <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
            <Scissors className="w-5 h-5 text-vet-primary" />
          </div>
        </div>
      </div>

      {/* Cards por moneda - Ultra compactas */}
      {Object.entries(totalsByCurrency).map(([currency, totalsData]) => {
        const totals = totalsData as CurrencyTotals;
        const pending = totals.total - totals.paid;
        const average = totals.count > 0 ? totals.total / totals.count : 0;
        
        return (
          <div key={currency} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            {/* Header de moneda */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {currency === 'VES' || currency === 'Bolivares' || currency === 'Bs' 
                  ? 'Bs' 
                  : currency}
              </span>
              <span className="text-xs text-gray-400">{totals.count} serv.</span>
            </div>
            
            {/* Datos compactos */}
            <div className="space-y-2">
              {/* Ingresos */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-gray-600">Ingresos</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(totals.total, currency)}
                </span>
              </div>
              
              {/* Por Cobrar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-gray-600">Por Cobrar</span>
                </div>
                <span className="text-sm font-bold text-orange-600">
                  {formatCurrency(pending, currency)}
                </span>
              </div>
              
              {/* Promedio */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-gray-600">Promedio</span>
                </div>
                <span className="text-xs font-semibold text-blue-600">
                  {formatCurrency(average, currency)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}