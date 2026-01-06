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
        <div className="w-10 h-10 border-4 border-vet-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 font-medium">Error al cargar el perfil</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-vet-primary text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vet-gray-50 pb-8">
      {/* Header con info del usuario */}
      <ProfileHeader profile={profile} />

      {/* Contenedor principal */}
      <div className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
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