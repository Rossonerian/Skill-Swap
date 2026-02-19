import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";
import { SkillTag } from "@/components/SkillTag";
import { MatchBadge } from "@/components/MatchBadge";
import { cn } from "@/lib/utils";

export default function Matches() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentUserId = user?.id;

  if (!currentUserId) return null;

  // 🔥 Dynamic matches per user
  const matches =
    currentUserId === "alex-id"
      ? [
          {
            id: "m1",
            match_score: 92,
            match_type: "perfect",
            otherProfile: {
              name: "Maya Sharma",
              college: "IIT Delhi",
              branch: "CSE",
              year: "3rd Year",
              bio: "ML enthusiast who loves teaching Python.",
              skills_offered: [
                { id: "1", name: "Python" },
                { id: "2", name: "Machine Learning" },
              ],
              skills_wanted: [
                { id: "3", name: "React" },
              ],
            },
          },
          {
            id: "m2",
            match_score: 78,
            match_type: "strong",
            otherProfile: {
              name: "Arjun Verma",
              college: "IIT Bombay",
              branch: "Electrical",
              year: "4th Year",
              bio: "Public speaking coach & design enthusiast.",
              skills_offered: [{ id: "5", name: "Public Speaking" }],
              skills_wanted: [{ id: "6", name: "UI Design" }],
            },
          },
        ]
      : currentUserId === "maya-id"
      ? [
          {
            id: "m3",
            match_score: 92,
            match_type: "perfect",
            otherProfile: {
              name: "Alex Johnson",
              college: "IIT Delhi",
              branch: "CSE",
              year: "3rd Year",
              bio: "Frontend developer passionate about React.",
              skills_offered: [
                { id: "7", name: "React" },
                { id: "8", name: "UI Design" },
              ],
              skills_wanted: [
                { id: "9", name: "Python" },
              ],
            },
          },
        ]
      : [
          {
            id: "m4",
            match_score: 78,
            match_type: "strong",
            otherProfile: {
              name: "Alex Johnson",
              college: "IIT Delhi",
              branch: "CSE",
              year: "3rd Year",
              bio: "Frontend developer passionate about React.",
              skills_offered: [
                { id: "10", name: "React" },
              ],
              skills_wanted: [
                { id: "11", name: "Public Speaking" },
              ],
            },
          },
        ];

  const handleChatClick = () => {
    setShowMatchModal(true);
    setTimeout(() => navigate("/chat"), 1800);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-bg pt-24">
        <Navbar />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-primary" />
              <h1 className="font-display text-3xl font-bold">
                Your Matches
              </h1>
            </div>
            <p className="text-muted-foreground">
              {matches.length} skill swap partner{matches.length > 1 && "s"} waiting
            </p>
          </motion.div>

          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const isSelected = selectedMatchId === match.id;

                return (
                  <div
                    key={match.id}
                    onClick={() =>
                      setSelectedMatchId(
                        isSelected ? null : match.id
                      )
                    }
                    className={cn(
                      "bg-white/40 backdrop-blur-md border rounded-2xl p-6 shadow-sm transition-all cursor-pointer",
                      isSelected && "border-primary"
                    )}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">
                            {match.otherProfile.name}
                          </h3>
                          <MatchBadge
                            score={match.match_score}
                            type={match.match_type}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {match.otherProfile.college} • {match.otherProfile.year}
                        </p>
                      </div>

                      <div className="text-2xl font-bold text-primary">
                        {match.match_score}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="space-y-4 mt-4 pt-4 border-t">

                        <div>
                          <p className="text-xs font-semibold mb-2">
                            They Teach
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {match.otherProfile.skills_offered.map((s: any) => (
                              <SkillTag key={s.id} name={s.name} variant="offered" />
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold mb-2">
                            They Want to Learn
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {match.otherProfile.skills_wanted.map((s: any) => (
                              <SkillTag key={s.id} name={s.name} variant="wanted" />
                            ))}
                          </div>
                        </div>

                        <p className="text-sm italic text-muted-foreground">
                          {match.otherProfile.bio}
                        </p>

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
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

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
