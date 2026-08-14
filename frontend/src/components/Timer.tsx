import { useEffect, useRef, useState } from 'react';
import { timeLeft } from '../lib/format';

/**
 * Live countdown. `onEnd` fires once, the moment the deadline passes, so the
 * page can re-read the election and flip to its results without a reload.
 */
export default function Timer({ endTime, onEnd }: { endTime: number; onEnd?: () => void }) {
  const [label, setLabel] = useState(() => timeLeft(endTime));
  const firedRef = useRef(false);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    firedRef.current = Date.now() >= endTime;
    setLabel(timeLeft(endTime));

    const t = setInterval(() => {
      setLabel(timeLeft(endTime));
      if (!firedRef.current && Date.now() >= endTime) {
        firedRef.current = true;
        onEndRef.current?.();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  const ended = label === 'Ended';
  return (
    <span className={`font-mono text-sm ${ended ? 'text-slate-500' : 'text-shadow-cyan'}`}>
      {ended ? '⏱ Voting ended' : `⏱ ${label}`}
    </span>
  );
}
