
import { useState, useEffect } from "react";
import { Song, Advertisement } from "@/types/music";
import { songs } from "@/data/songs";
import { advertisements } from "@/data/advertisements";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, SkipBack, SkipForward, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getNextContent } from "@/utils/smartSelection";
import { incrementSongPlay, incrementAdPlay, getPlayTracker } from "@/utils/playTracker";

const MusicPlayer = () => {
  const [currentContent, setCurrentContent] = useState<Song | Advertisement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
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

  // Update play tracker every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTracker(getPlayTracker());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const isAdvertisement = (content: Song | Advertisement): content is Advertisement => {
    return 'brand' in content && 'magnitude' in content;
  };

  const handlePlay = () => {
    if (!currentContent) {
      const content = getNextContent();
      setCurrentContent(content);
      
      if (isAdvertisement(content)) {
        incrementAdPlay(content.id);
        toast({
          title: "Advertisement",
          description: `${content.title} by ${content.brand}`,
        });
      } else {
        incrementSongPlay(content.id);
        toast({
          title: "Now Playing",
          description: `${content.title} by ${content.artist}`,
        });
      }
      setPlayTracker(getPlayTracker());
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    const content = getNextContent();
    setCurrentContent(content);
    
    if (isAdvertisement(content)) {
      incrementAdPlay(content.id);
      toast({
        title: "Advertisement",
        description: `${content.title} by ${content.brand}`,
      });
    } else {
      incrementSongPlay(content.id);
      toast({
        title: "Now Playing",
        description: `${content.title} by ${content.artist}`,
      });
    }
    setPlayTracker(getPlayTracker());
  };

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
          
          <Card className="backdrop-blur-3xl bg-black/30 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.37)] p-6 rounded-xl relative z-10 
            before:absolute before:inset-0 before:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] 
            before:bg-repeat before:opacity-20 before:mix-blend-overlay before:pointer-events-none">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Player */}
              <div className="lg:col-span-2 space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {currentContent && isAdvertisement(currentContent) && (
                      <Radio className="h-5 w-5 text-yellow-400" />
                    )}
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                      {currentContent ? currentContent.title : "Select a song"}
                    </h2>
                  </div>
                  <p className="text-white/90 text-lg">
                    {currentContent ? 
                      (isAdvertisement(currentContent) ? currentContent.brand : currentContent.artist) 
                      : "---"}
                  </p>
                  {currentContent && !isAdvertisement(currentContent) && (
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="text-yellow-400 font-medium">Rating:</span>
                      <span className="text-white font-bold">{currentContent.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {currentContent && isAdvertisement(currentContent) && (
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="text-blue-400 font-medium">Duration:</span>
                      <span className="text-white font-bold">{currentContent.duration}s</span>
                    </div>
                  )}
                </div>

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

              {/* Sidebar with Songs and Ads */}
              <div className="space-y-6">
                {/* Advertisement Status */}
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

                {/* Top Songs */}
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
