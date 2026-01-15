import { useEffect, useRef, useState } from "react";

export default function PatienceVideo({
  src,
  onEnded,
}: {
  src: string;
  onEnded: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Пытаемся стартовать СО ЗВУКОМ.
    // Если браузер блокирует — покажем кнопку.
    const tryPlayWithSound = async () => {
      try {
        v.muted = false;
        v.volume = 1;
        await v.play();
        setNeedsTap(false);
      } catch {
        setNeedsTap(true);
      }
    };

    tryPlayWithSound();
  }, []);

  const manualPlay = async () => {
    const v = ref.current;
    if (!v) return;

    try {
      v.muted = false;
      v.volume = 1;
      await v.play();
      setNeedsTap(false);
    } catch {
      setNeedsTap(true);
    }
  };

  return (
    <div className="videoStage">
      <video
        ref={ref}
        src={src}
        playsInline
        controls={false}
        onEnded={onEnded}
        // muted НЕ ставим
      />

      {needsTap && (
        <div className="videoOverlayBtn">
          <button onClick={manualPlay}>Включить видео со звуком</button>
        </div>
      )}
    </div>
  );
}