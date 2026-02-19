import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const currentUserId = user?.id;

  // 🚀 Reset conversations & messages when user changes
  useEffect(() => {
    if (!currentUserId) return;

    const convo =
      currentUserId === "alex-id"
        ? {
            id: "c1",
            other_user: {
              id: "maya-id",
              name: "Maya Sharma",
              college: "IIT Delhi",
              avatar_url: null,
            },
            unread_count: 1,
          }
        : {
            id: "c2",
            other_user: {
              id: "alex-id",
              name: "Alex Johnson",
              college: "IIT Delhi",
              avatar_url: null,
            },
            unread_count: 0,
          };

    setSelectedConversation(convo);

    const initial =
      currentUserId === "alex-id"
        ? [
            {
              id: "m1",
              sender_id: "maya-id",
              content: "Hey Alex! Ready to learn React?",
              created_at: new Date().toISOString(),
            },
          ]
        : [
            {
              id: "m2",
              sender_id: "alex-id",
              content: "Hi Maya! Excited to start Python!",
              created_at: new Date().toISOString(),
            },
          ];

    setMessages(initial);
  }, [currentUserId]);

  if (!currentUserId) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <ChatEmptyState type="no-conversations" />
      </div>
    );
  }

  const conversations = selectedConversation ? [selectedConversation] : [];

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !selectedConversation) return false;

    const newMessage = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender_id: selectedConversation.other_user.id,
          content: generateAIReply(content),
          created_at: new Date().toISOString(),
        },
      ]);
      setIsTyping(false);
    }, 2000);

    return true;
  };

  function generateAIReply(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes("react"))
      return "Perfect! Let’s start with components and hooks tomorrow.";
    if (lower.includes("python"))
      return "Awesome! I’ll begin with syntax and loops first.";
    if (lower.includes("when"))
      return "How about this weekend?";
    if (lower.includes("time"))
      return "Evenings work best for me.";

    return "That sounds great! Looking forward to our skill swap 🚀";
  }

  const filteredConversations = conversations.filter((c) =>
    c.other_user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <SkeletonCard />
      </div>
    );
  }

  if (!filteredConversations.length) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <ChatEmptyState type="no-conversations" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <main className="pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-3xl font-bold mb-6"
          >
            Messages
          </motion.h1>

          <div className="bg-white/40 backdrop-blur-md border rounded-2xl h-[calc(100vh-200px)]">
            <div className="flex h-full">
              <div
                className={cn(
                  "w-full md:w-80 border-r flex flex-col",
                  showMobileChat && "hidden md:flex"
                )}
              >
                <div className="p-4">
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <ConversationList
                  conversations={filteredConversations}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  currentUserId={currentUserId}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  currentUserId={currentUserId}
                  typingUsers={isTyping ? ["typing"] : []}
                  onSendMessage={handleSendMessage}
                  onTyping={() => {}}
                  onBack={() => setShowMobileChat(false)}
                  loading={false}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
