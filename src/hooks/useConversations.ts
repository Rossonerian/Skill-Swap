import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { fetchConversationsForUser } from "@/services/supabaseService";

export interface ConversationWithDetails {
  id: string;
  match_id: string;
  created_at: string;
  other_user: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    college: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
    is_read: boolean;
  } | null;
  unread_count: number;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const conversationsWithDetails = await fetchConversationsForUser(user.id);
      setConversations(conversationsWithDetails as ConversationWithDetails[]);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return { conversations, loading, refetch: fetchConversations };
}
