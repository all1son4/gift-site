import React, { useEffect, useMemo, useRef, useState } from "react";

export type WaitingLine = {
  text: string;
  highlightIndex: number;
};

function LineGrid({
  text,
  highlightIndex,
  midStyle,
  revealSecret,
}: {
  text: string;
  highlightIndex: number;
  midStyle?: React.CSSProperties;
  revealSecret: boolean;
}) {
  const safeIndex =
    highlightIndex >= 0 && highlightIndex < text.length ? highlightIndex : 0;

  const left = text.slice(0, safeIndex);
  const mid = text[safeIndex];
  const right = text.slice(safeIndex + 1);

  return (
    <div className="lineGrid">
      <span className="lineLeft">{left}</span>
      <span
        className={`lineMid ${revealSecret ? "lineMidRed" : "lineMidDim"}`}
        style={midStyle}
      >
        {mid}
      </span>
      <span className="lineRight">{right}</span>
    </div>
  );
}

export default function WaitingShow({
  lines,
  onDone,
}: {
  lines: WaitingLine[];
  onDone: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [revealSecret, setRevealSecret] = useState(false);

  // тайминги
  const firstDelayMs = 200;
  const revealEveryMs = 2600; // чтение строки
  const gapBeforeNextMs = 600; // пауза перед следующей
  const finalHoldMs = 5200; // после того как буквы покраснели

  const stepMs = revealEveryMs + gapBeforeNextMs;

  // полоса должна закончиться ровно к переходу на видео
  const totalDuration = useMemo(() => {
    return (
      firstDelayMs + (lines.length - 1) * stepMs + revealEveryMs + finalHoldMs
    );
  }, [lines.length, stepMs]);

  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    timeoutsRef.current = [];

    setVisibleCount(0);
    setRevealSecret(false);

    // 1) первая строка
    timeoutsRef.current.push(
      window.setTimeout(() => setVisibleCount(1), firstDelayMs),
    );

    // 2) остальные строки
    for (let i = 2; i <= lines.length; i += 1) {
      timeoutsRef.current.push(
        window.setTimeout(
          () => setVisibleCount(i),
          firstDelayMs + (i - 1) * stepMs,
        ),
      );
    }

    // последняя строка появилась
    const lastAppearsAt = firstDelayMs + (lines.length - 1) * stepMs;

    // 3) красим буквы ПОСЛЕ прочтения последней строки
    const revealSecretAt = lastAppearsAt + revealEveryMs;
    timeoutsRef.current.push(
      window.setTimeout(() => setRevealSecret(true), revealSecretAt),
    );

    // 4) переход на видео
    timeoutsRef.current.push(
      window.setTimeout(onDone, revealSecretAt + finalHoldMs),
    );

    return () => {
      timeoutsRef.current.forEach((t) => window.clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [lines.length, onDone, stepMs]);

  return (
    <div className="waitingStage">
      {/* Это “канвас”, который на мобилке будет скейлиться CSS-ом */}
      <div className="waitingCanvas">
        <div className="linesStack">
          {lines.map((line, idx) => (
            <div key={idx} className={`line ${idx < visibleCount ? "show" : ""}`}>
              <LineGrid
                text={line.text}
                highlightIndex={line.highlightIndex}
                revealSecret={revealSecret}
                midStyle={
                  idx === 3
                    ? { padding: "0 2px 0 6px" } // 4-я строка
                    : idx === 6
                    ? { padding: "0 6px 0 2px" } // 7-я строка
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="progressWrap" aria-label="Loading progress">
        <div
          className="progressFill animate"
          style={
            {
              ["--waitDuration" as any]: `${totalDuration}ms`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}