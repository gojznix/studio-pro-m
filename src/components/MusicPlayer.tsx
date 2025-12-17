import { useState, useEffect, useCallback } from "react";
import { Song, Advertisement } from "@/types/music";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getNextContent } from "@/utils/smartSelection";
import { incrementSongPlay, incrementAdPlay, getPlayTracker } from "@/utils/playTracker";
import AdBanner from "./AdBanner";
import AutoPlayController from "./AutoPlayController";
import ProgressIndicator from "./ProgressIndicator";
import PlayerControls from "./PlayerControls";
import PlayStatistics from "./PlayStatistics";
import PlayerSidebar from "./PlayerSidebar";
import PlayerHeader from "./PlayerHeader";
import studioLogo from "@/assets/studio-logo.png";

const MusicPlayer = () => {
  const [currentContent, setCurrentContent] = useState<Song | Advertisement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
  const [playTracker, setPlayTracker] = useState(getPlayTracker());
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundPosition((prev) => ({
        x: prev.x + 0.3,
        y: prev.y + 0.2,
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

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

      if (isAdvertisement(content)) {
        incrementAdPlay(content.id);
        setTimeRemaining(content.duration);
        toast({
          title: "Sponzorirana vsebina",
          description: `${content.title} od ${content.brand}`,
        });
      } else {
        incrementSongPlay(content.id);
        setTimeRemaining(180); // Default 3 minutes for songs
        toast({
          title: "Trenutno predvajano:",
          description: `${content.title} od ${content.artist}`,
        });
      }

      setIsPlaying(true);
      setPlayTracker(getPlayTracker());
    },
    [toast],
  );

  const handleNext = useCallback(() => {
    const content = getNextContent();
    playContent(content);
  }, [playContent]);

  // Auto-play timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (isAutoPlaying) {
              // Auto-advance to next content
              setTimeout(() => handleNext(), 100);
            } else {
              setIsPlaying(false);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeRemaining, isAutoPlaying, handleNext]);

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
        // Start auto-play by playing first content
        handleNext();
      }
      toast({
        title: newValue ? "Samodejno predvajanje - Zagnano" : "Samodejno predvajanje - Ustavljeno",
        description: newValue ? "Glasba se bo predvajala nemoteno" : "Izklopi samodejno nadaljevanje",
      });
      return newValue;
    });
  };

  const handleRestart = () => {
    setCurrentContent(null);
    setIsPlaying(false);
    setTimeRemaining(0);
    if (isAutoPlaying) {
      handleNext();
    }
    toast({
      title: "Predvajalnik se je znova zagnal",
      description: "Začenjamo s svežo playlisto",
    });
  };

  // Auto-start when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!currentContent) {
        setIsAutoPlaying(true);
        handleNext();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getTotalSongPlays = () => {
    return Object.values(playTracker.songPlays).reduce((sum, plays) => sum + plays, 0);
  };

  const getTotalAdPlays = () => {
    return Object.values(playTracker.adPlays).reduce((sum, plays) => sum + plays, 0);
  };

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

          <Card className="bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950 border border-zinc-700/50 shadow-2xl p-8 rounded-xl relative z-10 min-h-[85vh]">
            {/* Logo */}
            <div className="flex flex-col items-center">
              <img src={studioLogo} alt="Studio Pro M" className="h-16 object-contain" />
              <div className="w-full max-w-md h-px bg-zinc-700/50 mt-6 mb-[50px]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    timeRemaining={timeRemaining}
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

                {/* Advertisement Banner - moved to bottom */}
                {currentContent && isAdvertisement(currentContent) && (
                  <AdBanner advertisement={currentContent as Advertisement} timeRemaining={timeRemaining} />
                )}
              </div>

              {/* Sidebar */}
              <PlayerSidebar isAutoPlaying={isAutoPlaying} playTracker={playTracker} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
