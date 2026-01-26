import { supabase } from "@/integrations/supabase/client";
import { Skill, Profile } from "@/types";

/**
 * Normalize skill names for comparison
 * Handles common aliases like:
 * - UI ↔ User Interface
 * - UX ↔ User Experience
 * - ReactJS ↔ React
 * - TypeScript ↔ TS
 * - JavaScript ↔ JS
 * Case-insensitive, trimmed, punctuation removed
 */
export function normalizeSkillName(name: string): string {
  if (!name) return "";
  
  // Define skill aliases (normalized -> list of aliases)
  const aliasMap: Record<string, string[]> = {
    "ui": ["ui", "user interface", "u.i", "ui design"],
    "ux": ["ux", "user experience", "u.x", "ux design"],
    "react": ["react", "reactjs", "react.js"],
    "typescript": ["typescript", "ts", "typescripts"],
    "javascript": ["javascript", "js", "node.js", "nodejs"],
    "nodejs": ["nodejs", "node.js", "node"],
    "python": ["python", "py"],
    "java": ["java", "javax"],
    "csharp": ["c#", "csharp", "c-sharp"],
    "cpp": ["c++", "cpp"],
    "machine learning": ["machine learning", "ml", "deep learning"],
    "artificial intelligence": ["artificial intelligence", "ai", "ai/ml"],
    "graphic design": ["graphic design", "graphics"],
    "video editing": ["video editing", "video"],
    "public speaking": ["public speaking", "speaking"],
    "data analysis": ["data analysis", "analytics", "data analytics"],
    "content writing": ["content writing", "writing", "copywriting"],
    "digital marketing": ["digital marketing", "marketing"],
    "fitness training": ["fitness training", "fitness", "gym"],
    "guitar": ["guitar", "guitars"],
    "piano": ["piano", "keyboards"],
    "photography": ["photography", "photo"],
  };
  
  let normalized = name
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:\-_&]/g, " ") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
  
  // Check if it matches any alias
  for (const [canonical, aliases] of Object.entries(aliasMap)) {
    if (aliases.includes(normalized)) {
      return canonical;
    }
  }
  
  return normalized;
}

interface MatchDetail {
  skill: Skill;
  normalizedName: string;
  direction: "teaches" | "wants";
}

/**
 * Find complementary matches between two users
 * Returns number of mutual matches and detailed breakdown
 */
export function findComplementaryMatches(
  userATeaches: MatchDetail[],
  userAWants: MatchDetail[],
  userBTeaches: MatchDetail[],
  userBWants: MatchDetail[]
): {
  mutualCount: number;
  userATeachesUserBWants: MatchDetail[];
  userBTeachesUserAWants: MatchDetail[];
} {
  const mutualCount: number[] = [];
  const userATeachesUserBWants: MatchDetail[] = [];
  const userBTeachesUserAWants: MatchDetail[] = [];

  // Check what A teaches that B wants
  for (const taught of userATeaches) {
    for (const wanted of userBWants) {
      if (taught.normalizedName === wanted.normalizedName) {
        userATeachesUserBWants.push(taught);
      }
    }
  }

  // Check what B teaches that A wants
  for (const taught of userBTeaches) {
    for (const wanted of userAWants) {
      if (taught.normalizedName === wanted.normalizedName) {
        userBTeachesUserAWants.push(taught);
      }
    }
  }

  // Mutual match = both directions exist
  for (const aTeaches of userATeachesUserBWants) {
    for (const bTeaches of userBTeachesUserAWants) {
      if (aTeaches.normalizedName === bTeaches.normalizedName) {
        mutualCount.push(1);
      }
    }
  }

  return {
    mutualCount: mutualCount.length,
    userATeachesUserBWants,
    userBTeachesUserAWants,
  };
}

interface MatchScore {
  score: number;
  reasons: string[];
  mutualSkills: string[];
  oneWaySkillsForUser: string[];
  oneWaySkillsFromUser: string[];
}

/**
 * Calculate match score between two users
 * Scoring rules:
 * - Mutual skill match (A teaches, B wants AND B teaches, A wants) = 30 points each
 * - One-way match (A teaches what B wants OR B teaches what A wants) = 10 points each
 * - Same college = 10 points
 * - Same year = 5 points
 * - Same branch = 5 points
 * Max score: 100
 */
export function calculateMatchScore(
  currentUserTeaches: MatchDetail[],
  currentUserWants: MatchDetail[],
  otherUserTeaches: MatchDetail[],
  otherUserWants: MatchDetail[],
  currentUser: Profile,
  otherUser: Profile
): MatchScore {
  let score = 0;
  const reasons: string[] = [];
  const mutualSkills: string[] = [];
  const oneWaySkillsForUser: string[] = [];
  const oneWaySkillsFromUser: string[] = [];

  // Find complementary matches
  const matches = findComplementaryMatches(
    currentUserTeaches,
    currentUserWants,
    otherUserTeaches,
    otherUserWants
  );

  // Mutual matches (both can teach & learn from each other)
  const seenMutual = new Set<string>();
  for (const skillA of matches.userATeachesUserBWants) {
    for (const skillB of matches.userBTeachesUserAWants) {
      if (
        skillA.normalizedName === skillB.normalizedName &&
        !seenMutual.has(skillA.normalizedName)
      ) {
        seenMutual.add(skillA.normalizedName);
        score += 30;
        mutualSkills.push(skillA.skill.name);
        reasons.push(`Mutual: Both teach and learn ${skillA.skill.name}`);
      }
    }
  }

  // One-way matches (current user teaches what other user wants)
  for (const skill of matches.userATeachesUserBWants) {
    if (!seenMutual.has(skill.normalizedName)) {
      score += 10;
      oneWaySkillsForUser.push(skill.skill.name);
      reasons.push(
        `You teach ${skill.skill.name} which they want to learn`
      );
    }
  }

  // One-way matches (other user teaches what current user wants)
  for (const skill of matches.userBTeachesUserAWants) {
    if (!seenMutual.has(skill.normalizedName)) {
      score += 10;
      oneWaySkillsFromUser.push(skill.skill.name);
      reasons.push(
        `They teach ${skill.skill.name} which you want to learn`
      );
    }
  }

  // College bonus
  if (
    currentUser.college &&
    otherUser.college &&
    currentUser.college.toLowerCase() === otherUser.college.toLowerCase()
  ) {
    score += 10;
    reasons.push("Same college");
  }

  // Year bonus
  if (currentUser.year && otherUser.year && currentUser.year === otherUser.year) {
    score += 5;
    reasons.push("Same year");
  }

  // Branch bonus
  if (
    currentUser.branch &&
    otherUser.branch &&
    currentUser.branch.toLowerCase() === otherUser.branch.toLowerCase()
  ) {
    score += 5;
    reasons.push("Same branch");
  }

  // Cap at 100
  score = Math.min(score, 100);

  return {
    score,
    reasons,
    mutualSkills,
    oneWaySkillsForUser,
    oneWaySkillsFromUser,
  };
}

/**
 * Generate matches for a user
 * Compares user against all other users and creates match records
 * with scores and reasons. Prevents duplicates via upsert logic.
 */
export async function generateMatchesForUser(userId: string): Promise<number> {
  if (!userId) return 0;

  try {
    // Get current user's profile and skills
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("matchService.generateMatchesForUser: fetch profile error:", profileError);
      return 0;
    }

    if (!currentProfile) {
      console.warn("matchService.generateMatchesForUser: no profile found");
      return 0;
    }

    // Get user's offered skills
    const { data: offeredData, error: offeredError } = await supabase
      .from("user_skills_offered")
      .select("skill:skills(*)")
      .eq("user_id", userId);

    if (offeredError) {
      console.error("matchService.generateMatchesForUser: fetch offered skills error:", offeredError);
      return 0;
    }

    // Get user's wanted skills
    const { data: wantedData, error: wantedError } = await supabase
      .from("user_skills_wanted")
      .select("skill:skills(*)")
      .eq("user_id", userId);

    if (wantedError) {
      console.error("matchService.generateMatchesForUser: fetch wanted skills error:", wantedError);
      return 0;
    }

    const currentUserTeaches: MatchDetail[] = (offeredData || []).map((item: any) => ({
      skill: item.skill,
      normalizedName: normalizeSkillName(item.skill.name),
      direction: "teaches" as const,
    }));

    const currentUserWants: MatchDetail[] = (wantedData || []).map((item: any) => ({
      skill: item.skill,
      normalizedName: normalizeSkillName(item.skill.name),
      direction: "wants" as const,
    }));

    // If user has no skills, no matches possible
    if (currentUserTeaches.length === 0 && currentUserWants.length === 0) {
      return 0;
    }

    // Get all other users
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", userId);

    if (allProfilesError) {
      console.error("matchService.generateMatchesForUser: fetch all profiles error:", allProfilesError);
      return 0;
    }

    if (!allProfiles || allProfiles.length === 0) {
      return 0;
    }

    // Score each user
    let matchCount = 0;
    const matchesToInsert = [];

    for (const otherProfile of allProfiles) {
      try {
        // Get other user's skills
        const { data: otherOfferedData, error: otherOfferedError } = await supabase
          .from("user_skills_offered")
          .select("skill:skills(*)")
          .eq("user_id", otherProfile.user_id);

        if (otherOfferedError) throw otherOfferedError;

        const { data: otherWantedData, error: otherWantedError } = await supabase
          .from("user_skills_wanted")
          .select("skill:skills(*)")
          .eq("user_id", otherProfile.user_id);

        if (otherWantedError) throw otherWantedError;

        const otherUserTeaches: MatchDetail[] = (otherOfferedData || []).map((item: any) => ({
          skill: item.skill,
          normalizedName: normalizeSkillName(item.skill.name),
          direction: "teaches" as const,
        }));

        const otherUserWants: MatchDetail[] = (otherWantedData || []).map((item: any) => ({
          skill: item.skill,
          normalizedName: normalizeSkillName(item.skill.name),
          direction: "wants" as const,
        }));

        // Calculate score
        const matchScore = calculateMatchScore(
          currentUserTeaches,
          currentUserWants,
          otherUserTeaches,
          otherUserWants,
          currentProfile,
          otherProfile
        );

        // Only create match if there's at least one complementary skill
        if (matchScore.mutualSkills.length > 0 || matchScore.oneWaySkillsForUser.length > 0 || matchScore.oneWaySkillsFromUser.length > 0) {
          const user1Id = userId < otherProfile.user_id ? userId : otherProfile.user_id;
          const user2Id = userId < otherProfile.user_id ? otherProfile.user_id : userId;

          matchesToInsert.push({
            user1_id: user1Id,
            user2_id: user2Id,
            match_score: matchScore.score,
            match_type: getMatchType(matchScore.score),
            match_reasons: matchScore.reasons,
            match_mutual_skills: matchScore.mutualSkills,
            match_one_way_for_user: matchScore.oneWaySkillsForUser,
            match_one_way_from_user: matchScore.oneWaySkillsFromUser,
          });
        }
      } catch (error) {
        console.error(
          `matchService.generateMatchesForUser: error scoring user ${otherProfile.user_id}:`,
          error
        );
        // Continue with next user
        continue;
      }
    }

    if (matchesToInsert.length === 0) {
      return 0;
    }

    // Upsert matches (prevents duplicates)
    const { data: inserted, error: insertError } = await supabase
      .from("matches")
      .upsert(matchesToInsert, {
        onConflict: "user1_id,user2_id",
      });

    if (insertError) {
      console.error("matchService.generateMatchesForUser: upsert error:", insertError);
      return 0;
    }

    matchCount = matchesToInsert.length;
    return matchCount;
  } catch (error) {
    console.error("matchService.generateMatchesForUser: unexpected error:", error);
    return 0;
  }
}

function getMatchType(score: number): "perfect" | "strong" | "good" | "potential" {
  if (score >= 80) return "perfect";
  if (score >= 60) return "strong";
  if (score >= 40) return "good";
  return "potential";
}

/**
 * Get user's matches with scores and full details
 */
export async function getUserMatches(userId: string) {
  if (!userId) return [];

  try {
    const { data: matches, error } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .gte("match_score", 0)
      .order("match_score", { ascending: false });

    if (error) throw error;

    if (!matches || matches.length === 0) return [];

    // Get profile details for matched users
    const matchedUserIds = matches.map((m: any) =>
      m.user1_id === userId ? m.user2_id : m.user1_id
    );

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", matchedUserIds);

    if (profileError) throw profileError;

    const profileMap = (profiles || []).reduce((acc: any, p: any) => {
      acc[p.user_id] = p;
      return acc;
    }, {});

    // Enrich matches with profile data
    return matches.map((match: any) => {
      const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
      return {
        ...match,
        otherProfile: profileMap[otherUserId],
      };
    });
  } catch (error) {
    console.error("matchService.getUserMatches:", error);
    return [];
  }
}

/**
 * Get all users with their match scores (for Browse page)
 */
export async function getAllUsersWithScores(userId: string) {
  if (!userId) return [];

  try {
    // Get current user to check skills
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) throw profileError;

    // Get current user's skills
    const { data: offeredData } = await supabase
      .from("user_skills_offered")
      .select("skill:skills(*)")
      .eq("user_id", userId);

    const { data: wantedData } = await supabase
      .from("user_skills_wanted")
      .select("skill:skills(*)")
      .eq("user_id", userId);

    // Get all other users with their scores
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (matchError) throw matchError;

    const matchScores = (matches || []).reduce((acc: any, m: any) => {
      const otherUserId = m.user1_id === userId ? m.user2_id : m.user1_id;
      acc[otherUserId] = {
        score: m.match_score,
        type: m.match_type,
        reasons: m.match_reasons || [],
      };
      return acc;
    }, {});

    // Get all users
    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select("*")
      .neq("user_id", userId);

    if (allError) throw allError;

    // Add skills and scores to each user
    const usersWithDetails = await Promise.all(
      (allProfiles || []).map(async (profile: any) => {
        const { data: theirOffered } = await supabase
          .from("user_skills_offered")
          .select("skill:skills(*)")
          .eq("user_id", profile.user_id);

        const { data: theirWanted } = await supabase
          .from("user_skills_wanted")
          .select("skill:skills(*)")
          .eq("user_id", profile.user_id);

        const matchInfo = matchScores[profile.user_id] || { score: 0, type: "potential", reasons: [] };

        return {
          ...profile,
          skills_offered: (theirOffered || []).map((item: any) => item.skill),
          skills_wanted: (theirWanted || []).map((item: any) => item.skill),
          match_score: matchInfo.score,
          match_type: matchInfo.type,
          match_reasons: matchInfo.reasons,
        };
      })
    );

    return usersWithDetails;
  } catch (error) {
    console.error("matchService.getAllUsersWithScores:", error);
    return [];
  }
}
