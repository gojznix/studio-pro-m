import { useState, useEffect, useCallback, useRef } from "react";
import { Song, Advertisement } from "@/types/music";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getNextContent } from "@/utils/smartSelection";
import { incrementSongPlay, incrementAdPlay, getPlayTracker } from "@/utils/playTracker";
import { fetchSongs, fetchAdvertisements } from "@/utils/library";
import AdBanner from "./AdBanner";
import AutoPlayController from "./AutoPlayController";
import ProgressIndicator from "./ProgressIndicator";
import PlayerControls from "./PlayerControls";
import PlayStatistics from "./PlayStatistics";
import PlayerSidebar from "./PlayerSidebar";
import PlayerHeader from "./PlayerHeader";
import Footer from "./Footer";
import studioLogo from "@/assets/studio-logo.png";
import { Loader2 } from "lucide-react";

const MusicPlayer = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [currentContent, setCurrentContent] = useState<Song | Advertisement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [playTracker, setPlayTracker] = useState(getPlayTracker());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load library from backend
  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([fetchSongs(), fetchAdvertisements()]);
        setSongs(s);
        setAdvertisements(a);
      } catch (err) {
        toast({
          title: "Napaka pri nalaganju knjižnice",
          description: String(err),
          variant: "destructive",
        });
      } finally {
        setLibraryLoading(false);
      }
    };
    load();
  }, [toast]);

  // Background animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundPosition((prev) => ({
        x: prev.x + 0.3,
        y: prev.y + 0.2,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Refresh play tracker periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTracker(getPlayTracker());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const isAdvertisement = (content: Song | Advertisement): content is Advertisement => {
    return "brand" in content && "magnitude" in content;
  };

  const playContent = useCallback(
    (content: Song | Advertisement) => {
      setCurrentContent(content);
      setCurrentTime(0);
      setDuration(content.duration || 0);

      if (isAdvertisement(content)) {
        incrementAdPlay(content.id);
        toast({
          title: "Sponzorirana vsebina",
          description: `${content.title} od ${content.brand}`,
        });
      } else {
        incrementSongPlay(content.id);
        toast({
          title: "Trenutno predvajano:",
          description: `${content.title} od ${content.artist}`,
        });
      }

      setPlayTracker(getPlayTracker());
      setIsPlaying(true);
    },
    [toast]
  );

  const handleNext = useCallback(() => {
    if (songs.length === 0) return;
    const content = getNextContent(songs, advertisements);
    playContent(content);
  }, [songs, advertisements, playContent]);

  // Audio element lifecycle
  useEffect(() => {
    const audio = document.createElement("audio");
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (isAutoPlaying) {
        handleNext();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    const onError = () => {
      toast({
        title: "Napaka predvajanja",
        description: "Posnetka ni bilo mogoče naložiti.",
        variant: "destructive",
      });
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audioRef.current = null;
    };
  }, [handleNext, isAutoPlaying, toast]);

  // Load new source when content changes
  useEffect(() => {
    if (!audioRef.current || !currentContent) return;
    audioRef.current.src = currentContent.audioUrl;
    audioRef.current.load();
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentContent]);

  // Toggle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const handlePlay = () => {
    if (!currentContent) {
      handleNext();
    } else {
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleToggleAutoPlay = () => {
    setIsAutoPlaying((prev) => {
      const newValue = !prev;
      if (newValue && !currentContent) {
        handleNext();
      } else if (!newValue) {
        setIsPlaying(false);
      }
      toast({
        title: newValue ? "Samodejno predvajanje - Zagnano" : "Samodejno predvajanje - Ustavljeno",
        description: newValue ? "Glasba se bo predvajala nemoteno" : "Izklopi samodejno nadaljevanje",
      });
      return newValue;
    });
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentContent(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (isAutoPlaying) {
      handleNext();
    }
    toast({
      title: "Predvajalnik se je znova zagnal",
      description: "Začenjamo s svežo playlisto",
    });
  };

  // Auto-start once library is loaded
  useEffect(() => {
    if (libraryLoading || songs.length === 0 || currentContent) return;
    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
      handleNext();
    }, 1000);

    return () => clearTimeout(timer);
  }, [libraryLoading, songs, currentContent, handleNext]);

  const getTotalSongPlays = () => {
    return Object.values(playTracker.songPlays).reduce((sum, plays) => sum + plays, 0);
  };

  const getTotalAdPlays = () => {
    return Object.values(playTracker.adPlays).reduce((sum, plays) => sum + plays, 0);
  };

  if (libraryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: "url('https://source.unsplash.com/1600x900/?dark,forest,abstract')",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0 bg-[#0d1f15]/80 -z-10"
        style={{
          backgroundImage: `radial-gradient(circle at ${backgroundPosition.x % 100}% ${backgroundPosition.y % 100}%, rgba(16, 65, 47, 0.6) 0%, rgba(8, 24, 19, 0.8) 70%)`,
          transition: "background-position 0.5s ease",
        }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="neon-border-container relative rounded-xl overflow-hidden">
          <div className="neon-border"></div>

          <Card className="bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 border border-zinc-700/50 shadow-2xl p-8 rounded-xl relative z-10 min-h-[85vh] flex flex-col">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <img
                src={studioLogo}
                alt="Studio Pro M"
                className="h-16 object-contain animate-logo-glow drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]"
              />
              <div className="w-full max-w-md h-px bg-zinc-700/50 mt-6 mb-[50px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Main Player */}
                <PlayerHeader
                  currentContent={currentContent}
                  isAdvertisement={currentContent ? isAdvertisement(currentContent) : false}
                />

                {/* Progress Indicator */}
                {currentContent && (
                  <ProgressIndicator
                    currentContent={currentContent}
                    currentTime={currentTime}
                    duration={duration}
                    isAdvertisement={isAdvertisement(currentContent)}
                  />
                )}

                {/* Player Controls */}
                <PlayerControls isPlaying={isPlaying} onPlay={handlePlay} onPause={handlePause} onNext={handleNext} />

                {/* Auto-Play Controls */}
                <AutoPlayController
                  isAutoPlaying={isAutoPlaying}
                  onToggleAutoPlay={handleToggleAutoPlay}
                  onRestart={handleRestart}
                />

                {/* Play Statistics */}
                <PlayStatistics totalSongPlays={getTotalSongPlays()} totalAdPlays={getTotalAdPlays()} />

                {/* Advertisement Banner */}
                {currentContent && isAdvertisement(currentContent) && (
                  <AdBanner advertisement={currentContent as Advertisement} currentTime={currentTime} />
                )}
              </div>

              {/* Sidebar */}
              <PlayerSidebar isAutoPlaying={isAutoPlaying} playTracker={playTracker} songs={songs} advertisements={advertisements} />
            </div>

            {/* Footer */}
            <Footer />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
