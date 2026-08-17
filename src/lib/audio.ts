export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("audio/")) {
      reject(new Error("Datoteka ni zvočna"));
      return;
    }

    const audio = document.createElement("audio");
    const objectUrl = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.round(audio.duration));
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Ni bilo mogoče prebrati trajanja posnetka"));
    });

    audio.preload = "metadata";
    audio.src = objectUrl;
  });
};

export const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};
