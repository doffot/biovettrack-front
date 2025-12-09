// src/components/grooming/ServiceStatsCards.tsx
import { Scissors, DollarSign, Clock, Wallet } from 'lucide-react';

interface IncomeStats {
  totalUSD: number;
  totalBs: number;
  paidUSD: number;
  paidBs: number;
  pendingUSD: number;
  pendingBs: number;
  hasBsTransactions: boolean;
  hasUSDTransactions: boolean;
}

interface StatsCardsProps {
  filteredServices: any[];
  incomeStats: IncomeStats;
}

export default function ServiceStatsCards({ filteredServices, incomeStats }: StatsCardsProps) {
  const totalServices = filteredServices.length;
  const completedServices = filteredServices.filter(s => s.status === 'Completado').length;
  const completionRate = totalServices > 0 ? (completedServices / totalServices) * 100 : 0;

  const formatUSD = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatBs = (amount: number): string => {
    return `Bs. ${amount.toLocaleString('es-VE', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Total cobrado en ambas monedas (convertir Bs a USD para el total general)
  const totalPendingUSD = incomeStats.pendingUSD;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Servicios */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Servicios
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalServices}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {completedServices} completados ({completionRate.toFixed(0)}%)
            </p>
          </div>
          <div className="w-10 h-10 bg-vet-primary/10 rounded-lg flex items-center justify-center">
            <Scissors className="w-5 h-5 text-vet-primary" />
          </div>
        </div>
      </div>

      {/* Por Cobrar */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Por Cobrar
            </p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {formatUSD(totalPendingUSD)}
            </p>
            {incomeStats.pendingBs > 0 && (
              <p className="text-xs text-orange-500 mt-0.5">
                + {formatBs(incomeStats.pendingBs)}
              </p>
            )}
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Cobrado en USD */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Cobrado USD
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatUSD(incomeStats.paidUSD)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {incomeStats.hasUSDTransactions ? 'en dólares' : 'sin pagos USD'}
            </p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Cobrado en Bolívares */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Cobrado Bs
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatBs(incomeStats.paidBs)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {incomeStats.hasBsTransactions ? 'en bolívares' : 'sin pagos Bs'}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}