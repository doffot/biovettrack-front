import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "../../api/AuthAPI";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import PersonalInfoForm from "../../components/profile/PersonalInfoForm";
import SecurityForm from "../../components/profile/SecurityForm";

const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"personal" | "security">("personal");

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-vet-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-vet-text font-medium">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-sky-soft p-8 rounded-2xl border border-red-500/30 text-center max-w-md mx-auto shadow-lg shadow-black/20">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-vet-text mb-2">Error al cargar perfil</h2>
          <p className="text-vet-muted mb-6">No se pudo obtener la información de tu perfil</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-vet-primary to-vet-secondary hover:from-vet-secondary hover:to-vet-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-vet-primary/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header con info del usuario */}
      <ProfileHeader profile={profile} />

      {/* Contenedor principal */}
      <div className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="bg-sky-soft rounded-2xl shadow-lg shadow-black/10 border border-slate-700/50 overflow-hidden">
          {/* Tabs */}
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Contenido del tab activo */}
          <div className="p-4 sm:p-6">
            {activeTab === "personal" ? (
              <PersonalInfoForm profile={profile} />
            ) : (
              <SecurityForm />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;