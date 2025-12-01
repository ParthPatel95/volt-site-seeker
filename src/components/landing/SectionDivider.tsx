
interface SectionDividerProps {
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'cyan';
}

export const SectionDivider = ({ color = 'blue' }: SectionDividerProps) => {
  const colorClasses = {
    blue: 'from-transparent via-watt-trust/20 to-transparent',
    green: 'from-transparent via-watt-success/20 to-transparent',
    yellow: 'from-transparent via-watt-bitcoin/20 to-transparent',
    purple: 'from-transparent via-watt-trust/20 to-transparent',
    cyan: 'from-transparent via-watt-trust/20 to-transparent'
  };

  return (
    <div className="relative my-4">
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} h-px`} />
    </div>
  );
};
