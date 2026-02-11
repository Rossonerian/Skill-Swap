import { useState, useEffect, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { getProfileByUserId, upsertProfile } from "@/services/localDb";

interface ProfileData {
  user_id: string;
  name: string;
  college: string;
  branch: string;
  year: string;
  bio: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Skill preferences
  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [newTeachSkill, setNewTeachSkill] = useState("");
  const [newLearnSkill, setNewLearnSkill] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    college: "",
    branch: "",
    year: "",
    bio: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user?.id) {
      loadProfile();
    }
  }, [user?.id, authLoading, navigate]);

  const loadProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const profile = getProfileByUserId(user.id);

      if (profile) {
        setProfile({
          user_id: profile.user_id,
          name: profile.name || "",
          college: profile.college || "",
          branch: profile.branch || "",
          year: profile.year || "",
          bio: profile.bio || "",
        });
        setFormData({
          name: profile.name || "",
          college: profile.college || "",
          branch: profile.branch || "",
          year: profile.year || "",
          bio: profile.bio || "",
        });

        // Load skill preferences if present
        setTeachSkills(Array.isArray(profile.skills_teach) ? profile.skills_teach : []);
        setLearnSkills(Array.isArray(profile.skills_learn) ? profile.skills_learn : []);
      }
    } catch (error) {
      console.error("Profile.loadProfile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      // Get existing profile
      const basePayload = {
        name: formData.name,
        college: formData.college,
        branch: formData.branch,
        year: formData.year,
        bio: formData.bio,
        skills_teach: teachSkills,
        skills_learn: learnSkills,
        is_profile_complete:
          !!formData.name &&
          !!formData.college &&
          !!formData.branch &&
          !!formData.year,
      };

      // Local JSON-based upsert
      upsertProfile(user.id, basePayload as any);

      await loadProfile();
    } catch (error) {
      console.error("Profile.handleSaveProfile:", error);
    } finally {
      setSaving(false);
    }
  };

  const addTeachSkill = () => {
    const value = newTeachSkill.trim();
    if (!value) return;
    if (!teachSkills.includes(value)) {
      setTeachSkills([...teachSkills, value]);
    }
    setNewTeachSkill("");
  };

  const addLearnSkill = () => {
    const value = newLearnSkill.trim();
    if (!value) return;
    if (!learnSkills.includes(value)) {
      setLearnSkills([...learnSkills, value]);
    }
    setNewLearnSkill("");
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>, type: "teach" | "learn") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "teach") {
        addTeachSkill();
      } else {
        addLearnSkill();
      }
    }
  };

  const removeTeachSkill = (skill: string) => {
    setTeachSkills(teachSkills.filter((s) => s !== skill));
  };

  const removeLearnSkill = (skill: string) => {
    setLearnSkills(learnSkills.filter((s) => s !== skill));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navbar />
        <main className="pt-24 pb-24 md:pb-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20" />
                <span className="text-sm text-muted-foreground">Loading profile...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <main className="pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              <h1 className="font-display text-3xl md:text-4xl font-bold">
                Your Profile
              </h1>
              <p className="text-muted-foreground">Manage your information</p>
            </div>
          </motion.div>

          {/* Profile Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/40 backdrop-blur-md border border-white/60 hover:border-white/80 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md">
              <h2 className="font-display text-xl font-bold mb-6">Profile Information</h2>

              <div className="space-y-4 mb-6">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Your name"
                    className="bg-white/40 border-white/60"
                  />
                </div>

                {/* College */}
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    College
                  </label>
                  <Input
                    value={formData.college}
                    onChange={(e) =>
                      setFormData({ ...formData, college: e.target.value })
                    }
                    placeholder="Your college/university"
                    className="bg-white/40 border-white/60"
                  />
                </div>

                {/* Branch & Year (side by side) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                      Branch
                    </label>
                    <Input
                      value={formData.branch}
                      onChange={(e) =>
                        setFormData({ ...formData, branch: e.target.value })
                      }
                      placeholder="e.g., CSE, ECE"
                      className="bg-white/40 border-white/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                      Year
                    </label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) =>
                        setFormData({ ...formData, year: value })
                      }
                    >
                      <SelectTrigger className="bg-white/40 border-white/60">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st year">1st year</SelectItem>
                        <SelectItem value="2nd year">2nd year</SelectItem>
                        <SelectItem value="3rd year">3rd year</SelectItem>
                        <SelectItem value="4th year">4th year</SelectItem>
                        <SelectItem value="Pass-out">Pass-out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/40 border border-white/60 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={4}
                  />
                </div>

                {/* Skills to Teach */}
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                    Skills you can teach
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTeachSkill}
                      onChange={(e) => setNewTeachSkill(e.target.value)}
                      onKeyDown={(e) => handleSkillKeyDown(e, "teach")}
                      placeholder="e.g., React, UI design"
                      className="bg-white/40 border-white/60"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTeachSkill}
                      disabled={!newTeachSkill.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {teachSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {teachSkills.map((skill) => (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => removeTeachSkill(skill)}
                          className="px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
                          title="Click to remove"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills to Learn */}
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block">
                    Skills you want to learn
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newLearnSkill}
                      onChange={(e) => setNewLearnSkill(e.target.value)}
                      onKeyDown={(e) => handleSkillKeyDown(e, "learn")}
                      placeholder="e.g., TypeScript, Public speaking"
                      className="bg-white/40 border-white/60"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addLearnSkill}
                      disabled={!newLearnSkill.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {learnSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {learnSkills.map((skill) => (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => removeLearnSkill(skill)}
                          className="px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          title="Click to remove"
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <div className="px-4 py-2.5 rounded-xl bg-white/20 border border-white/40 text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                variant="hero"
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
