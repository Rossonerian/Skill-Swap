export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  college: string | null;
  branch: string | null;
  year: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  popularity_count: number;
  created_at: string;
}

export interface UserSkillOffered {
  id: string;
  user_id: string;
  skill_id: string;
  created_at: string;
  skill?: Skill;
}

export interface UserSkillWanted {
  id: string;
  user_id: string;
  skill_id: string;
  created_at: string;
  skill?: Skill;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  match_type: 'perfect' | 'strong' | 'good' | 'potential';
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface UserWithSkills extends Profile {
  skills_offered: Skill[];
  skills_wanted: Skill[];
  match_score?: number;
  match_type?: 'perfect' | 'strong' | 'good' | 'potential';
  match_reasons?: string[];
  match_mutual_skills?: string[];
  match_one_way_for_user?: string[];
  match_one_way_from_user?: string[];
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export type MatchType = 'perfect' | 'strong' | 'good' | 'potential';
