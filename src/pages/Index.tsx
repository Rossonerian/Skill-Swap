import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Users, Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">Skill Swap</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard">
              <Button variant="hero">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>

              <Link to="/auth">
                <Button variant="hero">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>College-only skill exchange platform</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
            Learn new skills,
            <br />
            <span className="text-primary">teach what you know</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            Connect with fellow students to exchange skills without money.
            You teach Python, learn Guitar. It's that simple.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Start Swapping Skills
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button variant="outline" size="xl">
                Explore Skills
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="grid md:grid-cols-3 gap-6 mt-32 max-w-4xl mx-auto">
          {[
            {
              icon: Users,
              title: "Smart Matching",
              description: "Our algorithm finds perfect skill matches based on what you offer and want",
            },
            {
              icon: Zap,
              title: "Zero Cost",
              description: "No money involved. Exchange skills purely based on mutual benefit",
            },
            {
              icon: MessageCircle,
              title: "Real-time Chat",
              description: "Connect instantly with your matches and start learning together",
            },
          ].map((feature, i) => (
            <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="glass-card p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
