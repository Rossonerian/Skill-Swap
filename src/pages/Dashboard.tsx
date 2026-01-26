import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Plus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 skeleton rounded-lg mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  // Get the best available name for greeting
  const getDisplayName = (): string => {
    // Try to get full name from metadata first
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (fullName && fullName.trim()) {
      return fullName.split(" ")[0]; // Just first name
    }

    // Fallback to email prefix (cleaned)
    const emailPrefix = user?.email?.split("@")[0] || "";
    if (emailPrefix) {
      return emailPrefix
        .split(/[._-]/) // Split on common delimiters
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(" ");
    }

    return "there";
  };

  const userName = getDisplayName();

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      
      <main className="pt-24 pb-24 md:pb-8">
        <div className="container mx-auto px-4">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
              Hey, {userName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Ready to swap some skills today?
            </p>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/40 backdrop-blur-md border border-white/60 hover:border-white/80 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg mb-1">Add Skills</h3>
                <p className="text-sm text-muted-foreground">
                  List skills you can teach or want to learn
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative group cursor-pointer"
              onClick={() => navigate("/browse")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/40 backdrop-blur-md border border-white/60 hover:border-white/80 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-accent/60 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg mb-1">Find Matches</h3>
                <p className="text-sm text-muted-foreground">
                  Discover students with complementary skills
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group cursor-pointer"
              onClick={() => navigate("/matches")}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/40 backdrop-blur-md border border-white/60 hover:border-white/80 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-secondary" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary/60 group-hover:text-secondary transition-colors" />
                </div>
                <h3 className="font-display font-bold text-lg mb-1">View Matches</h3>
                <p className="text-sm text-muted-foreground">
                  See your top skill swap matches
                </p>
              </div>
            </motion.div>
          </div>

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-8 md:p-12 text-center shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Complete Your Profile
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 text-base">
                Add your skills to start matching with other students. 
                The more skills you add, the better your matches!
              </p>
              <Button variant="hero" size="lg" onClick={() => navigate("/profile")}>
                Set Up Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
