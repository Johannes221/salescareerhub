export interface ResumeLogEntry {
  requestId: string;
  event: string;
  provider?: string;
  fileSizeBytes?: number;
  durationMs?: number;
  success?: boolean;
  errorCode?: string;
  rawTextLength?: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  timestamp: string;
}

function formatEntry(entry: ResumeLogEntry): string {
  const parts = [
    `[resume] [${entry.level.toUpperCase()}]`,
    `reqId=${entry.requestId}`,
    `event=${entry.event}`,
  ];
  if (entry.provider) parts.push(`provider=${entry.provider}`);
  if (entry.fileSizeBytes !== undefined) parts.push(`fileSize=${entry.fileSizeBytes}B`);
  if (entry.durationMs !== undefined) parts.push(`duration=${entry.durationMs}ms`);
  if (entry.success !== undefined) parts.push(`success=${entry.success}`);
  if (entry.errorCode) parts.push(`errorCode=${entry.errorCode}`);
  if (entry.rawTextLength !== undefined) parts.push(`textLen=${entry.rawTextLength}`);
  return parts.join(' ');
}

export const resumeLogger = {
  info(requestId: string, event: string, extra?: Partial<ResumeLogEntry>) {
    const entry: ResumeLogEntry = {
      requestId,
      event,
      level: 'info',
      timestamp: new Date().toISOString(),
      ...extra,
    };
    console.log(formatEntry(entry));
  },

  warn(requestId: string, event: string, extra?: Partial<ResumeLogEntry>) {
    const entry: ResumeLogEntry = {
      requestId,
      event,
      level: 'warn',
      timestamp: new Date().toISOString(),
      ...extra,
    };
    console.warn(formatEntry(entry));
  },

  error(requestId: string, event: string, extra?: Partial<ResumeLogEntry>) {
    const entry: ResumeLogEntry = {
      requestId,
      event,
      level: 'error',
      timestamp: new Date().toISOString(),
      ...extra,
    };
    console.error(formatEntry(entry));
  },

  debug(requestId: string, event: string, extra?: Partial<ResumeLogEntry>) {
    if (process.env.LOG_LEVEL === 'debug') {
      const entry: ResumeLogEntry = {
        requestId,
        event,
        level: 'debug',
        timestamp: new Date().toISOString(),
        ...extra,
      };
      console.debug(formatEntry(entry));
    }
  },
};
