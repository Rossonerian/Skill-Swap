import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, ArrowRight, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SkillTag } from "@/components/SkillTag";
import { MatchBadge } from "@/components/MatchBadge";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getUserMatches } from "@/services/matchService";
import { Match } from "@/types";
import { cn } from "@/lib/utils";

interface MatchWithProfile extends Match {
  otherProfile?: {
    name: string | null;
    college: string | null;
    branch: string | null;
    year: string | null;
    avatar_url: string | null;
    bio: string | null;
    skills_offered?: any[];
    skills_wanted?: any[];
  };
  match_reasons?: string[];
}

export default function Matches() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Load matches
  useEffect(() => {
    if (user?.id) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const matchesData = await getUserMatches(user.id);
      setMatches(matchesData);
    } catch (error) {
      console.error("Matches.loadMatches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (match: MatchWithProfile) => {
    if (!user?.id || !match.id) return;

    try {
      // For now, just navigate to chat with the match info
      // The chat page will handle creating a conversation if needed
      navigate(`/chat?matchId=${match.id}`);
    } catch (error) {
      console.error("Matches.handleChatClick:", error);
      navigate("/chat");
    }
  };

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
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Your Matches
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              {matches.length > 0
                ? `${matches.length} skill swap partner${matches.length !== 1 ? "s" : ""} waiting for you`
                : "Discover your perfect skill swap matches"}
            </p>
          </motion.div>

          {/* Matches List */}
          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : matches.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No matches yet"
              description="Add skills to your profile and click 'Find Matches' to discover skill swap partners"
              action={
                <Button
                  variant="hero"
                  onClick={() => navigate("/browse")}
                >
                  Find Matches
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="space-y-4"
            >
              {matches.map((match, idx) => {
                const isSelected = selectedMatchId === match.id;

                return (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedMatchId(isSelected ? null : match.id)}
                    className={cn(
                      "relative group cursor-pointer transition-all duration-300",
                      isSelected && "scale-[1.02]"
                    )}
                  >
                    {/* Gradient glow background */}
                    <div className={cn(
                      "absolute inset-0 rounded-2xl blur-lg transition-opacity duration-300",
                      isSelected ? "bg-gradient-to-br from-primary/20 to-transparent opacity-100" : "bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100"
                    )} />
                    
                    {/* Card */}
                    <div className={cn(
                      "relative bg-white/40 backdrop-blur-md border rounded-2xl p-6 transition-all duration-300 shadow-sm",
                      isSelected
                        ? "border-primary/60 shadow-lg"
                        : "border-white/60 hover:border-white/80 hover:shadow-md"
                    )}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                            {match.otherProfile?.name || "Unknown User"}
                          </h3>
                          <MatchBadge
                            score={match.match_score}
                            type={
                              match.match_type as
                                | "perfect"
                                | "strong"
                                | "good"
                                | "potential"
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          {match.otherProfile?.college && (
                            <>
                              <span>{match.otherProfile.college}</span>
                              <span>•</span>
                            </>
                          )}
                          {match.otherProfile?.year && (
                            <>
                              <span>{match.otherProfile.year}</span>
                              {match.otherProfile?.branch && <span>•</span>}
                            </>
                          )}
                          {match.otherProfile?.branch && (
                            <span>{match.otherProfile.branch}</span>
                          )}
                        </div>
                      </div>

                      {/* Match Score Display */}
                      <div className="text-right">
                        <div className="font-display font-bold text-3xl bg-gradient-to-br from-primary to-blue-600 bg-clip-text text-transparent">
                          {match.match_score}
                        </div>
                        <div className="text-xs text-muted-foreground font-medium">/ 100</div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 mt-4 pt-4 border-t border-white/40"
                      >
                        {/* Their Skills */}
                        {match.otherProfile?.skills_offered &&
                          match.otherProfile.skills_offered.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                                They teach
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {match.otherProfile.skills_offered
                                  .slice(0, 5)
                                  .map((skill: any) => (
                                    <SkillTag
                                      key={skill.id}
                                      name={skill.name}
                                      variant="offered"
                                    />
                                  ))}
                                {match.otherProfile.skills_offered.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{match.otherProfile.skills_offered.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                        {match.otherProfile?.skills_wanted &&
                          match.otherProfile.skills_wanted.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                                They want to learn
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {match.otherProfile.skills_wanted
                                  .slice(0, 5)
                                  .map((skill: any) => (
                                    <SkillTag
                                      key={skill.id}
                                      name={skill.name}
                                      variant="wanted"
                                    />
                                  ))}
                                {match.otherProfile.skills_wanted.length > 5 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{match.otherProfile.skills_wanted.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Match Reasons */}
                        {match.match_reasons && match.match_reasons.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                              Why you matched
                            </p>
                            <ul className="space-y-2">
                              {match.match_reasons.map((reason: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-sm text-muted-foreground flex items-start gap-2"
                                >
                                  <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Bio */}
                        {match.otherProfile?.bio && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2.5">
                              About them
                            </p>
                            <p className="text-sm text-muted-foreground italic">
                              {match.otherProfile.bio}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            variant="hero"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatClick(match);
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Start Chat
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
