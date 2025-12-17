import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  isSent: boolean;
}

export default function ChatMessage({
  message,
  senderName,
  senderAvatar,
  timestamp,
  isSent,
}: ChatMessageProps) {
  const initials = senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex gap-3 mb-4 ${isSent ? "flex-row-reverse" : "flex-row"}`}
      data-testid={`message-${isSent ? 'sent' : 'received'}`}
    >
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={senderAvatar} alt={senderName} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[70%]`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isSent
              ? "bg-primary text-primary-foreground"
              : "bg-card border"
          }`}
          data-testid="text-message-content"
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1" data-testid="text-timestamp">{timestamp}</span>
      </div>
    </div>
  );
}
