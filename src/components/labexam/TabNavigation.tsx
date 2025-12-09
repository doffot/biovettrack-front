// src/components/labexam/TabNavigation.tsx
import { 
  User, 
  ClipboardList, 
  Microscope, 
  FileText,
  Lock,
  Check
} from "lucide-react";

type TabType = 'patient' | 'general' | 'differential' | 'observations';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isPatientSelected?: boolean;
}

export function TabNavigation({ activeTab, onTabChange, isPatientSelected = false }: TabNavigationProps) {
  const tabs = [
    { 
      id: 'patient' as const, 
      label: 'Paciente', 
      shortLabel: 'Paciente',
      icon: User,
      enabled: true,
    },
    { 
      id: 'general' as const, 
      label: 'Datos Generales', 
      shortLabel: 'General',
      icon: ClipboardList,
      enabled: isPatientSelected,
    },
    { 
      id: 'differential' as const, 
      label: 'Diferencial', 
      shortLabel: 'Conteo',
      icon: Microscope,
      enabled: isPatientSelected,
    },
    { 
      id: 'observations' as const, 
      label: 'Observaciones', 
      shortLabel: 'Notas',
      icon: FileText,
      enabled: isPatientSelected,
    },
  ];

  const getTabIndex = (tabId: TabType) => tabs.findIndex(t => t.id === tabId);
  const currentIndex = getTabIndex(activeTab);

  return (
    <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
      <nav className="flex">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isEnabled = tab.enabled;
          const isCompleted = index < currentIndex && isEnabled;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => isEnabled && onTabChange(tab.id)}
              disabled={!isEnabled}
              className={`
                relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 
                px-2 sm:px-4 py-3 sm:py-3.5
                text-xs sm:text-sm font-medium
                transition-all duration-200
                group
                ${isActive 
                  ? 'text-vet-primary bg-white' 
                  : isEnabled
                    ? 'text-gray-500 hover:text-vet-primary hover:bg-white/80'
                    : 'text-gray-300 cursor-not-allowed bg-gray-50/50'
                }
              `}
            >
              {/* Indicador de paso / estado */}
              <span className={`
                flex items-center justify-center
                w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-xs font-bold
                transition-all duration-200
                ${isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isActive 
                    ? 'bg-vet-primary text-white shadow-sm shadow-vet-primary/30' 
                    : isEnabled
                      ? 'bg-gray-200 text-gray-500 group-hover:bg-vet-primary/20 group-hover:text-vet-primary'
                      : 'bg-gray-100 text-gray-300'
                }
              `}>
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : !isEnabled ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : (
                  index + 1
                )}
              </span>
              
              {/* Icono en móvil */}
              <Icon className={`w-4 h-4 sm:hidden ${
                isActive ? 'text-vet-primary' : isEnabled ? 'text-gray-400' : 'text-gray-200'
              }`} />
              
              <span className="hidden sm:inline truncate">{tab.label}</span>
              
              <span className="sm:hidden text-[10px]">{tab.shortLabel}</span>
              
              {/* Línea activa inferior */}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-vet-primary rounded-full" />
              )}
              
              {/* Línea completada */}
              {isCompleted && !isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Mensaje si no hay paciente */}
      {!isPatientSelected && activeTab === 'patient' && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100">
          <p className="text-xs text-amber-700 text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3" />
            <span>Selecciona un paciente para desbloquear las siguientes secciones</span>
          </p>
        </div>
      )}
    </div>
  );
}