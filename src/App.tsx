import { useEffect, useMemo, useState } from "react";
import StartScreen from "./components/StartScreen";
import WaitingShow from "./components/WaitingShow";
import type { WaitingLine } from "./components/WaitingShow";
import PatienceVideo from "./components/PatienceVideo";
import CodesScreen from "./components/CodesScreen";

type Step = "start" | "waiting" | "video" | "codes";

const LS_KEY = "giftUnlocked";

const PHRASES = [
  "Готов ли ты к приобретению заслуженного дара?",
  "Всё, что ты хотел бы получить, но достоин ли?",
  "Контролируй свои желания, овладей ими.",
  "Терпение ведёт к спокойствию, а спокойствие к умиротворению.",
  "Свобода или время? Временная свобода или свободное время?",
  "Выбор за тобой, но поступать следует обдуманно.",
  "Вкуси же плоды, собранные теми, кто верен тебе.",
];

// Важно: длина SECRET должна совпадать с количеством строк
const SECRET = "нуисоси";

const CODES = ["PSN-XXXX-XXXX-XXXX", "PSN-YYYY-YYYY-YYYY"];

function buildLines(phrases: string[], secret: string): WaitingLine[] {
  return phrases.map((text, i) => {
    const target = (secret[i] ?? "").toLowerCase();
    const idx = target ? text.toLowerCase().indexOf(target) : -1;

    return {
      text,
      highlightIndex: idx >= 0 ? idx : 0,
    };
  });
}

export default function App() {
  const [step, setStep] = useState<Step>("start");

  const waitingLines = useMemo(() => buildLines(PHRASES, SECRET), []);

  useEffect(() => {
    const unlocked = localStorage.getItem(LS_KEY) === "1";
    if (unlocked) setStep("codes");
  }, []);

  const unlock = () => {
    localStorage.setItem(LS_KEY, "1");
    setStep("codes");
  };

  const reset = () => {
    localStorage.removeItem(LS_KEY);
    setStep("start");
  };

  if (step === "waiting") {
    return <WaitingShow lines={waitingLines} onDone={() => setStep("video")} />;
  }

  if (step === "video") {
    return <PatienceVideo src="/captain.mp4" onEnded={unlock} />;
  }

  return (
    <div className="container">
      <div className="card">
        {step === "start" && <StartScreen onStart={() => setStep("waiting")} />}
        {step === "codes" && <CodesScreen codes={CODES} onReset={reset} />}
      </div>
    </div>
  );
}