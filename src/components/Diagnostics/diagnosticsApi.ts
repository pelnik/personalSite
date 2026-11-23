type Status = 'ok' | 'error';

export interface Diagnostics {
  generatedAt: string;
  status: Status;
  server: {
    nodeVersion: string;
    platform: string;
    arch: string;
    cpuCount: number;
    loadAverage: number[];
    systemUptimeSeconds: number;
    processUptimeSeconds: number;
  };
  memoryMB: {
    systemTotal: number;
    systemAvailable: number;
    processRss: number;
    heapUsed: number;
    heapTotal: number;
    heapLimit: number;
    restartLimit: number | null;
  };
  diskGB: { total: number; available: number } | null;
  eventLoopDelayMs: { p50: number; p99: number; max: number };
  databases: Record<string, { status: Status; latencyMs: number | null }>;
  versions: { serverCommit: string | null; serverCommittedAt: string | null };
  tls: { protocol: string; certificateExpires: string } | null;
  visitor: {
    ip: string | null;
    userAgent: string | null;
    httpVersion: string;
    secure: boolean;
  };
}

export async function fetchDiagnostics(signal?: AbortSignal): Promise<{
  data: Diagnostics;
  roundTripMs: number;
}> {
  const start = performance.now();
  const response = await fetch('/api/diagnostics', { signal });
  if (!response.ok) {
    throw new Error(`Server answered ${response.status}`);
  }
  const data: Diagnostics = await response.json();
  return { data, roundTripMs: Math.round(performance.now() - start) };
}
