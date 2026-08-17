import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useSongRating } from "@/hooks/useSongRating";
import { useToast } from "@/hooks/use-toast";

interface SongRatingProps {
  songId: string;
}

const SongRating = ({ songId }: SongRatingProps) => {
  const { myRating, stats, loading, submitRating, canRate } = useSongRating(songId);
  const [hovered, setHovered] = useState<number | null>(null);
  const { toast } = useToast();

  const handleClick = async (value: number) => {
    if (!canRate || loading) return;
    const { error } = await submitRating(value);
    if (error) {
      toast({
        title: "Ocene ni bilo mogoče shraniti",
        description: "Poskusite znova.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Hvala za oceno!", description: `Vaša ocena: ${value}/10` });
    }
  };

  const active = hovered ?? myRating ?? 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Ocenite skladbo od 1 do 10"
        onMouseLeave={() => setHovered(null)}
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={myRating === value}
            aria-label={`Oceni ${value} od 10`}
            disabled={!canRate || loading}
            onMouseEnter={() => canRate && setHovered(value)}
            onFocus={() => canRate && setHovered(value)}
            onClick={() => handleClick(value)}
            className={`rounded p-0.5 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 ${
              canRate ? "hover:scale-125 cursor-pointer" : "cursor-not-allowed opacity-60"
            }`}
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                value <= active ? "fill-green-400 text-green-400" : "text-zinc-500"
              }`}
            />
          </button>
        ))}
      </div>

      {canRate ? (
        <p className="text-xs text-zinc-400">
          {myRating ? `Vaša ocena: ${myRating}/10` : "Kliknite zvezdico za oceno"}
          {stats.count > 0 && ` · Povprečje ${stats.average?.toFixed(1)} (${stats.count} glasov)`}
        </p>
      ) : (
        <p className="text-xs text-zinc-400">
          <Link to="/auth" className="text-green-400 underline underline-offset-2 hover:text-green-300">
            Prijavite se
          </Link>{" "}
          za oceno skladbe
          {stats.count > 0 && ` · Povprečje ${stats.average?.toFixed(1)} (${stats.count} glasov)`}
        </p>
      )}
    </div>
  );
};

export default SongRating;
