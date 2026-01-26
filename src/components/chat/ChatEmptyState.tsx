import { motion } from "framer-motion";
import { MessageCircle, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ChatEmptyStateProps {
  type: "no-conversations" | "select-conversation";
}

export function ChatEmptyState({ type }: ChatEmptyStateProps) {
  const navigate = useNavigate();

  if (type === "no-conversations") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full p-8 text-center"
      >
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-primary" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 text-accent-foreground" />
          </motion.div>
        </div>

        <h2 className="font-display text-2xl font-bold mb-2">No conversations yet</h2>
        <p className="text-muted-foreground max-w-sm mb-8">
          Start by finding skill matches and connecting with other students. Once you match,
          you can start chatting!
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="hero" onClick={() => navigate("/browse")}>
            <Users className="w-4 h-4 mr-2" />
            Find Matches
          </Button>
          <Button variant="outline" onClick={() => navigate("/matches")}>
            <Sparkles className="w-4 h-4 mr-2" />
            View Matches
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hidden md:flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-white/5 to-white/0"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
        <MessageCircle className="w-10 h-10 text-primary" />
      </div>

      <h3 className="font-display text-xl font-bold mb-2">Select a conversation</h3>
      <p className="text-muted-foreground max-w-xs">
        Choose a conversation from the list to start chatting with your skill swap partner
      </p>
    </motion.div>
  );
}
