import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Star } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Chat() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentUserId = user?.id;

  const conversations =
    currentUserId === "alex-id"
      ? [
          {
            id: "c1",
            other_user: {
              id: "maya-id",
              name: "Maya Sharma",
              college: "IIT Delhi",
              avatar_url: null,
            },
            unread_count: 1,
          },
        ]
      : [
          {
            id: "c2",
            other_user: {
              id: "alex-id",
              name: "Alex Johnson",
              college: "IIT Delhi",
              avatar_url: null,
            },
            unread_count: 0,
          },
        ];

  const [selectedConversation, setSelectedConversation] =
    useState(conversations[0]);

  const initialMessages =
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

  const [messages, setMessages] = useState(initialMessages);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return false;

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
      return "Awesome! I’ll begin with basic syntax and loops.";
    if (lower.includes("when"))
      return "How about this weekend?";
    if (lower.includes("time"))
      return "Evenings work best for me.";

    return "That sounds great! Looking forward to our skill swap 🚀";
  }

  const handleSubmitFeedback = () => {
    if (!rating) return;
    setFeedbackSubmitted(true);

    setTimeout(() => {
      setShowFeedbackModal(false);
      setRating(0);
      setFeedbackText("");
      setFeedbackSubmitted(false);
    }, 2000);
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
        <SkeletonCard />
      </div>
    );
  }

  if (!conversations.length) {
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
                  currentUserId={currentUserId!}
                />
              </div>

              <div className="flex-1 flex flex-col">
                {/* FEEDBACK BUTTON */}
                <div className="p-4 border-b flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFeedbackModal(true)}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Leave Feedback
                  </Button>
                </div>

                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  currentUserId={currentUserId!}
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

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-[90%] max-w-md shadow-xl"
          >
            {feedbackSubmitted ? (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-2">
                  Thank you for your feedback!
                </h2>
                <p className="text-muted-foreground">
                  Your experience helps improve SkillSwap 🚀
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">
                  Rate your experience
                </h2>

                <div className="flex gap-2 mb-4 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-7 h-7 cursor-pointer ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <textarea
                  placeholder="Write your feedback..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full border rounded-xl p-3 text-sm mb-4"
                  rows={3}
                />

                <Button
                  className="w-full"
                  disabled={!rating}
                  onClick={handleSubmitFeedback}
                >
                  Submit Feedback
                </Button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
