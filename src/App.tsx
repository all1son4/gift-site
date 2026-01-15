import { useEffect, useState } from "react";
import StartScreen from "./components/StartScreen";
import WaitingShow from "./components/WaitingShow";
import PatienceVideo from "./components/PatienceVideo";
import CodesScreen from "./components/CodesScreen";

type Step = "start" | "waiting" | "video" | "codes";

const LS_KEY = "giftUnlocked";

const PHRASES = [
  "Подключаемся к серверам Санта-Щ.И.Т.",
  "Проверяем уровень твоей выдержки…",
  "Сверяем протоколы терпения…",
  "Почти готово. Но не торопись 🙂",
  "Последняя проверка…",
  "Секундочку…",
  "Ну всё, сейчас появится подарок…",
];

const CODES = ["PSN-XXXX-XXXX-XXXX", "PSN-YYYY-YYYY-YYYY"];

export default function App() {
  const [step, setStep] = useState<Step>("start");

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

  // FULLSCREEN этап с большими фразами
  if (step === "waiting") {
    return <WaitingShow phrases={PHRASES} onDone={() => setStep("video")} />;
  }

  // FULLSCREEN видео без текста/рамок
  if (step === "video") {
    return <PatienceVideo src="/captain.mp4" onEnded={unlock} />;
  }

  // Старт и коды — в карточке
  return (
    <div className="container">
      <div className="card">
        {step === "start" && <StartScreen onStart={() => setStep("waiting")} />}
        {step === "codes" && <CodesScreen codes={CODES} onReset={reset} />}
      </div>
    </div>
  );
}