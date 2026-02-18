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
import { cn } from "@/lib/utils";

export default function Matches() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Fake loading animation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const matches = [
    {
      id: "m1",
      match_score: 92,
      match_type: "perfect",
      match_reasons: [
        "You teach React which they want",
        "They teach Python which you want",
        "Same college",
      ],
      otherProfile: {
        name: "Maya Sharma",
        college: "IIT Delhi",
        branch: "CSE",
        year: "3rd Year",
        bio: "ML enthusiast who loves teaching Python and collaborating on projects.",
        skills_offered: [
          { id: "1", name: "Python" },
          { id: "2", name: "Machine Learning" },
        ],
        skills_wanted: [
          { id: "3", name: "React" },
          { id: "4", name: "UI Design" },
        ],
      },
    },
    {
      id: "m2",
      match_score: 78,
      match_type: "strong",
      match_reasons: [
        "You teach UI Design",
        "They teach Public Speaking",
      ],
      otherProfile: {
        name: "Arjun Verma",
        college: "IIT Bombay",
        branch: "Electrical",
        year: "4th Year",
        bio: "Passionate about design systems and community building.",
        skills_offered: [{ id: "5", name: "Public Speaking" }],
        skills_wanted: [{ id: "6", name: "UI Design" }],
      },
    },
  ];

  const handleChatClick = () => {
    setShowMatchModal(true);

    setTimeout(() => {
      navigate("/chat");
    }, 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <main className="pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
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
              {matches.length} skill swap partners waiting for you
            </p>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {matches.map((match) => {
                const isSelected = selectedMatchId === match.id;

                return (
                  <motion.div
                    key={match.id}
                    onClick={() =>
                      setSelectedMatchId(
                        isSelected ? null : match.id
                      )
                    }
                    className={cn(
                      "relative group cursor-pointer transition-all duration-300",
                      isSelected && "scale-[1.02]"
                    )}
                  >
                    <div className="relative bg-white/40 backdrop-blur-md border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-display font-bold text-lg">
                              {match.otherProfile.name}
                            </h3>
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                            <MatchBadge
                              score={match.match_score}
                              type={match.match_type}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {match.otherProfile.college} • {match.otherProfile.year}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="font-display font-bold text-3xl text-primary">
                            {match.match_score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            / 100
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4 mt-4 pt-4 border-t"
                        >
                          <div>
                            <p className="text-xs font-semibold mb-2">
                              They teach
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {match.otherProfile.skills_offered.map(
                                (skill: any) => (
                                  <SkillTag
                                    key={skill.id}
                                    name={skill.name}
                                    variant="offered"
                                  />
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold mb-2">
                              They want to learn
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {match.otherProfile.skills_wanted.map(
                                (skill: any) => (
                                  <SkillTag
                                    key={skill.id}
                                    name={skill.name}
                                    variant="wanted"
                                  />
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-xs font-semibold mb-2">
                              About them
                            </p>
                            <p className="text-sm italic text-muted-foreground">
                              {match.otherProfile.bio}
                            </p>
                          </div>

                          <Button
                            variant="hero"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatClick();
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Start Chat
                          </Button>
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

      {/* MATCH MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 text-center shadow-xl"
          >
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse" />
            <h2 className="font-display text-2xl font-bold mb-2">
              It's a Match!
            </h2>
            <p className="text-muted-foreground">
              You both have complementary skills 🎉
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
