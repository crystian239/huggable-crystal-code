import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  isOnline: boolean;
  isTyping?: boolean;
  lastSeen?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function PresenceDot({ isOnline, size = "sm" }: { isOnline: boolean; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  return (
    <span
      className={`${sizeClass} rounded-full shrink-0 ${
        isOnline ? "bg-emerald-500 animate-pulse" : "bg-destructive/60"
      }`}
    />
  );
}

export function PresenceBadge({ isOnline, size = "sm" }: { isOnline: boolean; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const borderClass = "border-2 border-card";
  return (
    <span
      className={`absolute bottom-0 right-0 ${sizeClass} rounded-full ${borderClass} ${
        isOnline ? "bg-emerald-500" : "bg-destructive/60"
      }`}
    />
  );
}

export function PresenceLabel({ isOnline, isTyping, lastSeen, size = "sm" }: Props) {
  const textClass = size === "sm" ? "text-[11px]" : "text-xs";

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <PresenceDot isOnline size={size} />
        <span className={`${textClass} text-muted-foreground`}>
          {isTyping ? "Digitando..." : "Online"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <PresenceDot isOnline={false} size={size} />
      <span className={`${textClass} text-muted-foreground`}>
        {lastSeen
          ? `Visto ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true, locale: ptBR })}`
          : "Offline"}
      </span>
    </div>
  );
}
