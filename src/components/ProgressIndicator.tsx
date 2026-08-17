import { Song, Advertisement } from "@/types/music";
import { formatDuration } from "@/lib/audio";

interface ProgressIndicatorProps {
  currentContent: Song | Advertisement;
  currentTime: number;
  duration: number;
  isAdvertisement: boolean;
}

const ProgressIndicator = ({ currentTime, duration, isAdvertisement }: ProgressIndicatorProps) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-white/80 text-sm">
        <span>{formatDuration(Math.min(currentTime, duration))}</span>
        <span>{formatDuration(duration)}</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-200 ${
            isAdvertisement ? "bg-yellow-400" : "bg-green-400"
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
