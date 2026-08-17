import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Radio } from "lucide-react";
import { getAudioDuration, formatDuration } from "@/lib/audio";
import { DbAdvertisement } from "@/types/music";

const adSchema = z.object({
  title: z.string().min(1, "Naslov je obvezen"),
  brand: z.string().min(1, "Blagovna znamka je obvezna"),
  magnitude: z.coerce.number().min(1, "Cilj mora biti vsaj 1"),
  active: z.boolean().default(true),
  audioFile: z.instanceof(FileList).refine((files) => files.length === 1 && files[0].type === "audio/mpeg", {
    message: "Izberite eno MP3 datoteko",
  }),
  bannerFile: z.instanceof(FileList).optional(),
});

type AdForm = z.infer<typeof adSchema>;

const AdminAds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<DbAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdForm>({
    resolver: zodResolver(adSchema),
    defaultValues: { active: true, magnitude: 50 },
  });

  const active = watch("active");

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await ((supabase as any).from("advertisements"))
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Napaka pri nalaganju", description: error.message, variant: "destructive" });
    } else {
      setAds(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, [toast]);

  const onSubmit = async (values: AdForm) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const audioFile = values.audioFile[0];
      const duration = await getAudioDuration(audioFile);
      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`;

      const { error: audioUploadError } = await supabase.storage.from("audio").upload(audioPath, audioFile, {
        contentType: "audio/mpeg",
      });
      if (audioUploadError) throw audioUploadError;

      let bannerPath: string | null = null;
      const bannerFiles = values.bannerFile;
      if (bannerFiles && bannerFiles.length > 0) {
        const bannerFile = bannerFiles[0];
        const bannerExt = bannerFile.name.split(".").pop() || "jpg";
        bannerPath = `${user.id}/${Date.now()}-banner.${bannerExt}`;
        const { error: bannerUploadError } = await supabase.storage.from("ad-banners").upload(bannerPath, bannerFile, {
          contentType: bannerFile.type || "image/jpeg",
        });
        if (bannerUploadError) throw bannerUploadError;
      }

      const { error: insertError } = await ((supabase as any).from("advertisements")).insert({
        title: values.title,
        brand: values.brand,
        magnitude: values.magnitude,
        active: values.active,
        audio_path: audioPath,
        banner_path: bannerPath,
        duration,
        uploaded_by: user.id,
      });
      if (insertError) throw insertError;

      toast({ title: "Uspeh", description: "Oglas je bil dodan." });
      reset();
      fetchAds();
    } catch (err: any) {
      toast({ title: "Napaka", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ad: DbAdvertisement) => {
    if (!confirm(`Ali res želite izbrisati oglas ${ad.title}?`)) return;
    try {
      const pathsToRemove: string[] = [ad.audio_path];
      if (ad.banner_path) pathsToRemove.push(ad.banner_path);

      const buckets = ["audio", "ad-banners"] as const;
      for (let i = 0; i < pathsToRemove.length; i++) {
        const { error: storageError } = await supabase.storage.from(buckets[i]).remove([pathsToRemove[i]]);
        if (storageError) throw storageError;
      }

      const { error: dbError } = await ((supabase as any).from("advertisements")).delete().eq("id", ad.id);
      if (dbError) throw dbError;

      toast({ title: "Izbrisano", description: "Oglas je bil odstranjen." });
      fetchAds();
    } catch (err: any) {
      toast({ title: "Napaka", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-6 bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-green-400" />
          <h1 className="text-2xl font-bold">Upravljanje oglasov</h1>
        </div>

        <Card className="bg-zinc-900 border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-white">Nov oglas</CardTitle>
            <CardDescription className="text-zinc-400">Naložite MP3 oglas in po želji pasico.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Naslov oglasa</Label>
                  <Input id="title" {...register("title")} className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400" />
                  {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-white">Blagovna znamka</Label>
                  <Input id="brand" {...register("brand")} className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400" />
                  {errors.brand && <p className="text-sm text-red-400">{errors.brand.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="magnitude" className="text-white">Ciljno število predvajanj na dan</Label>
                <Input id="magnitude" type="number" min={1} {...register("magnitude")} className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400" />
                {errors.magnitude && <p className="text-sm text-red-400">{errors.magnitude.message}</p>}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={active}
                  onCheckedChange={(checked) => setValue("active", checked === true)}
                />
                <Label htmlFor="active" className="cursor-pointer text-white">Aktiven oglas</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audioFile" className="text-white">MP3 oglas</Label>
                <Input id="audioFile" type="file" accept="audio/mpeg" {...register("audioFile")} className="bg-zinc-800 border-zinc-700 text-white" />
                {errors.audioFile && <p className="text-sm text-red-400">{errors.audioFile.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerFile" className="text-white">Pasica (opcijsko)</Label>
                <Input id="bannerFile" type="file" accept="image/*" {...register("bannerFile")} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Dodaj oglas
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-700/50">
          <CardHeader>
            <CardTitle className="text-white">Seznam oglasov</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : ads.length === 0 ? (
              <p className="text-white/60">Ni še nobenega oglasa.</p>
            ) : (
              <div className="space-y-3">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <div>
                      <p className="font-medium text-white">{ad.title}</p>
                      <p className="text-sm text-white/70">{ad.brand}</p>
                      <p className="text-xs text-white/50">
                        Trajanje: {formatDuration(ad.duration)} | Cilj: {ad.magnitude} | Status: {ad.active ? "Aktiven" : "Neaktiven"}
                      </p>
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(ad)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAds;
