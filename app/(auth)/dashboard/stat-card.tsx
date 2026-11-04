import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  value: string;
  footer: React.ReactNode;
}

export function StatCard({
  title,
  icon: Icon,
  iconClassName,
  value,
  footer,
}: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/60 bg-[#e4f3fa] p-4 shadow-xs transition-all hover:shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <Icon className={`h-5 w-5 ${iconClassName ?? ""}`} />
      </div>
      <div className="my-2.5">
        <span className="text-3xl font-bold tracking-tight text-gray-900 tabular-nums">
          {value}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">{footer}</div>
    </div>
  );
}
