import { databases } from "@/integrations/appwrite/client";
import { Query, Client } from "appwrite";
import { default as client } from "@/integrations/appwrite/client";

// Database collection IDs (these should match your Appwrite setup)
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "main";
export const CONVERSATIONS_COLLECTION = "conversations";
export const MESSAGES_COLLECTION = "messages";
export const PROFILES_COLLECTION = "profiles";
export const MATCHES_COLLECTION = "matches";

export async function fetchConversationsForUser(userId: string) {
  if (!userId) return [];

  try {
    // Get all matches where user is involved
    const matches = await databases.listDocuments(
      DB_ID,
      MATCHES_COLLECTION,
      [
        Query.or([
          Query.equal("user1_id", userId),
          Query.equal("user2_id", userId),
        ]),
        Query.equal("status", "accepted"),
      ]
    );

    if (!matches.documents || matches.documents.length === 0) return [];

    const matchIds = matches.documents.map((m: any) => m.$id);

    // Get conversations for these matches
    const convos = await databases.listDocuments(
      DB_ID,
      CONVERSATIONS_COLLECTION,
      [Query.equal("match_id", matchIds)]
    );

    if (!convos.documents || convos.documents.length === 0) return [];

    const otherUserIds = matches.documents.map((m: any) =>
      m.user1_id === userId ? m.user2_id : m.user1_id
    );

    // Get profiles of other users
    const profiles = await databases.listDocuments(
      DB_ID,
      PROFILES_COLLECTION,
      [Query.equal("user_id", otherUserIds)]
    );

    const profileMap = (profiles.documents || []).reduce((acc: any, p: any) => {
      acc[p.user_id] = p;
      return acc;
    }, {});

    const conversationsWithDetails: any[] = [];

    for (const convo of convos.documents) {
      const match = matches.documents.find((m: any) => m.$id === convo.match_id);
      if (!match) continue;

      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      const otherProfile = profileMap[otherUserId];

      // Get last message
      const messages = await databases.listDocuments(
        DB_ID,
        MESSAGES_COLLECTION,
        [
          Query.equal("conversation_id", convo.$id),
          Query.orderDesc("created_at"),
          Query.limit(1),
        ]
      );

      const lastMsg = messages.documents?.[0] || null;

      // Get unread count
      const unreadMessages = await databases.listDocuments(
        DB_ID,
        MESSAGES_COLLECTION,
        [
          Query.equal("conversation_id", convo.$id),
          Query.equal("is_read", false),
          Query.notEqual("sender_id", userId),
        ]
      );

      conversationsWithDetails.push({
        id: convo.$id,
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
        unread_count: unreadMessages.total || 0,
      });
    }

    // Sort by last message time
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
    const response = await databases.listDocuments(
      DB_ID,
      MESSAGES_COLLECTION,
      [
        Query.equal("conversation_id", conversationId),
        Query.orderAsc("created_at"),
      ]
    );

    return (response.documents || []).map((doc: any) => ({
      id: doc.$id,
      ...doc,
    }));
  } catch (error) {
    console.error("appwriteService.fetchMessagesForConversation:", error);
    return [];
  }
}

export async function markMessagesRead(conversationId: string, userId: string) {
  if (!conversationId || !userId) return;
  try {
    const messages = await databases.listDocuments(
      DB_ID,
      MESSAGES_COLLECTION,
      [
        Query.equal("conversation_id", conversationId),
        Query.equal("is_read", false),
        Query.notEqual("sender_id", userId),
      ]
    );

    for (const msg of messages.documents) {
      await databases.updateDocument(
        DB_ID,
        MESSAGES_COLLECTION,
        msg.$id,
        { is_read: true }
      );
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
    await databases.createDocument(
      DB_ID,
      MESSAGES_COLLECTION,
      "unique()",
      {
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      }
    );

    return true;
  } catch (error) {
    console.error("appwriteService.sendMessageToConversation:", error);
    return false;
  }
}

export function createMessagesChannel(
  conversationId: string,
  onInsert: (payload: any) => void
) {
  // Subscribe to database realtime updates for messages collection
  const unsubscribe = client.subscribe(
    [`databases.${DB_ID}.collections.${MESSAGES_COLLECTION}.documents`],
    (response: any) => {
      // Emit events for message inserts in this conversation
      if (response.events.some((e: string) => e.includes(".create"))) {
        const payload = response.payload;
        if (payload && payload.conversation_id === conversationId) {
          onInsert(payload);
        }
      }
    }
  );

  return unsubscribe as unknown as string;
}

export function removeChannel(subscription: string) {
  try {
    // Appwrite client unsubscribe
    client.unsubscribe(subscription);
  } catch (error) {
    console.error("appwriteService.removeChannel:", error);
  }
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
