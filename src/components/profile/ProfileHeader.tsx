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
    <div className="bg-gradient-to-br from-vet-primary to-vet-secondary pt-8 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-white">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
            <span className="text-2xl sm:text-3xl font-bold">{initials}</span>
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-xl sm:text-2xl font-bold">{fullName}</h1>
            <p className="text-white/80 text-sm mt-1">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {profile.estado}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Desde {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>

          {/* Badge CMV */}
          <div className="hidden sm:flex flex-col items-center px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <span className="text-xs text-white/60">CMV</span>
            <span className="font-bold">{profile.cmv}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;