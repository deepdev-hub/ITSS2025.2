import { useEffect, useMemo, useState } from 'react';

function getRemainingSeconds(expiresAt, now = Date.now()) {
  if (!expiresAt) {
    return null;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) {
    return null;
  }

  return Math.max(0, Math.ceil((expiresAtMs - now) / 1000));
}

function formatRemaining(seconds) {
  if (seconds <= 0) {
    return 'Expired';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function Countdown({ expiresAt, status, label = 'Time left' }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAt]);

  const remainingSeconds = useMemo(() => getRemainingSeconds(expiresAt, now), [expiresAt, now]);

  if (!expiresAt || remainingSeconds === null || (status && status !== 'PENDING')) {
    return null;
  }

  const expired = remainingSeconds <= 0;

  return (
    <span className={`countdown ${expired ? 'countdown-expired' : ''}`}>
      {label ? <span className="countdown-label">{label}:</span> : null}
      <span>{formatRemaining(remainingSeconds)}</span>
    </span>
  );
}
