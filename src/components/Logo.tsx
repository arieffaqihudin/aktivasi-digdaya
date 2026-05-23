import { cn } from "@/lib/utils";
import logoSrc from "@/assets/logo-digdaya.png";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src={logoSrc}
        alt="Digdaya"
        className={cn(
          "h-auto select-none object-contain",
          compact ? "w-[48px]" : "w-[140px]"
        )}
        draggable={false}
      />
    </div>
  );
}
