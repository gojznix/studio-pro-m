interface PlayStatisticsProps {
  totalSongPlays: number;
  totalAdPlays: number;
}

const PlayStatistics = ({ totalSongPlays, totalAdPlays }: PlayStatisticsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="text-center p-4 rounded-lg bg-white/10 border border-white/20">
        <h3 className="text-white/90 font-medium mb-1">Št. predvajanih skladb</h3>
        <p className="text-2xl font-bold text-green-400">{totalSongPlays}</p>
      </div>
      <div className="text-center p-4 rounded-lg bg-white/10 border border-white/20">
        <h3 className="text-white/90 font-medium mb-1">Št. predvajanih oglasov</h3>
        <p className="text-2xl font-bold text-yellow-400">{totalAdPlays}</p>
      </div>
    </div>
  );
};

export default PlayStatistics;
