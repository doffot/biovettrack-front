import React from "react";
import { User, Lock } from "lucide-react";

interface ProfileTabsProps {
  activeTab: "personal" | "security";
  setActiveTab: (tab: "personal" | "security") => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "personal" as const, label: "Información Personal", icon: User },
    { id: "security" as const, label: "Seguridad", icon: Lock },
  ];

  return (
    <div className="flex border-b border-slate-700">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium
              transition-all duration-200 border-b-2
              ${
                isActive
                  ? "text-vet-primary border-vet-primary bg-vet-primary/10"
                  : "text-vet-muted border-transparent hover:text-vet-text hover:bg-slate-800"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">
              {tab.id === "personal" ? "Personal" : "Seguridad"}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ProfileTabs;