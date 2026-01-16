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

// длина SECRET должна совпадать с количеством строк
const SECRET = "нуисоси";

const CODES = ["PSN-XXXX-XXXX-XXXX", "PSN-YYYY-YYYY-YYYY"];

function useMediaQuery(query: string) {
  const get = () =>
    typeof window !== "undefined" &&
    typeof window.matchMedia !== "undefined" &&
    window.matchMedia(query).matches;

  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const m = window.matchMedia(query);

    const onChange = () => setMatches(m.matches);
    onChange();

    if (m.addEventListener) m.addEventListener("change", onChange);
    else m.addListener(onChange);

    return () => {
      if (m.removeEventListener) m.removeEventListener("change", onChange);
      else m.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

const WORD_CH_RE = /[0-9A-Za-zА-Яа-яЁё]/;
const isWordChar = (ch: string) => WORD_CH_RE.test(ch);

/**
 * Выбираем "лучший" индекс нужной буквы:
 * - предпочитаем букву ВНУТРИ слова (слева и справа буква)
 * - и ближе к центру строки (красивее переносы)
 * - сильно штрафуем позиции на пробелах/границах, чтобы не было "н е" / "у вы"
 */
function findBestIndexForMobile(text: string, target: string) {
  const t = (target || "").toLowerCase();
  const lower = text.toLowerCase();
  if (!t) return 0;

  const hits: number[] = [];
  for (let i = 0; i < lower.length; i += 1) {
    if (lower[i] === t) hits.push(i);
  }
  if (hits.length === 0) return 0;

  const center = Math.floor(lower.length / 2);

  const score = (i: number) => {
    const prev = i > 0 ? lower[i - 1] : "";
    const next = i + 1 < lower.length ? lower[i + 1] : "";

    const prevIsWord = prev && isWordChar(prev);
    const nextIsWord = next && isWordChar(next);

    // базово: ближе к центру = лучше
    let s = 0;
    s -= Math.abs(i - center) * 2;

    // прям супер-важно: внутри слова (иначе будет "н е")
    if (prevIsWord && nextIsWord) s += 120;
    else if (prevIsWord || nextIsWord) s += 10;
    else s -= 200; // буква между пробелами/пунктуацией — фу

    // не слишком близко к краям строки
    if (i < 3 || i > lower.length - 4) s -= 80;

    // чтобы лево/право не были микроскопическими кусками
    const leftLen = i;
    const rightLen = lower.length - i - 1;
    if (leftLen < 6) s -= 40;
    if (rightLen < 6) s -= 40;

    return s;
  };

  let best = hits[0];
  let bestScore = score(best);

  for (const i of hits) {
    const sc = score(i);
    if (sc > bestScore) {
      bestScore = sc;
      best = i;
    }
  }

  return best;
}

function buildLinesDesktop(phrases: string[], secret: string): WaitingLine[] {
  // ДЕСКТОП НЕ ТРОГАЕМ — как было: первая буква
  return phrases.map((text, i) => {
    const target = (secret[i] ?? "").toLowerCase();
    const idx = target ? text.toLowerCase().indexOf(target) : -1;
    return { text, highlightIndex: idx >= 0 ? idx : 0 };
  });
}

function buildLinesMobile(phrases: string[], secret: string): WaitingLine[] {
  // МОБИЛКА — выбираем "красивую" позицию
  return phrases.map((text, i) => {
    const target = (secret[i] ?? "").toLowerCase();
    return { text, highlightIndex: findBestIndexForMobile(text, target) };
  });
}

export default function App() {
  const [step, setStep] = useState<Step>("start");
  const isMobile = useMediaQuery("(max-width: 520px)");

  const waitingLines = useMemo(() => {
    return isMobile
      ? buildLinesMobile(PHRASES, SECRET)
      : buildLinesDesktop(PHRASES, SECRET);
  }, [isMobile]);

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
    return <WaitingShow lines={waitingLines} onDone={() => null} />;
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