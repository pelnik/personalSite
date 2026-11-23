import React, { useEffect, useState } from 'react';
import { SiteContentContainer } from '..';
import { fetchDiagnostics, type Diagnostics as DiagnosticsData } from './diagnosticsApi';
import { formatDate, formatDuration, formatGB, formatMB, percent } from './format';

const frontendCommit = import.meta.env.VITE_BUILD_COMMIT || null;
const frontendBuiltAt = import.meta.env.VITE_BUILD_TIME || null;
const commitUrl = 'https://github.com/pelnik/personalSite/commit/';

function Commit({ sha, date }: { sha: string | null; date: string | null }) {
  if (!sha) return <>Unknown</>;
  return (
    <>
      <a href={commitUrl + sha}>{sha}</a>
      {date && <> · <time dateTime={date}>{formatDate(date)}</time></>}
    </>
  );
}

function UsageBar({ used, total }: { used: number; total: number }) {
  const usage = percent(used, total);
  const level = usage >= 90 ? 'bad' : usage >= 75 ? 'warn' : '';
  return (
    <div className="diagnostics-bar-track" aria-hidden="true">
      <div className={`diagnostics-bar ${level}`} style={{ width: `${usage}%` }} />
    </div>
  );
}

function ServerDetails({ data }: { data: DiagnosticsData }) {
  const { status, databases, memoryMB, diskGB, server, eventLoopDelayMs, versions, tls } = data;
  const systemUsed = memoryMB.systemTotal - memoryMB.systemAvailable;
  const { restartLimit } = memoryMB;

  return (
    <>
      <section className="diagnostics-section">
        <h2>Status</h2>
        <dl className="diagnostics-rows">
          <dt>Overall</dt>
          <dd className={`diagnostics-status-${status}`}>{status}</dd>
          {Object.entries(databases).map(([name, { status, latencyMs }]) => (
            <React.Fragment key={name}>
              <dt>{name}</dt>
              <dd>
                <span className={`diagnostics-status-${status}`}>{status}</span>
                {latencyMs !== null && ` · ${latencyMs} ms`}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      </section>

      <section className="diagnostics-section">
        <h2>Memory</h2>
        <dl className="diagnostics-rows">
          <dt>System used</dt>
          <dd>
            {formatMB(systemUsed)} of {formatMB(memoryMB.systemTotal)}
            <UsageBar used={systemUsed} total={memoryMB.systemTotal} />
          </dd>
          <dt>Process RSS</dt>
          <dd>
            {formatMB(memoryMB.processRss)}
            {restartLimit !== null && (
              <>
                {' of '}{formatMB(restartLimit)}
                <UsageBar used={memoryMB.processRss} total={restartLimit} />
              </>
            )}
          </dd>
          <dt>Heap used</dt>
          <dd>
            {formatMB(memoryMB.heapUsed)} of {formatMB(memoryMB.heapLimit)}
            <UsageBar used={memoryMB.heapUsed} total={memoryMB.heapLimit} />
          </dd>
        </dl>
      </section>

      {diskGB && (
        <section className="diagnostics-section">
          <h2>Disk</h2>
          <dl className="diagnostics-rows">
            <dt>Available</dt>
            <dd>
              {formatGB(diskGB.available)} of {formatGB(diskGB.total)}
              <UsageBar used={diskGB.total - diskGB.available} total={diskGB.total} />
            </dd>
          </dl>
        </section>
      )}

      <section className="diagnostics-section">
        <h2>Server</h2>
        <dl className="diagnostics-rows">
          <dt>Node version</dt>
          <dd>{server.nodeVersion}</dd>
          <dt>Platform / architecture</dt>
          <dd>{server.platform} / {server.arch}</dd>
          <dt>CPUs</dt>
          <dd>{server.cpuCount}</dd>
          <dt>Load average (1/5/15 min)</dt>
          <dd>{server.loadAverage.map((load) => load.toFixed(2)).join(' / ')}</dd>
          <dt>System uptime</dt>
          <dd>{formatDuration(server.systemUptimeSeconds)}</dd>
          <dt>Process uptime</dt>
          <dd>{formatDuration(server.processUptimeSeconds)}</dd>
          <dt>Event loop delay (p50/p99)</dt>
          <dd>{eventLoopDelayMs.p50} ms / {eventLoopDelayMs.p99} ms</dd>
        </dl>
      </section>

      <section className="diagnostics-section">
        <h2>Deploy</h2>
        <dl className="diagnostics-rows">
          <dt>Server commit</dt>
          <dd><Commit sha={versions.serverCommit} date={versions.serverCommittedAt} /></dd>
          <dt>Frontend commit</dt>
          <dd><Commit sha={frontendCommit} date={frontendBuiltAt} /></dd>
          {frontendCommit && versions.serverCommit && frontendCommit !== versions.serverCommit && (
            <>
              <dt>Warning</dt>
              <dd className="diagnostics-warning">Frontend and server are on different commits</dd>
            </>
          )}
        </dl>
      </section>

      {tls && (
        <section className="diagnostics-section">
          <h2>TLS</h2>
          <dl className="diagnostics-rows">
            <dt>Protocol</dt>
            <dd>{tls.protocol}</dd>
            <dt>Certificate expiry</dt>
            <dd>
              <time dateTime={tls.certificateExpires}>{formatDate(tls.certificateExpires)}</time>
            </dd>
          </dl>
        </section>
      )}
    </>
  );
}

function ConnectionDetails({ visitor, clockOffset }: {
  visitor: DiagnosticsData['visitor'] | undefined;
  clockOffset: number | null;
}) {
  return (
    <section className="diagnostics-section">
      <h2>Your connection</h2>
      <dl className="diagnostics-rows">
        {visitor && (
          <>
            <dt>IP</dt>
            <dd>{visitor.ip ?? 'Unknown'}</dd>
            <dt>HTTPS</dt>
            <dd>{visitor.secure ? 'Yes' : 'No'}</dd>
            <dt>HTTP version</dt>
            <dd>{visitor.httpVersion}</dd>
            <dt>User agent</dt>
            <dd>{visitor.userAgent ?? 'Unknown'}</dd>
          </>
        )}
        <dt>Time zone</dt>
        <dd>{Intl.DateTimeFormat().resolvedOptions().timeZone}</dd>
        <dt>Language</dt>
        <dd>{navigator.language}</dd>
        <dt>Viewport</dt>
        <dd>{window.innerWidth}×{window.innerHeight} @ {window.devicePixelRatio}x</dd>
        {clockOffset !== null && (
          <>
            <dt>Clock offset</dt>
            <dd>{clockOffset > 0 ? '+' : ''}{clockOffset} s</dd>
          </>
        )}
      </dl>
    </section>
  );
}

export default function Diagnostics() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roundTripMs, setRoundTripMs] = useState(0);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(signal?: AbortSignal) {
    try {
      const result = await fetchDiagnostics(signal);
      if (signal?.aborted) return;
      setData(result.data);
      setRoundTripMs(result.roundTripMs);
      setFetchedAt(new Date());
      setError(null);
    } catch (error) {
      if (signal?.aborted) return;
      setData(null);
      setFetchedAt(null);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }

  useEffect(() => {
    document.title = 'Diagnostics - Matthew Pelnik';
    const controller = new AbortController();
    // Strict Mode re-runs the mount effect in development. Cleanup cancels
    // the first scheduled load before it can send a duplicate request.
    const timer = window.setTimeout(() => void load(controller.signal), 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, []);

  function refresh() {
    setLoading(true);
    void load();
  }

  const clockOffset = data && fetchedAt
    ? Math.round((fetchedAt.getTime() - Date.parse(data.generatedAt) - roundTripMs / 2) / 1000)
    : null;

  return (
    <SiteContentContainer>
      <div className="diagnostics-page">
        <div className="diagnostics-header">
          <h1>Diagnostics</h1>
          <button type="button" onClick={refresh} disabled={loading}>Refresh</button>
          <p role="status">
            {loading ? 'Fetching diagnostics…' : fetchedAt && (
              <>Fetched <time dateTime={fetchedAt.toISOString()}>{fetchedAt.toLocaleTimeString()}</time>
                {' · '}{roundTripMs} ms</>
            )}
          </p>
        </div>
        {error && (
          <div className="diagnostics-section">
            <p role="alert">Couldn't reach the server: {error}</p>
            <dl className="diagnostics-rows">
              <dt>Frontend commit</dt>
              <dd><Commit sha={frontendCommit} date={frontendBuiltAt} /></dd>
            </dl>
          </div>
        )}
        {data && <ServerDetails data={data} />}
        <ConnectionDetails visitor={data?.visitor} clockOffset={clockOffset} />
      </div>
    </SiteContentContainer>
  );
}
