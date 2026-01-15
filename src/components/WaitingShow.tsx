import { useEffect, useRef, useState } from "react";

export default function WaitingShow({
  phrases,
  onDone,
}: {
  phrases: string[];
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  // тайминги (мс) — можешь подкрутить
  const fadeIn = 900;
  const visible = 1400;
  const fadeOut = 700;
  const gap = 250;

  const totalPerPhrase = fadeIn + visible + fadeOut + gap;
  const totalDuration = totalPerPhrase * phrases.length;

  const rafRef = useRef<number | null>(null);

  // Плавный общий прогресс от 0 до 100
  useEffect(() => {
    const start = performance.now();

    const frame = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(100, (elapsed / totalDuration) * 100);
      setProgress(p);

      if (p < 100) {
        rafRef.current = requestAnimationFrame(frame);
      }
    };

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [totalDuration]);

  // Переключение фраз + fade in/out
  useEffect(() => {
    let t1: number | undefined;
    let t2: number | undefined;
    let t3: number | undefined;

    setShow(false);

    t1 = window.setTimeout(() => setShow(true), 120);
    t2 = window.setTimeout(() => setShow(false), fadeIn + visible);
    t3 = window.setTimeout(() => {
      if (idx >= phrases.length - 1) onDone();
      else setIdx((v) => v + 1);
    }, fadeIn + visible + fadeOut + gap);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [idx, phrases.length, onDone]);

  return (
    <div className="waitingStage">
      <div className="waitingInner">
        <h2 className={`bigPhrase ${show ? "show" : ""}`}>{phrases[idx]}</h2>
      </div>

      <div className="progressWrap" aria-label="Loading progress">
        <div
          className="progressFill"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </div>
  );
}