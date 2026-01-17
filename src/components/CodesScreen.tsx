import { useState } from "react";

function CopyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CodesScreen({
  codes,
  // onReset,
}: {
  codes: string[];
  onReset?: () => void;
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyOne = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex((cur) => (cur === index ? null : cur));
      }, 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <h1>Вот твой подарок 🎉</h1>
      <p>Коды для PSN аккаунта:</p>

      <div className="codesList" role="list">
        {codes.map((code, i) => (
          <div className="codeRow" key={`${code}-${i}`} role="listitem">
            <div className="codeText">{code}</div>

            <button
              className="copyBtn"
              onClick={() => copyOne(code, i)}
              aria-label={`Скопировать код ${i + 1}`}
              title="Скопировать"
            >
              <CopyIcon />
              <span className={`copiedBadge ${copiedIndex === i ? "show" : ""}`}>
                Скопировано ✅
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* {onReset && (
        <button className="resetLink" onClick={onReset}>
          Reset (для теста)
        </button>
      )} */}
    </div>
  );
}