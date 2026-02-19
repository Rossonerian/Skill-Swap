import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Demo login successful 🚀",
      description: "Welcome to Skill Swap prototype.",
    });

    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold">
            Demo Login
          </h1>
          <p className="text-muted-foreground mt-2">
            Use one of the demo accounts below
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">

          {/* Manual Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="alex@demo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            Quick Demo Access
          </div>

          {/* One-click Demo Buttons */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleLogin("alex@demo.com", "123456")}
              disabled={loading}
            >
              Login as Alex (Frontend Developer)
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => handleLogin("maya@demo.com", "123456")}
              disabled={loading}
            >
              Login as Maya (ML Enthusiast)
            </Button>
          </div>

          {/* Demo Info Box */}
          <div className="bg-white/40 p-4 rounded-xl text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Demo Credentials</p>
            <p>alex@demo.com / 123456</p>
            <p>maya@demo.com / 123456</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
