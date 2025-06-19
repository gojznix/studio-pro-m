
import { useState, useEffect, useCallback } from "react";
import { Song, Advertisement } from "@/types/music";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getNextContent } from "@/utils/smartSelection";
import { incrementSongPlay, incrementAdPlay, getPlayTracker } from "@/utils/playTracker";
import { songs } from "@/data/songs";
import { advertisements } from "@/data/advertisements";
import AdBanner from "./AdBanner";
import AutoPlayController from "./AutoPlayController";
import ProgressIndicator from "./ProgressIndicator";

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
      setBackgroundPosition(prev => ({
        x: prev.x + 0.3,
        y: prev.y + 0.2
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
    return 'brand' in content && 'magnitude' in content;
  };

  const playContent = useCallback((content: Song | Advertisement) => {
    setCurrentContent(content);
    
    if (isAdvertisement(content)) {
      incrementAdPlay(content.id);
      setTimeRemaining(content.duration);
      toast({
        title: "Advertisement",
        description: `${content.title} by ${content.brand}`,
      });
    } else {
      incrementSongPlay(content.id);
      setTimeRemaining(180); // Default 3 minutes for songs
      toast({
        title: "Now Playing",
        description: `${content.title} by ${content.artist}`,
      });
    }
    
    setIsPlaying(true);
    setPlayTracker(getPlayTracker());
  }, [toast]);

  const handleNext = useCallback(() => {
    const content = getNextContent();
    playContent(content);
  }, [playContent]);

  // Auto-play timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
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
    setIsAutoPlaying(prev => {
      const newValue = !prev;
      if (newValue && !currentContent) {
        // Start auto-play by playing first content
        handleNext();
      }
      toast({
        title: newValue ? "Auto-Play Started" : "Auto-Play Stopped",
        description: newValue ? "Music will play continuously" : "Auto-advance disabled",
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
      title: "Player Restarted",
      description: "Starting fresh playlist",
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
      className="min-h-screen p-8 bg-cover bg-center relative overflow-hidden"
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
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="neon-border-container relative rounded-xl overflow-hidden">
          <div className="neon-border"></div>
          
          <Card className="backdrop-blur-3xl bg-black/30 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] p-6 rounded-xl relative z-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Advertisement Banner */}
                {currentContent && isAdvertisement(currentContent) && (
                  <AdBanner 
                    advertisement={currentContent as Advertisement} 
                    timeRemaining={timeRemaining}
                  />
                )}

                {/* Main Player */}
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                    {currentContent ? currentContent.title : "Auto-Playing Music"}
                  </h2>
                  <p className="text-white/90 text-lg">
                    {currentContent ? 
                      (isAdvertisement(currentContent) ? currentContent.brand : currentContent.artist) 
                      : "Loading next track..."}
                  </p>
                  {currentContent && !isAdvertisement(currentContent) && (
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="text-yellow-400 font-medium">Rating:</span>
                      <span className="text-white font-bold">{currentContent.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Progress Indicator */}
                {currentContent && (
                  <ProgressIndicator 
                    currentContent={currentContent}
                    timeRemaining={timeRemaining}
                    isAdvertisement={isAdvertisement(currentContent)}
                  />
                )}

                {/* Player Controls */}
                <div className="flex items-center justify-center space-x-6 py-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleNext()}
                    className="rounded-full border-white/30 bg-white/15 hover:bg-white/30 backdrop-blur-lg shadow-md"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="default"
                    size="icon"
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="rounded-full bg-green-500/90 hover:bg-green-600/90 backdrop-blur-lg h-14 w-14 shadow-lg border border-green-400/30"
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7" />
                    ) : (
                      <Play className="h-7 w-7 ml-1" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleNext()}
                    className="rounded-full border-white/30 bg-white/15 hover:bg-white/30 backdrop-blur-lg shadow-md"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Auto-Play Controls */}
                <AutoPlayController 
                  isAutoPlaying={isAutoPlaying}
                  onToggleAutoPlay={handleToggleAutoPlay}
                  onRestart={handleRestart}
                />

                {/* Play Statistics */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 rounded-lg bg-white/10 border border-white/20">
                    <h3 className="text-white/90 font-medium mb-1">Songs Played</h3>
                    <p className="text-2xl font-bold text-green-400">{getTotalSongPlays()}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/10 border border-white/20">
                    <h3 className="text-white/90 font-medium mb-1">Ads Played</h3>
                    <p className="text-2xl font-bold text-yellow-400">{getTotalAdPlays()}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Auto-Play Status */}
                <div className="text-center p-4 rounded-lg bg-white/10 border border-white/20">
                  <h3 className="text-white/90 font-medium mb-2">Auto-Play Status</h3>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                    isAutoPlaying ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isAutoPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {isAutoPlaying ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Advertisement Status - keep existing code */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white/90">Ad Performance</h3>
                  <div className="max-h-[200px] overflow-y-auto pr-1 scrollbar-thin space-y-2">
                    {advertisements.map((ad) => {
                      const plays = playTracker.adPlays[ad.id] || 0;
                      const progress = (plays / ad.magnitude) * 100;
                      return (
                        <div
                          key={ad.id}
                          className="p-3 rounded-lg backdrop-blur-md bg-white/10 border border-white/20"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium text-white text-sm">{ad.title}</p>
                            <span className="text-yellow-400 text-sm">{plays}/{ad.magnitude}</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Songs - keep existing code */}
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white/90">Top Songs</h3>
                  <div className="max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                    {songs
                      .filter(song => song.rating >= 8.5)
                      .slice(0, 10)
                      .map((song) => {
                        const plays = playTracker.songPlays[song.id] || 0;
                        return (
                          <div
                            key={song.id}
                            className="flex items-center justify-between p-3 rounded-lg backdrop-blur-md bg-white/10 hover:bg-white/20 transition-colors border border-white/20 mb-2"
                          >
                            <div>
                              <p className="font-medium text-white">{song.title}</p>
                              <p className="text-sm text-white/80">{song.artist}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-center">
                                <span className="text-white/60 text-xs block">Plays</span>
                                <span className="text-white font-bold">{plays}</span>
                              </div>
                              <div className="flex items-center space-x-1 bg-black/30 px-2 py-1 rounded-full">
                                <span className="text-yellow-400 font-medium text-sm">★</span>
                                <span className="text-white font-bold text-sm">{song.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
