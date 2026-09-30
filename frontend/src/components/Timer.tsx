import { useEffect, useRef, useState } from 'react';
import { timeLeft } from '../lib/format';

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
    <span className={`font-mono text-xs font-semibold ${ended ? 'text-[#2e335b]/50' : 'text-[#2e335b]'}`}>
      {ended ? '⏱ Ended' : `⏱ ${label}`}
    </span>
  );
}
