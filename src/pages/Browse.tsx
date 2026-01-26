import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Zap,
  Users,
  MessageCircle,
  Loader,
  FilterX,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SkillTag } from "@/components/SkillTag";
import { MatchBadge } from "@/components/MatchBadge";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { generateMatchesForUser, getAllUsersWithScores } from "@/services/matchService";
import { UserWithSkills } from "@/types";
import { cn } from "@/lib/utils";

export default function Browse() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingMatches, setGeneratingMatches] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [exactMatchesOnly, setExactMatchesOnly] = useState(false);
  const [hasGeneratedMatches, setHasGeneratedMatches] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load users on mount
  useEffect(() => {
    if (user?.id) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const usersData = await getAllUsersWithScores(user.id);
      setUsers(usersData);
      // Check if any user has a match score (indicating matches have been generated)
      const hasScores = usersData.some((u) => u.match_score && u.match_score > 0);
      setHasGeneratedMatches(hasScores);
    } catch (error) {
      console.error("Browse.loadUsers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMatches = async () => {
    if (!user?.id) return;
    setGeneratingMatches(true);
    try {
      const matchCount = await generateMatchesForUser(user.id);
      console.log(`Generated ${matchCount} matches`);
      // Reload users to show new scores
      await loadUsers();
      setHasGeneratedMatches(true);
    } catch (error) {
      console.error("Browse.handleGenerateMatches:", error);
    } finally {
      setGeneratingMatches(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Filter by search query (name, college)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      user.name?.toLowerCase().includes(searchLower) ||
      user.college?.toLowerCase().includes(searchLower);

    // Filter by minimum score
    const matchesScore = !minScore || (user.match_score || 0) >= minScore;

    // Filter by exact matches only (mutual skills)
    if (exactMatchesOnly) {
      const hasExactMatch = (user.match_reasons || []).some((r: string) =>
        r.includes("Mutual:")
      );
      return matchesSearch && matchesScore && hasExactMatch;
    }

    return matchesSearch && matchesScore;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="h-8 w-32 skeleton rounded-lg mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <main className="pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Find Your Skill Swap Partner
            </h1>
            <p className="text-muted-foreground">
              Browse students and discover perfect skill matches
            </p>
          </motion.div>

          {/* Find Matches Button */}
          {!hasGeneratedMatches && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-lg" />
              <div className="relative bg-white/40 backdrop-blur-md border border-white/60 hover:border-white/80 rounded-2xl p-6 mb-8 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-lg mb-1">
                      Ready to find matches?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Click the button to generate matches based on your skills
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleGenerateMatches}
                    disabled={generatingMatches}
                    className="shrink-0"
                  >
                    {generatingMatches ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Find Matches
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or college..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Filters</span>
                {(minScore > 0 || exactMatchesOnly) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMinScore(0);
                      setExactMatchesOnly(false);
                    }}
                    className="h-8"
                  >
                    <FilterX className="w-4 h-4 mr-1.5" />
                    Clear
                  </Button>
                )}
              </div>

              {hasGeneratedMatches && (
                <>
                  <div className="space-y-2.5">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Minimum Score</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={minScore}
                        onChange={(e) => setMinScore(parseInt(e.target.value))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-sm font-bold text-primary w-12 text-right">{minScore}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <label htmlFor="exact-matches" className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        id="exact-matches"
                        checked={exactMatchesOnly}
                        onChange={(e) => setExactMatchesOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-2 border-emerald-300 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer accent-emerald-500"
                      />
                      <span className="text-sm font-medium text-foreground">Only exact matches</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {/* Users Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={
                hasGeneratedMatches
                  ? "No matches found"
                  : "No users to browse"
              }
              description={
                hasGeneratedMatches && searchQuery
                  ? "Try adjusting your search or filters"
                  : hasGeneratedMatches && exactMatchesOnly
                  ? "Try enabling one-way matches or adjusting the score filter"
                  : "Add skills to your profile and generate matches to see results here"
              }
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredUsers.map((matchedUser, idx) => (
                <motion.div
                  key={matchedUser.user_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/40 backdrop-blur-md border border-white/60 hover:border-white/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full">
                    {/* Header with score */}
                    <div className="p-6 pb-4 border-b border-white/40">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                            {matchedUser.name || "Unknown User"}
                          </h3>
                          {matchedUser.college && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {matchedUser.college}
                            </p>
                          )}
                        </div>
                        {hasGeneratedMatches && matchedUser.match_score !== undefined && matchedUser.match_score > 0 && (
                          <MatchBadge
                            score={matchedUser.match_score}
                            type={
                              matchedUser.match_type as
                                | "perfect"
                                | "strong"
                                | "good"
                                | "potential"
                            }
                          />
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="p-6 space-y-4 flex-1">
                      {/* Offers */}
                      {matchedUser.skills_offered && matchedUser.skills_offered.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                            Can teach
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {matchedUser.skills_offered.slice(0, 3).map((skill) => (
                              <SkillTag key={skill.id} name={skill.name} variant="offered" />
                            ))}
                            {matchedUser.skills_offered.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{matchedUser.skills_offered.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Wants */}
                      {matchedUser.skills_wanted && matchedUser.skills_wanted.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                            Wants to learn
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {matchedUser.skills_wanted.slice(0, 3).map((skill) => (
                              <SkillTag key={skill.id} name={skill.name} variant="wanted" />
                            ))}
                            {matchedUser.skills_wanted.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{matchedUser.skills_wanted.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Match Reasons */}
                      {hasGeneratedMatches &&
                        matchedUser.match_reasons &&
                        matchedUser.match_reasons.length > 0 && (
                          <div className="pt-2 border-t border-white/40">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                              Why matched
                            </p>
                            <ul className="space-y-1.5">
                              {matchedUser.match_reasons.slice(0, 2).map((reason: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-xs text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                              {matchedUser.match_reasons.length > 2 && (
                                <li className="text-xs text-muted-foreground italic">
                                  +{matchedUser.match_reasons.length - 2} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                    </div>

                    {/* Action - only show if match exists */}
                    {hasGeneratedMatches && matchedUser.match_score && matchedUser.match_score > 0 && (
                      <div className="p-6 pt-4 border-t border-white/40 bg-white/20">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate("/chat")}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Start Chat
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
