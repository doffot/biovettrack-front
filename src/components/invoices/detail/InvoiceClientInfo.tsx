// src/components/invoices/detail/InvoiceClientInfo.tsx
import { User, Phone, PawPrint } from "lucide-react";

interface InvoiceClientInfoProps {
  ownerName: string;
  ownerPhone: string;
  patientName: string;
}

export function InvoiceClientInfo({ 
  ownerName, 
  ownerPhone, 
  patientName 
}: InvoiceClientInfoProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cliente */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Cliente
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {ownerName || "—"}
              </span>
            </div>
            {ownerPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{ownerPhone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mascota */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Paciente
          </p>
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {patientName || "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}