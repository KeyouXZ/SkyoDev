export function Spinner({ size = 'md', color = '#00a2be' }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const sizeClasses = size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-8 h-8' : 'w-12 h-12';
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses}`}
      style={{ borderColor: `${color} transparent ${color} ${color}` }}
    />
  );
}
