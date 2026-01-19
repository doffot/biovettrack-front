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
      <div className="bg-card rounded-xl p-4 border border-border shadow-soft hover:shadow-card transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-vet-muted uppercase tracking-wide">
              Servicios
            </p>
            <p className="text-2xl font-bold text-vet-text mt-1">
              {totalServices}
            </p>
            <p className="text-xs text-vet-muted/80 mt-0.5">
              {completedServices} completados ({completionRate.toFixed(0)}%)
            </p>
          </div>
          <div className="w-10 h-10 bg-vet-primary/10 border border-vet-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Scissors className="w-5 h-5 text-vet-primary" />
          </div>
        </div>
      </div>

      {/* Por Cobrar */}
      <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 shadow-soft hover:shadow-amber-500/10 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-600/80 dark:text-amber-300/80 uppercase tracking-wide">
              Por Cobrar
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {formatUSD(totalPendingUSD)}
            </p>
            {incomeStats.pendingBs > 0 && (
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
                + {formatBs(incomeStats.pendingBs)}
              </p>
            )}
          </div>
          <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      {/* Cobrado en USD */}
      <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 shadow-soft hover:shadow-emerald-500/10 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-600/80 dark:text-emerald-300/80 uppercase tracking-wide">
              Cobrado USD
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatUSD(incomeStats.paidUSD)}
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">
              {incomeStats.hasUSDTransactions ? 'en dólares' : 'sin pagos USD'}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Cobrado en Bolívares */}
      <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 shadow-soft hover:shadow-blue-500/10 transition-all group">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-blue-600/80 dark:text-blue-300/80 uppercase tracking-wide">
              Cobrado Bs
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {formatBs(incomeStats.paidBs)}
            </p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
              {incomeStats.hasBsTransactions ? 'en bolívares' : 'sin pagos Bs'}
            </p>
          </div>
          <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}