import { supabase } from "@/integrations/supabase/client";

export async function fetchConversationsForUser(userId: string) {
  if (!userId) return [];

  try {
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("id, user1_id, user2_id, status")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq("status", "accepted");

    if (matchError) throw matchError;
    if (!matches || matches.length === 0) return [];

    const { data: convos, error: convoError } = await supabase
      .from("conversations")
      .select("*")
      .in("match_id", matches.map((m: any) => m.id));

    if (convoError) throw convoError;

    const otherUserIds = matches.map((m: any) => (m.user1_id === userId ? m.user2_id : m.user1_id));

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url, college")
      .in("user_id", otherUserIds);

    if (profileError) throw profileError;

    const conversationsWithDetails: any[] = [];

    for (const convo of convos || []) {
      const match = matches.find((m: any) => m.id === convo.match_id);
      if (!match) continue;

      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      const otherProfile = profiles?.find((p: any) => p.user_id === otherUserId);

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at, sender_id, is_read")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", convo.id)
        .eq("is_read", false)
        .neq("sender_id", userId);

      conversationsWithDetails.push({
        id: convo.id,
        match_id: convo.match_id,
        created_at: convo.created_at,
        other_user: {
          id: otherUserId,
          name: otherProfile?.name || null,
          avatar_url: otherProfile?.avatar_url || null,
          college: otherProfile?.college || null,
        },
        last_message: lastMsg || null,
        unread_count: unreadCount || 0,
      });
    }

    conversationsWithDetails.sort((a, b) => {
      const aTime = a.last_message?.created_at || a.created_at;
      const bTime = b.last_message?.created_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return conversationsWithDetails;
  } catch (error) {
    console.error("supabaseService.fetchConversationsForUser:", error);
    return [];
  }
}

export async function fetchMessagesForConversation(conversationId: string) {
  if (!conversationId) return [];
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("supabaseService.fetchMessagesForConversation:", error);
    return [];
  }
}

export async function markMessagesRead(conversationId: string, userId: string) {
  if (!conversationId || !userId) return;
  try {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);
  } catch (error) {
    console.error("supabaseService.markMessagesRead:", error);
  }
}

export async function sendMessageToConversation(conversationId: string, userId: string, content: string) {
  if (!conversationId || !userId || !content) return false;
  try {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("supabaseService.sendMessageToConversation:", error);
    return false;
  }
}

export function createMessagesChannel(conversationId: string, onInsert: (payload: any) => void) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload)
    )
    .subscribe();

  return channel;
}

export function removeChannel(channel: any) {
  try {
    supabase.removeChannel(channel);
  } catch (error) {
    console.error("supabaseService.removeChannel:", error);
  }
}

export function createTypingChannel(conversationId: string, userId: string, onSync: (state: any) => void, onSubscribed?: (status: string) => void) {
  const channel = supabase.channel(`typing:${conversationId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();
    onSync(state);
  });

  if (onSubscribed) {
    channel.subscribe(async (status) => {
      onSubscribed(status);
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: userId, is_typing: false, timestamp: new Date().toISOString() });
      }
    });
  } else {
    channel.subscribe();
  }

  return channel;
}

export function trackTyping(channel: any, payload: { user_id: string; is_typing: boolean }) {
  if (!channel) return;
  try {
    channel.track({ ...payload, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("supabaseService.trackTyping:", error);
  }
}
