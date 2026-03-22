import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Sparkles, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
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
      title: "Login successful 🚀",
      description: "Welcome to Skill Swap!",
    });

    navigate("/dashboard");
  };

  const handleSignup = async (signupEmail: string, signupPassword: string, signupName: string) => {
    if (!signupName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(signupEmail, signupPassword, signupName);

    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Signup successful 🎉",
      description: "Account created! Let's complete your profile.",
    });

    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      handleLogin(email, password);
    } else {
      handleSignup(email, password, name);
    }
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
            {mode === "login" ? "Welcome Back" : "Join Skill Swap"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {mode === "login" ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <div className="glass-card p-8 space-y-6">

          {/* Tab Buttons */}
          <div className="flex gap-2 rounded-lg bg-white/10 p-1">
            <Button
              variant={mode === "login" ? "default" : "ghost"}
              className="flex-1 rounded-md"
              onClick={() => {
                setMode("login");
                setName("");
                setEmail("");
                setPassword("");
              }}
            >
              Sign In
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "ghost"}
              className="flex-1 rounded-md"
              onClick={() => {
                setMode("signup");
                setName("");
                setEmail("");
                setPassword("");
              }}
            >
              Sign Up
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label>Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
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
                  placeholder="••••••••"
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
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Demo Info Box */}
          {mode === "login" && (
            <>
              <div className="border-t pt-6 text-center text-sm text-muted-foreground">
                Demo Credentials
              </div>

              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleLogin("alex@demo.com", "123456")}
                  disabled={loading}
                >
                  Login as Alex
                </Button>

                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => handleLogin("maya@demo.com", "123456")}
                  disabled={loading}
                >
                  Login as Maya
                </Button>
              </div>

              <div className="bg-white/40 p-4 rounded-xl text-sm text-muted-foreground">
                <p className="font-semibold mb-2">Demo Accounts</p>
                <p>alex@demo.com / 123456</p>
                <p>maya@demo.com / 123456</p>
              </div>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}
