import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationWithDetails } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedId: string | null;
  onSelect: (conversation: ConversationWithDetails) => void;
  currentUserId: string;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      {conversations.map((conversation, index) => {
        const isSelected = selectedId === conversation.id;
        const initials = conversation.other_user.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "??";

        const isOwnMessage = conversation.last_message?.sender_id === currentUserId;

        return (
          <motion.button
            key={conversation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(conversation)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left",
              isSelected
                ? "bg-white/40 border border-white/80 shadow-sm"
                : "bg-white/10 border border-transparent hover:bg-white/20 hover:border-white/40"
            )}
          >
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-background">
                <AvatarImage src={conversation.other_user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-display text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {conversation.unread_count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    "font-semibold truncate",
                    conversation.unread_count > 0 && "text-foreground"
                  )}
                >
                  {conversation.other_user.name || "Anonymous"}
                </h4>
                {conversation.last_message && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                      addSuffix: false,
                    })}
                  </span>
                )}
              </div>

              {conversation.last_message ? (
                <p
                  className={cn(
                    "text-sm truncate",
                    conversation.unread_count > 0
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {isOwnMessage && <span className="text-muted-foreground">You: </span>}
                  {conversation.last_message.content}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No messages yet</p>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
