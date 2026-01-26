import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/types";
import {
  fetchMessagesForConversation,
  markMessagesRead,
  sendMessageToConversation,
  createMessagesChannel,
  removeChannel,
} from "@/services/supabaseService";

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchMessagesForConversation(conversationId);
      setMessages(data as Message[]);

      if (user) {
        await markMessagesRead(conversationId, user.id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!conversationId || !user || !content.trim()) return false;

    try {
      return await sendMessageToConversation(conversationId, user.id, content);
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    const channel = createMessagesChannel(conversationId, (payload) => {
      console.log("New message received:", payload);
      const newMessage = payload.new as Message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });

      if (user && newMessage.sender_id !== user.id) {
        supabase.from("messages").update({ is_read: true }).eq("id", newMessage.id);
      }
    });

    return () => {
      removeChannel(channel);
    };
  }, [conversationId, user, fetchMessages]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
