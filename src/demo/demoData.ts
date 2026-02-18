export interface DemoUser {
  id: string;
  name: string;
  college: string;
  avatar_url: string;
}

export interface DemoConversation {
  id: string;
  match_id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

export interface DemoMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const demoUsers: DemoUser[] = [
  {
    id: "demo-user-1",
    name: "Alex Johnson",
    college: "IIT Delhi",
    avatar_url: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "demo-user-2",
    name: "Maya Sharma",
    college: "IIT Delhi",
    avatar_url: "https://i.pravatar.cc/150?img=5",
  },
];

export const demoConversations: DemoConversation[] = [
  {
    id: "demo-convo-1",
    match_id: "demo-match-1",
    user1_id: "demo-user-1",
    user2_id: "demo-user-2",
    created_at: new Date().toISOString(),
  },
];

export let demoMessages: DemoMessage[] = [
  {
    id: "msg-1",
    conversation_id: "demo-convo-1",
    sender_id: "demo-user-2",
    content: "Hey! I can help you with Python basics.",
    created_at: new Date().toISOString(),
    is_read: false,
  },
  {
    id: "msg-2",
    conversation_id: "demo-convo-1",
    sender_id: "demo-user-1",
    content: "That’s great! I can teach you React in return.",
    created_at: new Date().toISOString(),
    is_read: true,
  },
];
