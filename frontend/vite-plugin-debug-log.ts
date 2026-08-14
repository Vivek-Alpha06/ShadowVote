import type { Plugin } from 'vite';
import { appendFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Dev-only endpoint that writes the browser's activity log to a file on disk.
 *
 * Diagnosing a stall in the wallet/proving pipeline otherwise requires the
 * person at the browser to copy console output by hand. This lets the running
 * app report what it is doing directly, so the log can be read from the repo.
 *
 * Dev server only — never part of a production build.
 */
export function debugLogPlugin(): Plugin {
  const logPath = fileURLToPath(new URL('./shadowvote-debug.log', import.meta.url));

  return {
    name: 'shadowvote-debug-log',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__shadowvote-log', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('POST only');
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
          if (body.length > 2_000_000) req.destroy(); // don't buffer forever
        });

        req.on('end', () => {
          try {
            const { reset, text } = JSON.parse(body) as { reset?: boolean; text: string };
            const stamp = new Date().toISOString();
            if (reset) {
              writeFileSync(logPath, `=== run started ${stamp} ===\n${text}\n`, 'utf8');
            } else {
              appendFileSync(logPath, `${text}\n`, 'utf8');
            }
            res.statusCode = 204;
            res.end();
          } catch (err) {
            res.statusCode = 400;
            res.end(String(err));
          }
        });
      });
    },
  };
}
