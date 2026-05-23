import { cn } from "@/lib/utils";
import logoSrc from "@/assets/logo-digdaya.png";

export type LogoVariant =
  | "header"
  | "login"
  | "form"
  | "sidebar"
  | "sidebar-collapsed"
  | "mobile";

const variantClasses: Record<LogoVariant, string> = {
  header: "h-[32px] max-w-[150px]",
  login: "h-[42px] max-w-[190px]",
  form: "h-[34px] max-w-[160px]",
  sidebar: "h-[36px] max-w-[170px]",
  "sidebar-collapsed": "h-[28px] max-w-[40px]",
  mobile: "h-[28px] max-w-[130px]",
};

export function Logo({
  className,
  variant = "header",
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <img
        src={logoSrc}
        alt="Digdaya"
        className={cn(
          "block w-auto select-none object-contain",
          variantClasses[variant]
        )}
        draggable={false}
      />
    </div>
  );
}
