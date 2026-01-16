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

  const totalPendingUSD = incomeStats.pendingUSD;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Servicios */}
      <div className="bg-sky-soft rounded-xl p-4 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-vet-primary/10 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-vet-muted uppercase tracking-wide">
              Servicios
            </p>
            <p className="text-2xl font-bold text-vet-text mt-1">
              {totalServices}
            </p>
            <p className="text-xs text-vet-muted mt-0.5">
              {completedServices} completados ({completionRate.toFixed(0)}%)
            </p>
          </div>
          <div className="w-10 h-10 bg-vet-primary/20 border border-vet-primary/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Scissors className="w-5 h-5 text-vet-accent" />
          </div>
        </div>
      </div>

      {/* Por Cobrar */}
      <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/30 shadow-lg shadow-orange-500/5 hover:shadow-orange-500/20 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-orange-300/80 uppercase tracking-wide">
              Por Cobrar
            </p>
            <p className="text-2xl font-bold text-orange-400 mt-1">
              {formatUSD(totalPendingUSD)}
            </p>
            {incomeStats.pendingBs > 0 && (
              <p className="text-xs text-orange-400/70 mt-0.5">
                + {formatBs(incomeStats.pendingBs)}
              </p>
            )}
          </div>
          <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Cobrado en USD */}
      <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/30 shadow-lg shadow-green-500/5 hover:shadow-green-500/20 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-green-300/80 uppercase tracking-wide">
              Cobrado USD
            </p>
            <p className="text-2xl font-bold text-green-400 mt-1">
              {formatUSD(incomeStats.paidUSD)}
            </p>
            <p className="text-xs text-green-400/70 mt-0.5">
              {incomeStats.hasUSDTransactions ? 'en dólares' : 'sin pagos USD'}
            </p>
          </div>
          <div className="w-10 h-10 bg-green-500/20 border border-green-500/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
        </div>
      </div>

      {/* Cobrado en Bolívares */}
      <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 border border-blue-500/30 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/20 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-300/80 uppercase tracking-wide">
              Cobrado Bs
            </p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {formatBs(incomeStats.paidBs)}
            </p>
            <p className="text-xs text-blue-400/70 mt-0.5">
              {incomeStats.hasBsTransactions ? 'en bolívares' : 'sin pagos Bs'}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/40 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}