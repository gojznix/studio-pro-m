import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
interface PlayerControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
}
const PlayerControls = ({
  isPlaying,
  onPlay,
  onPause,
  onNext
}: PlayerControlsProps) => {
  return <div className="flex items-center justify-center space-x-6 py-2">
      <Button variant="outline" size="icon" onClick={onNext} className="rounded-full border-white/30 bg-white/15 hover:bg-white/30 backdrop-blur-lg shadow-md">
        <SkipBack className="h-5 w-5" />
      </Button>

      <Button variant="default" size="icon" onClick={isPlaying ? onPause : onPlay} className="rounded-full bg-green-500/90 hover:bg-green-600/90 backdrop-blur-lg h-14 w-14 shadow-lg border border-green-400/30">
        {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
      </Button>

      <Button variant="outline" size="icon" onClick={onNext} className="rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-lg shadow-lg opacity-100 border-teal-50 border">
        <SkipForward className="h-5 w-5" />
      </Button>
    </div>;
};
export default PlayerControls;