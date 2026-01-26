import { motion } from "framer-motion";
import { User, BookOpen, GraduationCap, MapPin } from "lucide-react";
import { UserWithSkills } from "@/types";
import { SkillTag } from "./SkillTag";
import { MatchBadge } from "./MatchBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface UserCardProps {
  user: UserWithSkills;
  onConnect?: () => void;
  onViewProfile?: () => void;
}

export function UserCard({ user, onConnect, onViewProfile }: UserCardProps) {
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-16 h-16 border-2 border-primary/20">
          <AvatarImage src={user.avatar_url || undefined} alt={user.name || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary font-display text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-bold text-lg truncate">
                {user.name || "Anonymous"}
              </h3>
              {user.college && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="truncate">{user.college}</span>
                </div>
              )}
            </div>
            
            {user.match_score !== undefined && user.match_type && (
              <MatchBadge score={user.match_score} type={user.match_type} size="sm" />
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-1">
            {user.branch && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {user.branch}
              </span>
            )}
            {user.year && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {user.year}
              </span>
            )}
          </div>
        </div>
      </div>

      {user.bio && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {user.bio}
        </p>
      )}

      {/* Skills Offered */}
      {user.skills_offered.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Can teach</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.skills_offered.slice(0, 4).map((skill) => (
              <SkillTag key={skill.id} name={skill.name} variant="offered" size="sm" />
            ))}
            {user.skills_offered.length > 4 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{user.skills_offered.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Skills Wanted */}
      {user.skills_wanted.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Wants to learn</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {user.skills_wanted.slice(0, 4).map((skill) => (
              <SkillTag key={skill.id} name={skill.name} variant="wanted" size="sm" />
            ))}
            {user.skills_wanted.length > 4 && (
              <span className="text-xs text-muted-foreground px-2 py-1">
                +{user.skills_wanted.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-5">
        <Button variant="soft" size="sm" className="flex-1" onClick={onViewProfile}>
          View Profile
        </Button>
        <Button size="sm" className="flex-1" onClick={onConnect}>
          Connect
        </Button>
      </div>
    </motion.div>
  );
}
