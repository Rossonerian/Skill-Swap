import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createTypingChannel, trackTyping, removeChannel } from "@/services/supabaseService";

export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId || !user || !channelRef.current) return;
      try {
        trackTyping(channelRef.current, { user_id: user.id, is_typing: isTyping });
      } catch (error) {
        console.error("Error setting typing status:", error);
      }
    },
    [conversationId, user]
  );

  const handleTyping = useCallback(() => {
    setTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  }, [setTyping]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = createTypingChannel(
      conversationId,
      user.id,
      (state) => {
        const typing: string[] = [];
        Object.entries(state).forEach(([key, presences]) => {
          if (key !== user.id && Array.isArray(presences)) {
            const presence = (presences as any)[0] as { user_id: string; is_typing: boolean };
            if (presence?.is_typing && presence?.user_id) {
              typing.push(presence.user_id);
            }
          }
        });
        setTypingUsers(typing);
      },
      undefined
    );

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      removeChannel(channel);
    };
  }, [conversationId, user]);

  return { typingUsers, handleTyping };
}
