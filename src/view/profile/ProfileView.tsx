// src/views/ProfileView.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../api/AuthAPI";
import { 
  User, 
  Lock, 
  FileSignature, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck,
  Crown,
  Sparkles,
  Calendar,
  Activity,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  BadgeCheck,
  Clock,
  Users
} from "lucide-react";
import PersonalInfoForm from "../../components/profile/PersonalInfoForm";
import SecurityForm from "../../components/profile/SecurityForm";
import SignatureUpload from "../../components/profile/SignatureUpload";

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "signature">("personal");

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: 1,
  });

  // ==================== LOADING STATE ====================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[var(--color-vet-primary)]/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full border-4 border-[var(--color-border)]">
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-vet-primary)] animate-spin" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-8 h-8 text-[var(--color-vet-primary)]" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">Cargando perfil</h3>
          <p className="text-sm text-[var(--color-muted)]">Obteniendo tu información...</p>
        </div>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (isError || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
        <div className="bg-[var(--color-card)] p-8 rounded-2xl border border-[var(--color-border)] text-center max-w-md shadow-[var(--shadow-card)]">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[var(--color-vet-danger)]/20 rounded-full blur-xl" />
            <div className="relative w-20 h-20 bg-[var(--color-vet-danger)]/10 border-2 border-[var(--color-vet-danger)]/30 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--color-vet-danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Error al cargar perfil
          </h2>
          <p className="text-[var(--color-muted)] text-sm mb-6">
            No pudimos obtener la información de tu cuenta. Por favor intenta nuevamente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-vet-primary)] hover:bg-[var(--color-vet-secondary)] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-hover)] text-[var(--color-text)] text-sm font-semibold rounded-xl border border-[var(--color-border)] transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PLAN INFO ====================
  const getPlanInfo = (planType?: string) => {
    switch (planType) {
      case 'trial':
        return { 
          label: 'Prueba Gratuita', 
          shortLabel: 'Prueba',
          icon: Clock,
          bgClass: 'bg-amber-500/10',
          textClass: 'text-amber-500',
          borderClass: 'border-amber-500/30'
        };
      case 'premium':
        return { 
          label: 'Plan Premium', 
          shortLabel: 'Premium',
          icon: Crown,
          bgClass: 'bg-emerald-500/10',
          textClass: 'text-emerald-500',
          borderClass: 'border-emerald-500/30'
        };
      case 'basic':
        return { 
          label: 'Plan Básico', 
          shortLabel: 'Básico',
          icon: User,
          bgClass: 'bg-[var(--color-vet-primary)]/10',
          textClass: 'text-[var(--color-vet-primary)]',
          borderClass: 'border-[var(--color-vet-primary)]/30'
        };
      default:
        return { 
          label: 'Sin Plan', 
          shortLabel: 'N/A',
          icon: User,
          bgClass: 'bg-[var(--color-muted)]/10',
          textClass: 'text-[var(--color-muted)]',
          borderClass: 'border-[var(--color-border)]'
        };
    }
  };

  const planInfo = getPlanInfo(profile.planType);
  const PlanIcon = planInfo.icon;

  const tabs = [
    { 
      id: "personal" as const, 
      label: "Información Personal", 
      shortLabel: "Personal", 
      icon: User, 
      description: "Datos básicos de tu cuenta"
    },
    { 
      id: "security" as const, 
      label: "Seguridad", 
      shortLabel: "Seguridad", 
      icon: Lock, 
      description: "Contraseña y acceso"
    },
    { 
      id: "signature" as const, 
      label: "Firma Digital", 
      shortLabel: "Firma", 
      icon: FileSignature, 
      description: "Tu firma para documentos"
    },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab)!;
  const ActiveTabIcon = activeTabData.icon;

  const memberSince = new Date(profile.createdAt).toLocaleDateString('es-ES', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric' 
  });

  const memberSinceShort = new Date(profile.createdAt).toLocaleDateString('es-ES', { 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-300">
      
      {/* ==================== HEADER ==================== */}
      <div className="relative bg-[var(--color-card)] border-b border-[var(--color-border)] shadow-[var(--shadow-soft)]">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-vet-primary)] via-[var(--color-vet-accent)] to-[var(--color-vet-secondary)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link - minimalista */}
          <div className="pt-4 sm:pt-5">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-vet-primary)] transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium">Volver</span>
            </button>
          </div>

          {/* Profile Header Content */}
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left">
              
              {/* Avatar con estado */}
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-br from-[var(--color-vet-primary)] via-[var(--color-vet-accent)] to-[var(--color-vet-secondary)] rounded-2xl blur-sm opacity-50" />
                
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-secondary)] p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-[var(--color-card)] flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-[var(--color-vet-primary)] to-[var(--color-vet-accent)] bg-clip-text text-transparent">
                      {profile.name.charAt(0)}{profile.lastName.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div className={`
                  absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl flex items-center justify-center 
                  border-3 border-[var(--color-card)] shadow-md
                  ${profile.isActive ? 'bg-emerald-500' : 'bg-[var(--color-muted)]'}
                `}>
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Información principal */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
                      Dr(a). {profile.name} {profile.lastName}
                    </h1>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-vet-primary)]/10 text-[var(--color-vet-primary)] text-xs font-bold rounded-lg border border-[var(--color-vet-primary)]/20">
                        <Activity className="w-3.5 h-3.5" />
                        CMV {profile.cmv}
                      </span>
                      
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border ${planInfo.bgClass} ${planInfo.textClass} ${planInfo.borderClass}`}>
                        <PlanIcon className="w-3.5 h-3.5" />
                        {planInfo.shortLabel}
                      </span>

                      <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border
                        ${profile.isActive 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                          : 'bg-[var(--color-muted)]/10 text-[var(--color-muted)] border-[var(--color-border)]'
                        }
                      `}>
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {profile.isActive ? 'Verificado' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Contacto */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 mt-4">
                      <a 
                        href={`mailto:${profile.email}`}
                        className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-vet-primary)] transition-colors"
                      >
                        <div className="p-1 rounded-md bg-[var(--color-background)]">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate max-w-[200px]">{profile.email}</span>
                      </a>
                      <a 
                        href={`tel:${profile.whatsapp}`}
                        className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-vet-primary)] transition-colors"
                      >
                        <div className="p-1 rounded-md bg-[var(--color-background)]">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <span>{profile.whatsapp}</span>
                      </a>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                        <div className="p-1 rounded-md bg-[var(--color-background)]">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span>{profile.estado}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="flex gap-3 mt-4 lg:mt-0 justify-center sm:justify-start">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-[var(--color-vet-primary)]/30 to-[var(--color-vet-accent)]/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative px-5 py-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] text-center min-w-[90px] transition-all group-hover:border-[var(--color-vet-primary)]/30">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-[var(--color-vet-primary)]" />
                        </div>
                        <div className="text-2xl font-bold text-[var(--color-vet-primary)]">
                          {profile.patientCount || 0}
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)] uppercase font-bold tracking-wider mt-1">
                          Pacientes
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-[var(--color-vet-accent)]/30 to-emerald-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative px-5 py-4 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] text-center min-w-[90px] transition-all group-hover:border-[var(--color-vet-accent)]/30">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="w-4 h-4 text-[var(--color-vet-accent)]" />
                        </div>
                        <div className="text-sm font-bold text-[var(--color-text)]">
                          {memberSinceShort}
                        </div>
                        <div className="text-[10px] text-[var(--color-muted)] uppercase font-bold tracking-wider mt-1">
                          Miembro
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* ==================== SIDEBAR ==================== */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden lg:sticky lg:top-6">
              {/* Header del sidebar */}
              <div className="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)]">
                <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">
                  Configuración
                </h3>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-3.5 rounded-xl transition-all duration-200 group mb-1 last:mb-0
                        ${isActive
                          ? "bg-[var(--color-vet-primary)] text-white shadow-lg shadow-[var(--color-vet-primary)]/25"
                          : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)]"
                        }
                      `}
                    >
                      <div className={`
                        p-2.5 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-white/20' 
                          : 'bg-[var(--color-background)] group-hover:bg-[var(--color-vet-primary)]/10 border border-[var(--color-border)] group-hover:border-[var(--color-vet-primary)]/30'
                        }
                      `}>
                        <Icon className={`w-4 h-4 ${!isActive && 'group-hover:text-[var(--color-vet-primary)]'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold">{tab.shortLabel}</p>
                        <p className={`text-[10px] leading-tight ${isActive ? 'text-white/70' : 'text-[var(--color-muted)]'}`}>
                          {tab.description}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-all duration-200 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div className="mx-4 h-px bg-[var(--color-border)]" />

              {/* Account Info Card */}
              <div className="p-3">
                <div className="p-4 bg-gradient-to-br from-[var(--color-vet-primary)]/5 via-[var(--color-vet-accent)]/5 to-transparent rounded-xl border border-[var(--color-vet-primary)]/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg border border-[var(--color-vet-primary)]/20">
                      <Sparkles className="w-4 h-4 text-[var(--color-vet-primary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--color-text)]">
                        Cuenta Verificada
                      </p>
                      <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-relaxed">
                        Tienes acceso completo a todas las funciones.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--color-muted)] font-medium uppercase tracking-wider">
                        Tu plan
                      </span>
                      <span className={`text-xs font-bold ${planInfo.textClass}`}>
                        {planInfo.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member since */}
              <div className="px-4 pb-4">
                <div className="text-center p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-border)]">
                  <p className="text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-wider mb-1">
                    Miembro desde
                  </p>
                  <p className="text-sm font-bold text-[var(--color-text)]">
                    {memberSince}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== CONTENT AREA ==================== */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden">
              {/* Content Header */}
              <div className="px-5 sm:px-6 py-4 bg-[var(--color-background)] border-b border-[var(--color-border)]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-vet-primary)]/10 rounded-xl border border-[var(--color-vet-primary)]/20">
                    <ActiveTabIcon className="w-5 h-5 text-[var(--color-vet-primary)]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text)]">
                      {activeTabData.label}
                    </h2>
                    <p className="text-sm text-[var(--color-muted)]">
                      {activeTabData.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-5 sm:p-6">
                {activeTab === "personal" ? (
                  <PersonalInfoForm profile={profile} />
                ) : activeTab === "security" ? (
                  <SecurityForm />
                ) : (
                  <SignatureUpload currentSignature={profile.signature} />
                )}
              </div>
            </div>

            {/* Quick Info Card (Mobile) */}
            <div className="mt-4 lg:hidden">
              <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--color-vet-primary)]/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-[var(--color-vet-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        {planInfo.label}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        Miembro desde {memberSinceShort}
                      </p>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${planInfo.bgClass} border ${planInfo.borderClass}`}>
                    <PlanIcon className={`w-5 h-5 ${planInfo.textClass}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;