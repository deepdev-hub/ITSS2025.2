import { useEffect, useState } from 'react';

function getRemainingSeconds(expiresAt) {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return null;
  return Math.floor((expiry - Date.now()) / 1000);
}

function formatCountdown(seconds) {
  if (seconds <= 0) return 'Expired';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function Countdown({ expiresAt, label }) {
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(expiresAt));

  useEffect(() => {
    if (expiresAt == null) return;

    // Recalculate immediately when expiresAt changes
    setRemaining(getRemainingSeconds(expiresAt));

    const interval = setInterval(() => {
      const next = getRemainingSeconds(expiresAt);
      setRemaining(next);
      if (next !== null && next <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // null means expiresAt was absent or invalid — render nothing
  if (remaining === null) return null;

  const isExpired = remaining <= 0;
  const isWarning = !isExpired && remaining < 30;

  let className = 'countdown';
  if (isExpired) className += ' countdown-expired';
  else if (isWarning) className += ' countdown-warning';

  return (
    <span className={className}>
      {label ? <span className="countdown-label">{label} </span> : null}
      {formatCountdown(remaining)}
    </span>
  );
}