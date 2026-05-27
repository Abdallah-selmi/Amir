interface Props {
  score: number;
  total: number;
  name?: string;
}

export default function ScoreDisplay({ score, total, name = 'Amir' }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(14px + env(safe-area-inset-top))',
        left: 'calc(14px + env(safe-area-inset-left))',
        background: 'rgba(255,255,255,0.22)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 100,
        padding: '8px 18px',
        fontSize: 'clamp(14px, 4vw, 22px)',
        fontFamily: 'Bubblegum Sans, cursive',
        color: '#FFE347',
        textShadow: '0 2px 8px rgba(155,93,229,0.6)',
        zIndex: 100,
        border: '2px solid rgba(255,255,255,0.4)',
        pointerEvents: 'none',
      }}
    >
      {name}: {score} / {total}
    </div>
  );
}
