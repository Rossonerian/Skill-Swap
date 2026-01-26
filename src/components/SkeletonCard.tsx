import { motion } from "framer-motion";

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full skeleton" />
        <div className="flex-1">
          <div className="h-5 w-32 skeleton mb-2" />
          <div className="h-4 w-24 skeleton" />
        </div>
        <div className="h-6 w-20 skeleton rounded-full" />
      </div>
      
      <div className="h-4 w-full skeleton mt-4" />
      <div className="h-4 w-3/4 skeleton mt-2" />
      
      <div className="flex gap-2 mt-4">
        <div className="h-6 w-16 skeleton rounded-full" />
        <div className="h-6 w-20 skeleton rounded-full" />
        <div className="h-6 w-14 skeleton rounded-full" />
      </div>
      
      <div className="flex gap-2 mt-5">
        <div className="h-9 flex-1 skeleton rounded-lg" />
        <div className="h-9 flex-1 skeleton rounded-lg" />
      </div>
    </motion.div>
  );
}
