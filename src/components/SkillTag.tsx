import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  name: string;
  variant?: "offered" | "wanted";
  onRemove?: () => void;
  onClick?: () => void;
  size?: "sm" | "default";
}

export function SkillTag({ 
  name, 
  variant = "offered", 
  onRemove, 
  onClick,
  size = "default" 
}: SkillTagProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "skill-tag cursor-pointer",
        variant === "offered" ? "skill-tag-offered" : "skill-tag-wanted",
        size === "sm" && "text-xs px-2 py-1"
      )}
      onClick={onClick}
    >
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
}
