// src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subtitleClassName?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'sm',
  showText = false,
  showSubtitle = false,
  layout = 'horizontal',
  className = '',
  iconClassName = '',
  textClassName = '',
  subtitleClassName = ''
}) => {
  const sizeConfig = {
    sm: {
      container: layout === 'horizontal' ? 'gap-4' : 'gap-3',
      icon: 'w-20 h-20', // Aumentado para horizontal
      text: 'text-md',
      subtitle: 'text-xs'
    },
    md: {
      container: layout === 'horizontal' ? 'gap-5' : 'gap-4',
      icon: 'w-14 h-14', // Aumentado
      text: 'text-4xl',
      subtitle: 'text-sm'
    },
    lg: {
      container: layout === 'horizontal' ? 'gap-6' : 'gap-5',
      icon: 'w-18 h-18', // Aumentado
      text: 'text-5xl',
      subtitle: 'text-base'
    },
    xl: {
      container: layout === 'horizontal' ? 'gap-7' : 'gap-6',
      icon: 'w-34 h-34', // Aumentado
      text: 'text-4xl',
      subtitle: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`flex ${layout === 'horizontal' ? 'flex-row items-center' : 'flex-col items-center'} ${config.container} ${className}`}
    >
      {/* Logo SVG desde la carpeta public */}
      <div className={`relative ${config.icon} ${iconClassName}`}>
        <img
          src="/logobtv.svg"
          alt="BioVetTrack Logo"
          className="w-full h-full text-primary logo-glow"
        />
      </div>

      {showText && (
        <div
          className={`${
            layout === 'horizontal' ? 'ml-4' : 'mt-3'
          } flex flex-col items-start text-left`}
        >
          <div className="relative">
            <h1 className={`font-black text-primary tracking-tight animate-neon-pulse ${config.text} ${textClassName}`}>
              BioVetTrack
            </h1>
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-primary/60 text-2xl font-thin">{'['}</div>
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-primary/60 text-2xl font-thin">{']'}</div>
          </div>
          <div className="w-24 h-1 bg-primary rounded-full shadow-neon animate-pulse-soft mt-2"></div>
          {showSubtitle && (
            <p className={`text-muted font-medium mt-2 tracking-wide ${config.subtitle} ${subtitleClassName}`}>
              <span className="text-primary">///</span> Sistema integral veterinario <span className="text-primary">///</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;