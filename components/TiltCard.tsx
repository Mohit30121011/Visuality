
import React, { useRef } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g., "bg-indigo-500"
  maxRotation?: number; // Maximum rotation in degrees
  scale?: number; // Scale factor on hover
}

export const TiltCard: React.FC<TiltCardProps> = ({ 
  children, 
  className = "", 
  glowColor = "bg-indigo-500",
  maxRotation = 5,
  scale = 1.02
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation
    const rotateX = ((y - centerY) / centerY) * -maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative transition-all duration-300 ease-out will-change-transform transform-gpu ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
        {/* Dynamic Glow Effect on Hover */}
        <div className={`absolute -inset-0.5 ${glowColor} rounded-[inherit] opacity-0 group-hover:opacity-20 blur-xl transition duration-500 group-hover:duration-200 pointer-events-none`} />
        
        {/* Content Container */}
        <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
          {children}
        </div>
    </div>
  );
};
