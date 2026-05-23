import { cn } from "@/lib/utils";

export function Logo({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  const text = variant === "light" ? "text-white" : "text-primary-dark";
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6l-8-4Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("text-sm font-bold tracking-tight", text)}>Digdaya</span>
        <span className={cn("text-[10px] font-medium uppercase tracking-wider", variant === "light" ? "text-white/70" : "text-muted-foreground")}>
          Portal Aktivasi
        </span>
      </div>
    </div>
  );
}
