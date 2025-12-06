import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { LottieAnimation } from '@/components/ui/LottieAnimation';

interface MissionVisionCardProps {
  type: 'mission' | 'vision';
  title: string;
  description: string;
  lottieUrl: string;
}

const MissionVisionCard: React.FC<MissionVisionCardProps> = ({
  type,
  title,
  description,
  lottieUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
    });
  };

  const colors = type === 'mission'
    ? { bg: 'bg-watt-trust/10', text: 'text-watt-trust', glow: 'shadow-watt-trust/20' }
    : { bg: 'bg-watt-bitcoin/10', text: 'text-watt-bitcoin', glow: 'shadow-watt-bitcoin/20' };

  return (
    <div
      ref={cardRef}
      className="transition-transform duration-200 ease-out"
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <Card className={`p-8 bg-white border-gray-200 shadow-institutional hover:shadow-xl transition-all duration-300 relative overflow-hidden group ${isHovered ? 'shadow-lg' : ''}`}>
        {/* Background glow effect */}
        <div className={`absolute -top-20 -right-20 w-40 h-40 ${colors.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <div className={`p-3 ${colors.bg} rounded-lg relative overflow-hidden`}>
            <LottieAnimation
              src={lottieUrl}
              className="w-8 h-8"
              loop={true}
              playOnHover={true}
            />
          </div>
          <h2 className="text-2xl font-bold text-watt-navy">{title}</h2>
        </div>
        
        <p className="text-watt-navy/70 text-lg leading-relaxed relative z-10">
          {description}
        </p>

        {/* Animated underline on hover */}
        <div className={`absolute bottom-0 left-0 h-1 ${type === 'mission' ? 'bg-watt-trust' : 'bg-watt-bitcoin'} transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`} />
      </Card>
    </div>
  );
};

export const AnimatedMissionVision: React.FC = () => {
  return (
    <section className="relative py-16 md:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <MissionVisionCard
            type="mission"
            title="Our Mission"
            description="Turning power into profit through intelligent infrastructure investment. We identify and develop strategic power assets that serve the growing demands of AI, HPC, and Bitcoin mining operations."
            lottieUrl="https://assets8.lottiefiles.com/packages/lf20_zrqthn6o.json"
          />
          <MissionVisionCard
            type="vision"
            title="Our Vision"
            description="To be the leading digital infrastructure company powering the future of artificial intelligence, high-performance computing, and decentralized finance through strategic power asset development."
            lottieUrl="https://assets1.lottiefiles.com/packages/lf20_ne6kcqfz.json"
          />
        </div>
      </div>
    </section>
  );
};

export default AnimatedMissionVision;
