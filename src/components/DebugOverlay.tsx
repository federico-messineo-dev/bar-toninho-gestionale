import { useState, useEffect, useRef, useCallback } from 'react';

interface LogEntry {
  id: number;
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

let _id = 0;

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  log: { bg: 'rgba(243,233,215,0.08)', text: '#CBB89F' },
  warn: { bg: 'rgba(217,164,65,0.14)', text: '#E0AE4A' },
  error: { bg: 'rgba(208,117,96,0.15)', text: '#E08770' },
};

const LEVEL_LABELS: Record<string, string> = {
  log: 'LOG',
  warn: 'WARN',
  error: 'ERR',
};

export default function DebugOverlay() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [visible, setVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((level: LogEntry['level'], args: any[]) => {
    const message = args
      .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
      .join(' ');
    const entry: LogEntry = {
      id: ++_id,
      level,
      message: message.slice(0, 500),
      timestamp: new Date().toLocaleTimeString('it-IT', { hour12: false }),
    };
    setLogs((prev) => {
      const next = [...prev, entry];
      return next.length > 200 ? next.slice(-200) : next;
    });
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;

    console.log = (...args: any[]) => {
      origLog.apply(console, args);
      addLog('log', args);
    };
    console.warn = (...args: any[]) => {
      origWarn.apply(console, args);
      addLog('warn', args);
    };
    console.error = (...args: any[]) => {
      origError.apply(console, args);
      addLog('error', args);
    };

    return () => {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    };
  }, [addLog]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!import.meta.env.DEV) return null;
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-auto"
      style={{ maxHeight: '200px', zIndex: 9999 }}
    >
      <div className="flex items-center justify-between px-3 py-1 bg-[#120D0A]/85 border-t border-[#F3E9D7]/10">
        <span className="text-[10px] font-mono text-[#F3E9D7]/50">
          Debug ({logs.length})
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-[10px] font-mono text-[#F3E9D7]/40 hover:text-[#F3E9D7]/80 cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-[10px] font-mono text-[#F3E9D7]/40 hover:text-[#F3E9D7]/80 cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="overflow-y-auto bg-[#120D0A]/80 backdrop-blur-sm border-t border-[#F3E9D7]/5"
        style={{ maxHeight: '170px', WebkitOverflowScrolling: 'touch' }}
      >
        {logs.map((entry) => {
          const colors = LEVEL_COLORS[entry.level];
          return (
            <div
              key={entry.id}
              className="px-3 py-0.5 border-b border-[#F3E9D7]/5 font-mono text-[11px] leading-tight flex gap-2"
              style={{ backgroundColor: colors.bg }}
            >
              <span className="text-[#F3E9D7]/30 shrink-0 w-[70px]">{entry.timestamp}</span>
              <span
                className="shrink-0 w-[32px] font-bold"
                style={{ color: colors.text }}
              >
                {LEVEL_LABELS[entry.level]}
              </span>
              <span className="text-[#F3E9D7]/80 break-all whitespace-pre-wrap">{entry.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
