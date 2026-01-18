// src/views/ProfileView.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../api/AuthAPI";
import { User, Lock, FileSignature, Mail, Phone, MapPin, Shield } from "lucide-react";
import PersonalInfoForm from "../../components/profile/PersonalInfoForm";
import SecurityForm from "../../components/profile/SecurityForm";
import SignatureUpload from "../../components/profile/SignatureUpload";

const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "signature">("personal");

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-vet-text font-semibold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800 p-6 rounded-xl border border-red-500/30 text-center max-w-md">
          <div className="w-12 h-12 mx-auto mb-3 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-vet-text mb-2">Error al cargar perfil</h2>
          <p className="text-sm text-vet-muted mb-4">No se pudo obtener la información</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-vet-primary to-vet-secondary text-white text-sm font-semibold rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "personal" as const, label: "Información Personal", icon: User },
    { id: "security" as const, label: "Seguridad", icon: Lock },
    { id: "signature" as const, label: "Firma Digital", icon: FileSignature },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Header compacto */}
      <div className="relative bg-gradient-to-r from-vet-primary via-vet-secondary to-vet-primary flex-shrink-0">
        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-6">
            {/* Avatar compacto */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-xl">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white/20">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Información compacta */}
            <div className="flex-1">
              <h1 className="text-2xl font-black text-white mb-1">
                Dr(a). {profile.name} {profile.lastName}
              </h1>
              <p className="text-white/80 text-sm font-semibold mb-2">
                {profile.cmv} • {profile.estado}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <Mail className="w-3 h-3 text-white/70" />
                  <span className="text-xs text-white font-medium">{profile.email}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <Phone className="w-3 h-3 text-white/70" />
                  <span className="text-xs text-white font-medium">{profile.whatsapp}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                  <MapPin className="w-3 h-3 text-white/70" />
                  <span className="text-xs text-white font-medium">{profile.estado}</span>
                </div>
              </div>
            </div>

            {/* Stats compactos */}
            <div className="hidden md:flex gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center border border-white/20">
                <div className="text-2xl font-black text-white">{profile.patientCount || 0}</div>
                <div className="text-[10px] text-white/70 font-semibold uppercase">Pacientes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center border border-white/20">
                <div className="text-2xl font-black text-white">
                  {profile.planType === 'trial' ? 'Trial' : profile.planType === 'premium' ? 'Pro' : 'Basic'}
                </div>
                <div className="text-[10px] text-white/70 font-semibold uppercase">Plan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con altura fija */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Sidebar compacto */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-2 shadow-xl h-full flex flex-col">
              <nav className="space-y-1 flex-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all
                        ${isActive
                          ? "bg-gradient-to-r from-vet-primary to-vet-secondary text-white shadow-lg shadow-vet-primary/30"
                          : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden lg:block">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Info compacta */}
              <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <p className="text-[10px] text-slate-500 font-semibold mb-1">MIEMBRO DESDE</p>
                <p className="text-xs font-bold text-slate-300">
                  {new Date(profile.createdAt).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido principal con scroll interno */}
          <div className="lg:col-span-3 flex flex-col h-full overflow-hidden">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl flex flex-col h-full overflow-hidden">
              {/* Header del contenido compacto */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-600/50 flex-shrink-0">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  {tabs.find(t => t.id === activeTab)?.icon && 
                    React.createElement(tabs.find(t => t.id === activeTab)!.icon, { 
                      className: "w-5 h-5 text-vet-accent" 
                    })
                  }
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
              </div>

              {/* Contenido con scroll */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === "personal" ? (
                  <PersonalInfoForm profile={profile} />
                ) : activeTab === "security" ? (
                  <SecurityForm />
                ) : (
                  <SignatureUpload currentSignature={profile.signature} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;