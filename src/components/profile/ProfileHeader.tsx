// src/components/profile/ProfileHeader.tsx
import React from "react";
import { Calendar, MapPin } from "lucide-react";
import type { UserProfile } from "../../types";

interface ProfileHeaderProps {
  profile: UserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const fullName = `${profile.name} ${profile.lastName}`;
  const initials = `${profile.name.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-vet-light pt-6 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-xl bg-vet-primary/10 flex items-center justify-center border border-vet-border">
            <span className="text-lg font-bold text-vet-primary">{initials}</span>
          </div>

          {/* Info principal */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-xl font-bold text-vet-text">{fullName}</h1>
              <span className="px-2.5 py-0.5 bg-vet-primary/10 text-vet-primary text-xs font-medium rounded-full border border-vet-primary/20">
                CMV {profile.cmv} 
              </span>
            </div>
            <p className="text-sm text-vet-muted">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-vet-muted">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {profile.estado}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Miembro desde {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;