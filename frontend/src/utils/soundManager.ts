// src/utils/soundManager.ts

export const playSE = (soundPath: string, volume: number = 0.5) => {
  // 毎回新しいAudioインスタンスを作ることで、高速で連打しても音が重なって気持ちよく鳴るようにします
  const audio = new Audio(soundPath);
  audio.volume = volume;
  audio.play().catch((err) => {
    // ブラウザの自動再生制限などでエラーが出た場合は警告を出すだけにする
    console.warn("Audio play blocked or error:", err);
  });
};