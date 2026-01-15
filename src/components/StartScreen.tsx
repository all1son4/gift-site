export default function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <h1>Подарок ждёт 🎁</h1>
      <p>Нажми кнопку — и мы “подготовим” выдачу кодов.</p>
      <button className="btn" onClick={onStart}>
        Старт / Получить подарок
      </button>
      <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>
        Спойлер: сначала будет тест на терпение.
      </p>
    </div>
  );
}