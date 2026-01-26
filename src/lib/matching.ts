import { Profile, Skill, MatchType } from "@/types";

interface MatchResult {
  score: number;
  type: MatchType;
  mutualSkills: { userOffers: Skill; otherWants: Skill }[];
  oneWayMatches: { skill: Skill; direction: 'can_teach' | 'wants_to_learn' }[];
}

/**
 * Calculate match score between two users
 * - Mutual skill match = highest priority (40 points each)
 * - One-way match = medium priority (15 points each)
 * - Same college = bonus (15 points)
 * - Same year = small bonus (5 points)
 * - Same branch = small bonus (5 points)
 */
export function calculateMatchScore(
  currentUser: {
    profile: Profile;
    skillsOffered: Skill[];
    skillsWanted: Skill[];
  },
  otherUser: {
    profile: Profile;
    skillsOffered: Skill[];
    skillsWanted: Skill[];
  }
): MatchResult {
  let score = 0;
  const mutualSkills: MatchResult['mutualSkills'] = [];
  const oneWayMatches: MatchResult['oneWayMatches'] = [];

  // Check for mutual matches (I offer what they want AND they offer what I want)
  for (const myOffered of currentUser.skillsOffered) {
    for (const theirWanted of otherUser.skillsWanted) {
      if (myOffered.id === theirWanted.id) {
        // Check if there's a reverse match
        for (const theirOffered of otherUser.skillsOffered) {
          for (const myWanted of currentUser.skillsWanted) {
            if (theirOffered.id === myWanted.id) {
              mutualSkills.push({
                userOffers: myOffered,
                otherWants: theirWanted
              });
              score += 40; // High priority for mutual matches
            }
          }
        }
      }
    }
  }

  // Check for one-way matches (I offer what they want)
  for (const myOffered of currentUser.skillsOffered) {
    for (const theirWanted of otherUser.skillsWanted) {
      if (myOffered.id === theirWanted.id) {
        const alreadyMutual = mutualSkills.some(m => m.userOffers.id === myOffered.id);
        if (!alreadyMutual) {
          oneWayMatches.push({ skill: myOffered, direction: 'can_teach' });
          score += 15;
        }
      }
    }
  }

  // Check for one-way matches (They offer what I want)
  for (const theirOffered of otherUser.skillsOffered) {
    for (const myWanted of currentUser.skillsWanted) {
      if (theirOffered.id === myWanted.id) {
        const alreadyMutual = mutualSkills.some(m => 
          otherUser.skillsOffered.some(o => o.id === theirOffered.id)
        );
        if (!alreadyMutual) {
          oneWayMatches.push({ skill: theirOffered, direction: 'wants_to_learn' });
          score += 15;
        }
      }
    }
  }

  // College bonus
  if (currentUser.profile.college && otherUser.profile.college) {
    if (currentUser.profile.college.toLowerCase() === otherUser.profile.college.toLowerCase()) {
      score += 15;
    }
  }

  // Year bonus
  if (currentUser.profile.year && otherUser.profile.year) {
    if (currentUser.profile.year === otherUser.profile.year) {
      score += 5;
    }
  }

  // Branch bonus
  if (currentUser.profile.branch && otherUser.profile.branch) {
    if (currentUser.profile.branch.toLowerCase() === otherUser.profile.branch.toLowerCase()) {
      score += 5;
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine match type
  let type: MatchType;
  if (score >= 80) {
    type = 'perfect';
  } else if (score >= 60) {
    type = 'strong';
  } else if (score >= 40) {
    type = 'good';
  } else {
    type = 'potential';
  }

  return { score, type, mutualSkills, oneWayMatches };
}

export function getMatchLabel(type: MatchType): { emoji: string; label: string } {
  switch (type) {
    case 'perfect':
      return { emoji: '🔥', label: 'Perfect Match' };
    case 'strong':
      return { emoji: '⭐', label: 'Strong Match' };
    case 'good':
      return { emoji: '👍', label: 'Good Match' };
    case 'potential':
      return { emoji: '💡', label: 'Potential Match' };
  }
}

export function getMatchColorClass(type: MatchType): string {
  switch (type) {
    case 'perfect':
      return 'match-perfect';
    case 'strong':
      return 'match-strong';
    case 'good':
      return 'match-good';
    case 'potential':
      return 'bg-muted text-muted-foreground';
  }
}
