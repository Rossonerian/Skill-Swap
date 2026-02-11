import {
  readMatches,
  readConversations,
  readMessages,
  writeMessages,
  writeConversations,
  listProfilesByUserIds,
  generateId,
  ensureConversationForMatch,
} from "@/services/localDb";

// Dummy IDs kept for backwards compatibility with other imports
export const DB_ID = "local-json-db";
export const CONVERSATIONS_COLLECTION = "conversations";
export const MESSAGES_COLLECTION = "messages";
export const PROFILES_COLLECTION = "profiles";
export const MATCHES_COLLECTION = "matches";

export async function fetchConversationsForUser(userId: string) {
  if (!userId) return [];

  try {
    const matches = readMatches().filter(
      (m) => (m.user1_id === userId || m.user2_id === userId) && m.status === "accepted",
    );
    if (!matches.length) return [];

    const conversations = readConversations();
    const messages = readMessages();

    const matchIds = new Set(matches.map((m) => m.id));
    const convosForUser = conversations.filter((c) => matchIds.has(c.match_id));

    const otherUserIds = matches.map((m) =>
      m.user1_id === userId ? m.user2_id : m.user1_id,
    );
    const profiles = listProfilesByUserIds(otherUserIds);
    const profileMap = (profiles || []).reduce((acc: any, p: any) => {
      acc[p.user_id] = p;
      return acc;
    }, {});

    const conversationsWithDetails = convosForUser.map((convo) => {
      const match = matches.find((m) => m.id === convo.match_id);
      if (!match) return null;

      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      const otherProfile = profileMap[otherUserId];

      const convoMessages = messages
        .filter((m) => m.conversation_id === convo.id)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

      const lastMsg = convoMessages[convoMessages.length - 1] || null;
      const unreadCount = convoMessages.filter(
        (m) => !m.is_read && m.sender_id !== userId,
      ).length;

      return {
        id: convo.id,
        match_id: convo.match_id,
        created_at: convo.created_at,
        other_user: {
          id: otherUserId,
          name: otherProfile?.name || null,
          avatar_url: otherProfile?.avatar_url || null,
          college: otherProfile?.college || null,
        },
        last_message: lastMsg
          ? {
              content: lastMsg.content,
              created_at: lastMsg.created_at,
              sender_id: lastMsg.sender_id,
              is_read: lastMsg.is_read,
            }
          : null,
        unread_count: unreadCount,
      };
    }).filter(Boolean) as any[];

    conversationsWithDetails.sort((a, b) => {
      const aTime = a.last_message?.created_at || a.created_at;
      const bTime = b.last_message?.created_at || b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return conversationsWithDetails;
  } catch (error) {
    console.error("appwriteService.fetchConversationsForUser:", error);
    return [];
  }
}

export async function fetchMessagesForConversation(conversationId: string) {
  if (!conversationId) return [];
  try {
    const messages = readMessages()
      .filter((m) => m.conversation_id === conversationId)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );

    return messages.map((m) => ({ ...m }));
  } catch (error) {
    console.error("appwriteService.fetchMessagesForConversation:", error);
    return [];
  }
}

export async function markMessagesRead(conversationId: string, userId: string) {
  if (!conversationId || !userId) return;
  try {
    const messages = readMessages();
    let changed = false;
    for (const msg of messages) {
      if (
        msg.conversation_id === conversationId &&
        !msg.is_read &&
        msg.sender_id !== userId
      ) {
        msg.is_read = true;
        changed = true;
      }
    }
    if (changed) {
      writeMessages(messages);
    }
  } catch (error) {
    console.error("appwriteService.markMessagesRead:", error);
  }
}

export async function sendMessageToConversation(
  conversationId: string,
  userId: string,
  content: string
) {
  if (!conversationId || !userId || !content) return false;
  try {
    const messages = readMessages();
    messages.push({
      id: generateId("msg"),
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    });
    writeMessages(messages);

    return true;
  } catch (error) {
    console.error("appwriteService.sendMessageToConversation:", error);
    return false;
  }
}

export async function ensureConversationForMatchId(matchId: string) {
  return ensureConversationForMatch(matchId);
}

export function createMessagesChannel(
  conversationId: string,
  onInsert: (payload: any) => void
) {
  // Local JSON backend doesn't support realtime multi-user updates,
  // so we simply return a dummy subscription id. The caller will
  // refetch messages after sending.
  return `local-messages:${conversationId}`;
}

export function removeChannel(subscription: string) {
  // No-op for local backend
  void subscription;
}

export function createTypingChannel(
  conversationId: string,
  userId: string,
  onSync: (state: any) => void,
  onSubscribed?: (status: string) => void
) {
  // For typing indicators, we use a custom implementation
  // Subscribe to a typing collection or use a timeout-based approach
  if (onSubscribed) {
    onSubscribed("SUBSCRIBED");
  }

  // Return a dummy subscription string since Appwrite doesn't have built-in presence
  return `typing:${conversationId}:${userId}`;
}

export function trackTyping(
  subscription: string,
  payload: { user_id: string; is_typing: boolean }
) {
  if (!subscription) return;
  try {
    // Appwrite realtime doesn't support direct presence tracking
    // This would be implemented via a dedicated typing collection or WebSocket custom channel
    console.log("Tracking typing:", payload);
  } catch (error) {
    console.error("appwriteService.trackTyping:", error);
  }
}
