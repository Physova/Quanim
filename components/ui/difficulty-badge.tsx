import { cn } from "@/lib/utils";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

const styles: Record<Difficulty, string> = {
  Beginner:
    "bg-white/5 text-white/60 border border-white/10",
  Intermediate:
    "bg-white/5 text-white/60 border border-white/15",
  Advanced:
    "bg-white/10 text-white/80 border border-white/20",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] rounded-none",
        styles[difficulty] ?? styles.Beginner
      )}
    >
      {difficulty}
    </span>
  );
}
