
interface SectionDividerProps {
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'cyan';
}

export const SectionDivider = ({ color = 'blue' }: SectionDividerProps) => {
  const colorClasses = {
    blue: 'from-transparent via-electric-blue/20 to-transparent',
    green: 'from-transparent via-neon-green/20 to-transparent',
    yellow: 'from-transparent via-electric-yellow/20 to-transparent',
    purple: 'from-transparent via-purple-500/20 to-transparent',
    cyan: 'from-transparent via-cyan-400/20 to-transparent'
  };

  return (
    <div className="relative my-12">
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} h-px`} />
    </div>
  );
};
