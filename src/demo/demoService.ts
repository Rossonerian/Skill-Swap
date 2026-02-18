import { demoConversations, demoMessages, demoUsers } from "./demoData";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const demoService = {
  async fetchConversations(userId: string) {
    await delay(400);

    return demoConversations
      .filter(
        (c) => c.user1_id === userId || c.user2_id === userId
      )
      .map((convo) => {
        const otherUserId =
          convo.user1_id === userId
            ? convo.user2_id
            : convo.user1_id;

        const otherUser = demoUsers.find(
          (u) => u.id === otherUserId
        );

        const convoMsgs = demoMessages.filter(
          (m) => m.conversation_id === convo.id
        );

        const lastMsg = convoMsgs[convoMsgs.length - 1] || null;

        return {
          id: convo.id,
          match_id: convo.match_id,
          created_at: convo.created_at,
          other_user: {
            id: otherUser?.id,
            name: otherUser?.name,
            avatar_url: otherUser?.avatar_url,
            college: otherUser?.college,
          },
          last_message: lastMsg,
          unread_count: 1,
        };
      });
  },

  async fetchMessages(conversationId: string) {
    await delay(200);
    return demoMessages.filter(
      (m) => m.conversation_id === conversationId
    );
  },

  async sendMessage(
    conversationId: string,
    userId: string,
    content: string
  ) {
    await delay(150);

    const newMessage = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    demoMessages.push(newMessage);

    return true;
  },
};
console.log("Demo conversations:", demoConversations);
console.log("Demo messages:", demoMessages);
