import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Fake loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // 🔥 Fake Conversations
  const conversations = [
    {
      id: "c1",
      other_user: {
        id: "u2",
        name: "Maya Sharma",
        college: "IIT Delhi",
        avatar_url: null,
      },
      unread_count: 2,
    },
    {
      id: "c2",
      other_user: {
        id: "u3",
        name: "Arjun Verma",
        college: "IIT Bombay",
        avatar_url: null,
      },
      unread_count: 0,
    },
  ];

  const [selectedConversation, setSelectedConversation] =
    useState(conversations[0]);

  const [messages, setMessages] = useState([
    {
      id: "m1",
      sender_id: "u2",
      content: "Hey! Ready to swap skills?",
      created_at: new Date().toISOString(),
    },
    {
      id: "m2",
      sender_id: "me",
      content: "Yes! I’d love to start with Python basics.",
      created_at: new Date().toISOString(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);
  };

  const handleBack = () => {
    setShowMobileChat(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return false;

    const newMessage = {
      id: crypto.randomUUID(),
      sender_id: "me",
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    // Fake typing delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender_id: selectedConversation.other_user.id,
          content:
            "That sounds great! Let’s schedule a session tomorrow 🚀",
          created_at: new Date().toISOString(),
        },
      ]);
      setIsTyping(false);
    }, 2500);

    return true;
  };

  const filteredConversations = conversations.filter((c) =>
    c.other_user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="pt-24 pb-24 md:pb-8">
          <div className="container mx-auto px-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </main>
      </div>
    );
  }

  if (conversations.length === 0) {
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold mb-6"
          >
            Messages
          </motion.h1>

          <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden h-[calc(100vh-200px)] shadow-sm">
            <div className="flex h-full">
              {/* Conversation List */}
              <div
                className={cn(
                  "w-full md:w-80 lg:w-96 border-r border-white/40 flex flex-col bg-white/20",
                  showMobileChat && "hidden md:flex"
                )}
              >
                <div className="p-4 border-b border-white/40">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(e.target.value)
                      }
                      className="pl-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <ConversationList
                    conversations={filteredConversations}
                    selectedId={selectedConversation?.id}
                    onSelect={handleSelectConversation}
                    currentUserId="me"
                  />
                </div>
              </div>

              {/* Chat Window */}
              <div
                className={cn(
                  "flex-1 flex flex-col bg-gradient-to-b from-white/10 to-white/5",
                  !showMobileChat && "hidden md:flex"
                )}
              >
                {selectedConversation ? (
                  <>
                    <ChatWindow
                      conversation={selectedConversation}
                      messages={messages}
                      currentUserId="me"
                      typingUsers={isTyping ? ["typing"] : []}
                      onSendMessage={handleSendMessage}
                      onTyping={() => {}}
                      onBack={handleBack}
                      loading={false}
                    />

                    {isTyping && (
                      <div className="px-4 py-2 text-sm italic text-muted-foreground">
                        {selectedConversation.other_user.name} is typing...
                      </div>
                    )}
                  </>
                ) : (
                  <ChatEmptyState type="select-conversation" />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
