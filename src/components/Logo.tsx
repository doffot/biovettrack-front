

// import React from 'react';
// interface LogoProps {
//   size?: 'sm' | 'md' | 'lg' | 'xl';
//   showText?: boolean;
//   showSubtitle?: boolean;
//   className?: string;
//   iconClassName?: string;
//   textClassName?: string;
//   subtitleClassName?: string;
// }

// const Logo: React.FC<LogoProps> = ({
//   size = 'md',
//   showText = true,
//   showSubtitle = false,
//   className = '',
//   iconClassName = '',
//   textClassName = '',
//   subtitleClassName = ''
// }) => {
  
//   const sizeConfig = {
//     sm: {
//       container: 'gap-2',
//       circle: 'w-8 h-8',
//       text: 'text-2xl',
//       subtitle: 'text-xs',
//       strokeWidth: '2'
//     },
//     md: {
//       container: 'gap-3',
//       circle: 'w-12 h-12',
//       text: 'text-4xl',
//       subtitle: 'text-sm',
//       strokeWidth: '2.5'
//     },
//     lg: {
//       container: 'gap-4',
//       circle: 'w-16 h-16',
//       text: 'text-5xl',
//       subtitle: 'text-base',
//       strokeWidth: '3'
//     },
//     xl: {
//       container: 'gap-5',
//       circle: 'w-20 h-20',
//       text: 'text-6xl',
//       subtitle: 'text-lg',
//       strokeWidth: '3.5'
//     }
//   };

//   const config = sizeConfig[size];

//   return (
//     <div className={`flex flex-col items-center ${config.container} ${className}`}>
//       <div className={`relative ${config.circle} ${iconClassName} mx-auto`}>
//         <svg
//           viewBox="0 0 48 48"
//           className="w-full h-full text-primary logo-glow"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <circle
//             cx="24"
//             cy="24"
//             r="20"
//             stroke="currentColor"
//             strokeWidth={config.strokeWidth}
//             className="animate-neon-pulse"
//           />
          
//           <line
//             x1="8"
//             y1="8"
//             x2="40"
//             y2="40"
//             stroke="currentColor"
//             strokeWidth={config.strokeWidth}
//             strokeDasharray="4 4"
//             className="animate-pulse-soft"
//           />
          
//           <circle
//             cx="12"
//             cy="12"
//             r="1.5"
//             fill="currentColor"
//             className="animate-neon-pulse"
//           />
//           <circle
//             cx="36"
//             cy="36"
//             r="1.5"
//             fill="currentColor"
//             className="animate-neon-pulse"
//           />
//         </svg>
//       </div>

//       {showText && (
//         <div className="flex flex-col items-center text-center">
//           <div className="relative">
//             <h1 className={`font-black text-primary tracking-tight animate-neon-pulse ${config.text} ${textClassName}`}>
//               BioVetTrack
//             </h1>
            
//             <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-primary/60 text-2xl font-thin">{'['}</div>
//             <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-primary/60 text-2xl font-thin">{']'}</div>
//           </div>
          
//           <div className="w-32 h-1 bg-primary rounded-full shadow-neon animate-pulse-soft mt-2"></div>
          
//           {showSubtitle && (
//             <p className={`text-muted font-medium mt-6 tracking-wide ${config.subtitle} ${subtitleClassName}`}>
//               <span className="text-primary">///</span> Sistema integral veterinario <span className="text-primary">///</span>
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Logo;

// src/components/Logo.tsx
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subtitleClassName?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'sm',
  showText = false,
  showSubtitle = false,
  className = '',
  iconClassName = '',
  textClassName = '',
  subtitleClassName = ''
}) => {
  const sizeConfig = {
    sm: {
      container: 'gap-2',
      circle: 'w-8 h-8',
      text: 'text-2xl',
      subtitle: 'text-xs',
      strokeWidth: '2'
    },
    md: {
      container: 'gap-3',
      circle: 'w-12 h-12',
      text: 'text-4xl',
      subtitle: 'text-sm',
      strokeWidth: '2.5'
    },
    lg: {
      container: 'gap-4',
      circle: 'w-16 h-16',
      text: 'text-5xl',
      subtitle: 'text-base',
      strokeWidth: '3'
    },
    xl: {
      container: 'gap-5',
      circle: 'w-20 h-20',
      text: 'text-6xl',
      subtitle: 'text-lg',
      strokeWidth: '3.5'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex flex-col items-center ${config.container} ${className}`}>
      <div className={`relative ${config.circle} ${iconClassName} mx-auto`}>
        <svg
          viewBox="0 0 48 48"
          className="w-full h-full text-primary logo-glow"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            className="animate-neon-pulse"
          />
          <line
            x1="8"
            y1="8"
            x2="40"
            y2="40"
            stroke="currentColor"
            strokeWidth={config.strokeWidth}
            strokeDasharray="4 4"
            className="animate-pulse-soft"
          />
          <circle
            cx="12"
            cy="12"
            r="1.5"
            fill="currentColor"
            className="animate-neon-pulse"
          />
          <circle
            cx="36"
            cy="36"
            r="1.5"
            fill="currentColor"
            className="animate-neon-pulse"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <h1 className={`font-black text-primary tracking-tight animate-neon-pulse ${config.text} ${textClassName}`}>
              BioVetTrack
            </h1>
            <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 text-primary/60 text-2xl font-thin">{'['}</div>
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 text-primary/60 text-2xl font-thin">{']'}</div>
          </div>
          <div className="w-32 h-1 bg-primary rounded-full shadow-neon animate-pulse-soft mt-2"></div>
          {showSubtitle && (
            <p className={`text-muted font-medium mt-6 tracking-wide ${config.subtitle} ${subtitleClassName}`}>
              <span className="text-primary">///</span> Sistema integral veterinario <span className="text-primary">///</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;