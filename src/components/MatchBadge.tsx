import { motion } from "framer-motion";
import { MatchType } from "@/types";
import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  score: number;
  type: MatchType;
  showScore?: boolean;
  size?: "sm" | "default" | "lg";
}

function getMatchLabel(type: MatchType): { emoji: string; label: string } {
  switch (type) {
    case "perfect":
      return { emoji: "🔥", label: "Perfect" };
    case "strong":
      return { emoji: "⭐", label: "Strong" };
    case "good":
      return { emoji: "👍", label: "Good" };
    case "potential":
      return { emoji: "💡", label: "Potential" };
    default:
      return { emoji: "💡", label: "Match" };
  }
}

function getMatchColorClass(type: MatchType): string {
  switch (type) {
    case "perfect":
      return "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800";
    case "strong":
      return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800";
    case "good":
      return "bg-gradient-to-r from-blue-500/20 to-green-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
    case "potential":
      return "bg-muted text-muted-foreground border border-border";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

export function MatchBadge({ score, type, showScore = true, size = "default" }: MatchBadgeProps) {
  const { emoji, label } = getMatchLabel(type);
  const colorClass = getMatchColorClass(type);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold transition-all",
        colorClass,
        size === "sm" && "text-xs px-2 py-0.5",
        size === "default" && "px-3 py-1 text-sm",
        size === "lg" && "text-base px-4 py-2"
      )}
    >
      <span>{emoji}</span>
      {showScore && <span>{score}</span>}
      <span>{label}</span>
    </motion.div>
  );
}

