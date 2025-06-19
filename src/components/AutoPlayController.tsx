
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface AutoPlayControllerProps {
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
  onRestart: () => void;
}

const AutoPlayController = ({ isAutoPlaying, onToggleAutoPlay, onRestart }: AutoPlayControllerProps) => {
  return (
    <div className="flex items-center justify-center space-x-4 mt-4">
      <Button
        variant="outline"
        onClick={onToggleAutoPlay}
        className="bg-white/15 border-white/30 hover:bg-white/25 text-white backdrop-blur-lg"
      >
        {isAutoPlaying ? (
          <>
            <Pause className="h-4 w-4 mr-2" />
            Stop Auto-Play
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Start Auto-Play
          </>
        )}
      </Button>
      
      <Button
        variant="outline"
        onClick={onRestart}
        className="bg-white/15 border-white/30 hover:bg-white/25 text-white backdrop-blur-lg"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Restart
      </Button>
    </div>
  );
};

export default AutoPlayController;
