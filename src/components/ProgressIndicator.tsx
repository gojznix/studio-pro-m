
import { Song, Advertisement } from "@/types/music";

interface ProgressIndicatorProps {
  currentContent: Song | Advertisement;
  timeRemaining: number;
  isAdvertisement: boolean;
}

const ProgressIndicator = ({ currentContent, timeRemaining, isAdvertisement }: ProgressIndicatorProps) => {
  // For songs, we'll use a default duration of 180 seconds (3 minutes)
  const duration = isAdvertisement ? (currentContent as Advertisement).duration : 180;
  const progress = ((duration - timeRemaining) / duration) * 100;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-white/80 text-sm">
        <span>{Math.floor((duration - timeRemaining) / 60)}:{String((duration - timeRemaining) % 60).padStart(2, '0')}</span>
        <span>{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${
            isAdvertisement ? 'bg-yellow-400' : 'bg-green-400'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
