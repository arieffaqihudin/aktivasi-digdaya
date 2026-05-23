import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight text-foreground">Digdaya</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Portal Aktivasi
          </span>
        </div>
      )}
    </div>
  );
}
