CREATE TABLE public.song_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (song_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.song_ratings TO authenticated;
GRANT SELECT ON public.song_ratings TO anon;
GRANT ALL ON public.song_ratings TO service_role;

ALTER TABLE public.song_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are publicly readable"
ON public.song_ratings FOR SELECT TO anon USING (true);

CREATE POLICY "Ratings are readable for authenticated"
ON public.song_ratings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own rating"
ON public.song_ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating"
ON public.song_ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating"
ON public.song_ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX song_ratings_song_id_idx ON public.song_ratings (song_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER song_ratings_set_updated_at
BEFORE UPDATE ON public.song_ratings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE VIEW public.song_rating_stats
WITH (security_invoker = true) AS
SELECT song_id,
       round(avg(rating)::numeric, 1) AS avg_rating,
       count(*)::integer AS vote_count
FROM public.song_ratings
GROUP BY song_id;

GRANT SELECT ON public.song_rating_stats TO anon, authenticated, service_role;