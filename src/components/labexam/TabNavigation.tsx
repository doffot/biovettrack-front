// components/TabNavigation.tsx

type TabType = 'general' | 'differential' | 'observations';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'general' as const, label: 'Datos Generales' },
    { id: 'differential' as const, label: 'Conteo Diferencial' },
    { id: 'observations' as const, label: 'Observaciones' },
  ] as const;

  return (
    <div className="border-b border-vet-muted/30">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 font-semibold text-sm transition-colors relative ${
            activeTab === tab.id
              ? 'text-vet-primary border-b-2 border-vet-primary'
              : 'text-vet-muted hover:text-vet-text'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-vet-primary"></span>
          )}
        </button>
      ))}
    </div>
  );
}