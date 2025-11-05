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
      container: layout === 'horizontal' ? 'gap-3' : 'gap-2',
      icon: 'w-10 h-10',
      text: 'text-lg font-bold',
      subtitle: 'text-xs'
    },
    md: {
      container: layout === 'horizontal' ? 'gap-4' : 'gap-3',
      icon: 'w-12 h-12',
      text: 'text-xl font-bold',
      subtitle: 'text-sm'
    },
    lg: {
      container: layout === 'horizontal' ? 'gap-5' : 'gap-4',
      icon: 'w-16 h-16',
      text: 'text-2xl font-bold',
      subtitle: 'text-base'
    },
    xl: {
      container: layout === 'horizontal' ? 'gap-6' : 'gap-5',
      icon: 'w-20 h-20',
      text: 'text-3xl font-bold',
      subtitle: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  return (
    <div
      className={` flex ${layout === 'horizontal' ? 'flex-row items-center' : 'flex-col items-center'} ${config.container} ${className}`}
    >
      {/* Logo SVG */}
      <div className={`relative ${config.icon} ${iconClassName}`}>
        <img
          src="/logobtv.svg"
          alt="BioVetTrack Logo"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div
          className={`${
            layout === 'horizontal' ? '' : 'text-center'
          } flex flex-col ${layout === 'horizontal' ? 'items-start' : 'items-center'}`}
        >
          <h1 className={`text-vet-light font-bold tracking-tight ${config.text} ${textClassName}`}>
            BioVetTrack
          </h1>
          
          {showSubtitle && (
            <p className={`text-gray-600 font-medium mt-1 ${config.subtitle} ${subtitleClassName}`}>
              Sistema integral veterinario
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;