import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { buildWhatsAppUrl, waMessageForTicket } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface Props {
  phone?: string | null;
  ticketId?: string;
  message?: string;
  label?: string;
  iconOnly?: boolean;
  variant?: "outline" | "solid";
  size?: "sm" | "default";
  className?: string;
}

export function WhatsAppButton({
  phone,
  ticketId,
  message,
  label = "WhatsApp",
  iconOnly = false,
  variant = "outline",
  size = "sm",
  className,
}: Props) {
  const text = message ?? (ticketId ? waMessageForTicket(ticketId) : undefined);
  const url = buildWhatsAppUrl(phone, text);

  const greenOutline =
    "border-[oklch(0.72_0.16_152)] text-[oklch(0.38_0.14_152)] hover:bg-[oklch(0.95_0.06_152)] hover:text-[oklch(0.32_0.14_152)]";
  const greenSolid =
    "bg-[oklch(0.62_0.16_152)] text-white hover:bg-[oklch(0.56_0.16_152)]";

  if (!url) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("inline-flex", className)}>
              <Button
                type="button"
                size={size}
                variant="outline"
                disabled
                aria-label="Nomor WhatsApp tidak tersedia"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageCircle className={cn("h-4 w-4", !iconOnly && "mr-1.5")} />
                {!iconOnly && label}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Nomor WhatsApp tidak tersedia</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      asChild
      type="button"
      size={size}
      variant="outline"
      className={cn(variant === "solid" ? greenSolid : greenOutline, className)}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label={ticketId ? `Hubungi WhatsApp untuk ${ticketId}` : "Hubungi via WhatsApp"}
      >
        <MessageCircle className={cn("h-4 w-4", !iconOnly && "mr-1.5")} />
        {!iconOnly && label}
      </a>
    </Button>
  );
}
