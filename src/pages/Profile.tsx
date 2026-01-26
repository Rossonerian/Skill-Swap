import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { databases } from "@/integrations/appwrite/client";
import { DB_ID, PROFILES_COLLECTION } from "@/services/appwriteService";

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
      const response = await databases.listDocuments(
        DB_ID,
        PROFILES_COLLECTION
      );

      const profile = response.documents.find((doc: any) => doc.user_id === user.id);

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
      const response = await databases.listDocuments(
        DB_ID,
        PROFILES_COLLECTION
      );

      const existingProfile = response.documents.find((doc: any) => doc.user_id === user.id);

      if (existingProfile) {
        // Update existing profile
        await databases.updateDocument(
          DB_ID,
          PROFILES_COLLECTION,
          existingProfile.$id,
          {
            name: formData.name,
            college: formData.college,
            branch: formData.branch,
            year: formData.year,
            bio: formData.bio,
            updated_at: new Date().toISOString(),
          }
        );
      } else {
        // Create new profile
        await databases.createDocument(
          DB_ID,
          PROFILES_COLLECTION,
          "unique()",
          {
            user_id: user.id,
            name: formData.name,
            college: formData.college,
            branch: formData.branch,
            year: formData.year,
            bio: formData.bio,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      }

      await loadProfile();
    } catch (error) {
      console.error("Profile.handleSaveProfile:", error);
    } finally {
      setSaving(false);
    }
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
                    <Input
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder="1st, 2nd, 3rd, 4th"
                      className="bg-white/40 border-white/60"
                    />
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
