import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useConversations, ConversationWithDetails } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const { conversations, loading: conversationsLoading, refetch } = useConversations();
  const { messages, loading: messagesLoading, sendMessage } = useMessages(
    selectedConversation?.id || null
  );
  const { typingUsers, handleTyping } = useTypingIndicator(
    selectedConversation?.id || null
  );

  // Handle auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Handle URL params for conversation selection
  useEffect(() => {
    const conversationId = searchParams.get("id");
    if (conversationId && conversations.length > 0) {
      const found = conversations.find((c) => c.id === conversationId);
      if (found) {
        setSelectedConversation(found);
        setShowMobileChat(true);
      }
    }
  }, [searchParams, conversations]);

  const handleSelectConversation = (conversation: ConversationWithDetails) => {
    setSelectedConversation(conversation);
    setSearchParams({ id: conversation.id });
    setShowMobileChat(true);
  };

  const handleBack = () => {
    setShowMobileChat(false);
    setSearchParams({});
  };

  const handleSendMessage = async (content: string) => {
    const success = await sendMessage(content);
    if (success) {
      refetch(); // Refresh conversation list to update last message
    }
    return success;
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.other_user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.other_user.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || conversationsLoading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="pt-24 pb-24 md:pb-8">
          <div className="container mx-auto px-4">
            <div className="h-8 w-32 skeleton rounded-lg mb-6" />
            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-4 h-[calc(100vh-180px)]">
              <div className="space-y-4">
                <div className="h-10 skeleton rounded-xl" />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // No conversations state
  if (conversations.length === 0) {
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
            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl h-[calc(100vh-200px)]">
              <ChatEmptyState type="no-conversations" />
            </div>
          </div>
        </main>
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

          <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden h-[calc(100vh-200px)] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-full">
              {/* Conversation List */}
              <div
                className={cn(
                  "w-full md:w-80 lg:w-96 border-r border-white/40 flex flex-col bg-white/20",
                  showMobileChat && "hidden md:flex"
                )}
              >
                {/* Search */}
                <div className="p-4 border-b border-white/40">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 rounded-xl bg-white/40 border-white/60 hover:border-white/80"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-3">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">No conversations found</p>
                    </div>
                  ) : (
                    <ConversationList
                      conversations={filteredConversations}
                      selectedId={selectedConversation?.id || null}
                      onSelect={handleSelectConversation}
                      currentUserId={user!.id}
                    />
                  )}
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
                  <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    currentUserId={user!.id}
                    typingUsers={typingUsers}
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    onBack={handleBack}
                    loading={messagesLoading}
                  />
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
