import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // 🔥 Dummy profiles based on login
    if (user.id === "alex-id") {
      setProfile({
        name: "Alex Johnson",
        college: "IIT Delhi",
        branch: "CSE",
        year: "3rd Year",
        bio: "Frontend developer passionate about React and UI systems. Loves building clean interfaces and collaborating on projects.",
        skills_teach: ["React", "UI Design"],
        skills_learn: ["Python", "Machine Learning"],
      });
    } else if (user.id === "maya-id") {
      setProfile({
        name: "Maya Sharma",
        college: "IIT Delhi",
        branch: "CSE",
        year: "3rd Year",
        bio: "Machine Learning enthusiast who enjoys teaching Python and working on AI-driven solutions.",
        skills_teach: ["Python", "Machine Learning"],
        skills_learn: ["React", "UI Design"],
      });
    }
  }, [user, navigate]);

  if (!profile) return null;

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4 max-w-2xl">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div>
              <h1 className="font-display text-3xl font-bold">
                Your Profile
              </h1>
              <p className="text-muted-foreground">
                Demo Profile (Read-only)
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/40 backdrop-blur-md border rounded-2xl p-6 shadow-sm"
          >

            <div className="space-y-6">

              {/* Name */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Name
                </p>
                <p className="text-lg font-medium">{profile.name}</p>
              </div>

              {/* College */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  College
                </p>
                <p>{profile.college}</p>
              </div>

              {/* Branch & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Branch
                  </p>
                  <p>{profile.branch}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Year
                  </p>
                  <p>{profile.year}</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Bio
                </p>
                <p className="italic text-muted-foreground">
                  {profile.bio}
                </p>
              </div>

              {/* Skills Teach */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Skills You Teach
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills_teach.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills Learn */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Skills You Want to Learn
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills_learn.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="text-muted-foreground">
                  {user.email}
                </p>
              </div>

            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}
