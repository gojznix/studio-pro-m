import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Stats {
  average: number | null;
  count: number;
}

export const useSongRating = (songId: string | null) => {
  const { user } = useAuth();
  const [myRating, setMyRating] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({ average: null, count: 0 });
  const [loading, setLoading] = useState(false);

  const loadStats = useCallback(async () => {
    if (!songId) return;
    const { data } = await ((supabase as any).from("song_rating_stats"))
      .select("avg_rating, vote_count")
      .eq("song_id", songId)
      .maybeSingle();
    setStats({
      average: data?.avg_rating != null ? Number(data.avg_rating) : null,
      count: data?.vote_count ?? 0,
    });
  }, [songId]);

  useEffect(() => {
    setMyRating(null);
    setStats({ average: null, count: 0 });
    if (!songId) return;
    loadStats();
    if (!user) return;
    ((supabase as any).from("song_ratings"))
      .select("rating")
      .eq("song_id", songId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: { data: { rating: number } | null }) => {
        setMyRating(data?.rating ?? null);
      });
  }, [songId, user, loadStats]);

  const submitRating = useCallback(
    async (value: number) => {
      if (!songId || !user) return { error: new Error("not-signed-in") };
      const rating = Math.round(value);
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        return { error: new Error("invalid-rating") };
      }
      setLoading(true);
      const previous = myRating;
      setMyRating(rating);
      const { error } = await ((supabase as any).from("song_ratings")).upsert(
        { song_id: songId, user_id: user.id, rating },
        { onConflict: "song_id,user_id" }
      );
      if (error) {
        setMyRating(previous);
      } else {
        await loadStats();
      }
      setLoading(false);
      return { error };
    },
    [songId, user, myRating, loadStats]
  );

  return { myRating, stats, loading, submitRating, canRate: !!user };
};
