import React from 'react';

/**
 * Renders load-time and render-time failures on the page.
 *
 * Without this, a throw inside the Midnight SDK's import graph produces a blank
 * white page whose cause is only visible in devtools. The message is written
 * straight into the DOM so it works even when React never mounts.
 */

function describe(err: unknown): string {
  if (err instanceof Error) return `${err.name}: ${err.message}\n\n${err.stack ?? ''}`;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
}

/** Paints an error banner directly into #root, bypassing React. */
export function showFatalError(err: unknown): void {
  const root = document.getElementById('root');
  if (!root) return;
  if (root.querySelector('[data-fatal-error]')) return; // keep the first error

  const text = describe(err);
  const box = document.createElement('div');
  box.setAttribute('data-fatal-error', '');
  box.style.cssText =
    'margin:24px;padding:20px;border:1px solid rgba(244,63,94,.35);border-radius:14px;' +
    'background:rgba(244,63,94,.07);color:#fecdd3;font:13px/1.6 ui-monospace,Menlo,Consolas,monospace;' +
    'white-space:pre-wrap;word-break:break-word;max-width:1000px';

  const title = document.createElement('div');
  title.textContent = '⚠ ShadowVote failed to start';
  title.style.cssText = 'font:700 16px/1.4 system-ui,sans-serif;color:#fff;margin-bottom:10px';

  const body = document.createElement('div');
  body.textContent = text;

  const copy = document.createElement('button');
  copy.textContent = 'Copy error';
  copy.style.cssText =
    'margin-top:14px;padding:7px 14px;border-radius:9px;border:1px solid rgba(255,255,255,.18);' +
    'background:rgba(255,255,255,.06);color:#fff;cursor:pointer;font:600 12px system-ui,sans-serif';
  copy.onclick = () => {
    navigator.clipboard?.writeText(text);
    copy.textContent = '✓ Copied';
  };

  box.append(title, body, copy);
  root.prepend(box);
}

interface State {
  error: unknown;
}

export default class ErrorScreen extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown): void {
    showFatalError(error);
  }

  render() {
    if (this.state.error) return null; // showFatalError already painted it
    return this.props.children;
  }
}
