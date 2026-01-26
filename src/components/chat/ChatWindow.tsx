import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { Send, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Message } from "@/types";
import { ConversationWithDetails } from "@/hooks/useConversations";
import { cn } from "@/lib/utils";

interface ChatWindowProps {
  conversation: ConversationWithDetails;
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
  onSendMessage: (content: string) => Promise<boolean>;
  onTyping: () => void;
  onBack?: () => void;
  loading?: boolean;
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  typingUsers,
  onSendMessage,
  onTyping,
  onBack,
  loading,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    setSending(true);
    const success = await onSendMessage(inputValue);
    if (success) {
      setInputValue("");
    }
    setSending(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onTyping();
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    }
    return format(date, "MMM d, h:mm a");
  };

  const initials = conversation.other_user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const isOtherUserTyping = typingUsers.includes(conversation.other_user.id);

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages.forEach((message) => {
    const messageDate = format(new Date(message.created_at), "yyyy-MM-dd");
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [message] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/40 bg-white/20 backdrop-blur-sm">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <Avatar className="w-10 h-10 border-2 border-primary/20">
          <AvatarImage src={conversation.other_user.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-display text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold truncate">
            {conversation.other_user.name || "Anonymous"}
          </h3>
          {conversation.other_user.college && (
            <p className="text-xs text-muted-foreground truncate">
              {conversation.other_user.college}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20" />
              <span className="text-sm text-muted-foreground">Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={conversation.other_user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <h4 className="font-display font-bold text-lg mb-1">
              Say hello! 👋
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs">
              Start a conversation with {conversation.other_user.name || "your match"} and begin your skill swap journey!
            </p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 rounded-full bg-white/20 border border-white/40 text-xs text-muted-foreground font-medium">
                    {formatDateHeader(group.date)}
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {group.messages.map((message) => {
                    const isOwn = message.sender_id === currentUserId;
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "flex mb-3",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm",
                            isOwn
                              ? "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground rounded-br-md"
                              : "bg-white/30 border border-white/60 rounded-bl-md text-foreground"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ))}
          </>
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {isOtherUserTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-2"
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={conversation.other_user.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="bg-white/30 border border-white/60 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  />
                  <motion.span
                    className="w-2 h-2 rounded-full bg-muted-foreground/50"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/40 bg-white/20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 rounded-xl bg-white/40 border-white/60 hover:border-white/80"
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || sending}
            className="rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
