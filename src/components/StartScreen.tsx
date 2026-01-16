export default function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <h1>Подарок ждёт 🎁</h1>
      <p>Нажми кнопку — и мы начнём подготовку.</p>

      <button className="btn" onClick={onStart}>
        Старт / Получить подарок
      </button>
    </div>
  );
}