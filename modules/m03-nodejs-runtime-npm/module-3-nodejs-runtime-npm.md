# STRATPOINT ENGINEERING TRAINING

## Node.js Foundations — Self-Paced

**Module 3 — Node.js Runtime & npm**

**Time estimate: 6 hours**

**Part 1 of the Node.js Engineering Program**

**Prepares you for Part 2: AI-Assisted Engineering (FlowBoard)**

---

## Module 3: Node.js Runtime & npm

**Time estimate: 6 hours**

### Learning Goals

- Explain what Node.js is: V8 for JavaScript, libuv for I/O, and a set of core APIs on top.
- Describe the single-threaded event loop and the libuv thread pool, and decide when Node is — and is
  not — a good fit for a problem.
- Tell **blocking** work from **non-blocking** work, and explain why blocking the loop stalls every
  connection.
- Work in **ES modules** (not CommonJS): `"type": "module"`, named vs default exports,
  `import.meta.dirname` / `import.meta.filename`, and the `node:` prefix on core imports.
- Reach for the core APIs you will actually use: `node:fs/promises`, `node:path`, `node:os`,
  `node:events`, `node:stream`, `node:http`, `node:crypto`, `node:timers/promises`, and `node:util`.
- Explain **why streams exist** and stream a large file instead of loading it into memory.
- Read `process`: `argv`, `env`, exit codes, and handle `SIGINT` / `SIGTERM` for a clean shutdown.
- Configure a program with environment variables and `.env`, and use `node --env-file`, `node --watch`,
  and `node --run`.
- Use the built-in globals `fetch`, `URL`, `AbortController`, and `structuredClone`.
- Manage dependencies safely with npm: the `package.json` anatomy, semver ranges (`^`, `~`), the
  lockfile, `install` vs `ci`, `update`, `outdated`, scripts, `npx`, dependencies vs
  devDependencies, `engines`, and `npm audit`.
- Apply supply-chain hygiene: vet a package before installing, review lockfile diffs, and know what
  lifecycle scripts do.
- Debug with `console` methods, `node --inspect` and the VS Code debugger, and by reading a stack
  trace.
- Know (awareness only) that the built-in `node:test` runner and `node:sqlite` exist — this course
  uses Jest and Prisma instead, so you do not use either here.

### Concept

Module 2 gave you the language. This module gives you the **runtime the language runs inside**. Node
is not a language and not a framework — it is a JavaScript runtime built from three parts:

- **V8** — the same JavaScript engine Chrome uses. It compiles and runs your `.js`. Everything you
  learned in Module 2 runs here unchanged.
- **libuv** — a C library that does the operating-system work V8 cannot: file access, DNS, network
  sockets, and a pool of background threads for work that would otherwise block.
- **Core APIs** — the `node:*` modules (`node:fs`, `node:http`, `node:stream`, `node:crypto`, …) that
  expose libuv and the OS to your JavaScript.

That combination is why Node can hold thousands of open connections on **one** JavaScript thread.

#### The event loop and the thread pool in one screen

JavaScript runs your code on a **single thread**. It cannot do two things at once. So how does a
server handle many requests? It never *waits* for any of them.

- Your synchronous code runs to completion on the **call stack** — nothing interrupts it.
- When you do I/O (read a file, hit the network), Node hands the work to **libuv** and registers a
  callback. Your code keeps running immediately.
- libuv keeps a small **thread pool** (4 threads by default, set by `UV_THREADPOOL_SIZE`) for work
  that has no OS-level async interface: file-system calls, DNS lookups, `zlib`, `crypto`. Network
  sockets use OS async notifications instead and do not need the pool.
- When the work finishes, the callback is queued back on the loop. The **event loop** picks up
  completed work, runs callbacks, and repeats — forever, until there is nothing left to do.

The consequence is the rule that defines Node: **never block the loop.** A busy synchronous loop (a
huge `JSON.parse`, a tight `for`, a synchronous `fs.readFileSync` of a giant file) freezes *every*
connection, because there is only one thread to freeze.

**When Node is a good fit:** I/O-heavy, many concurrent connections, JSON over the network — APIs,
proxies, real-time apps, CLIs.

**When it is not:** CPU-bound work (video encoding, heavy numeric computing, large in-memory sorts).
That work occupies the one thread. The fix is to move it to a worker thread (`node:worker_threads`) or
to a separate service — not to "make Node faster".

#### Why streams exist

If you `await readFile('app.log')` on a 100 MB file, Node allocates 100 MB *before* you can look at a
single line. Read ten such files and the process dies from memory. A **stream** hands you the data in
small chunks as it arrives: the same file is processed in a few kilobytes at a time, and memory stays
flat whether the file is 1 MB or 10 GB. Anything that is "too big to fit" is a stream problem. This
module's `log-report` CLI exists to make you feel that difference.

#### Modules: ESM vs CommonJS

Node has two module systems:

| | ES modules (ESM) | CommonJS (CJS) |
| --- | --- | --- |
| Syntax | `import { x } from './m.js'` / `export` | `const x = require('./m')` / `module.exports` |
| Turns on with | `"type": "module"` in `package.json`, or `.mjs` | the default, or `.cjs` |
| Loaded | asynchronously, statically | synchronously |
| Top-level `await` | yes | no |
| `import.meta` | yes | no |

**This course uses ESM everywhere.** It is the modern standard and the style the rest of the program
uses. Two habits come with it: import core modules with the **`node:` prefix** (`import fs from
'node:fs/promises'`) so it is obvious you are not importing a package named `fs`, and prefer **named
exports** over a default export so every utility is imported by name.

`node:test` and `node:sqlite` ship with Node — you will see them mentioned. This course deliberately
uses **Jest** (M09) and **Prisma** (M07) instead, so you never wire either up. Awareness is enough.

### Read These

- 🔗 Node.js — the event loop, timers and `process.nextTick`:
  https://nodejs.org/docs/latest-v24.x/api/events.html
- 🔗 Node.js — Blocking vs non-blocking (Overview):
  https://nodejs.org/docs/latest-v24.x/api/index.html#blocking-vs-non-blocking
- 🔗 Node.js — `node:fs` (and `fs/promises`): https://nodejs.org/docs/latest-v24.x/api/fs.html
- 🔗 Node.js — `node:stream`: https://nodejs.org/docs/latest-v24.x/api/stream.html
- 🔗 Node.js — `node:http`: https://nodejs.org/docs/latest-v24.x/api/http.html
- 🔗 Node.js — `node:path`: https://nodejs.org/docs/latest-v24.x/api/path.html
- 🔗 Node.js — `node:os`: https://nodejs.org/docs/latest-v24.x/api/os.html
- 🔗 Node.js — `node:events`: https://nodejs.org/docs/latest-v24.x/api/events.html
- 🔗 Node.js — `node:crypto`: https://nodejs.org/docs/latest-v24.x/api/crypto.html
- 🔗 Node.js — `node:timers/promises`: https://nodejs.org/docs/latest-v24.x/api/timers.html
- 🔗 Node.js — `node:util` (`parseArgs`, `promisify`):
  https://nodejs.org/docs/latest-v24.x/api/util.html
- 🔗 Node.js — `process`: https://nodejs.org/docs/latest-v24.x/api/process.html
- 🔗 Node.js — CLI options (`--env-file`, `--watch`, `--run`, `--inspect`):
  https://nodejs.org/docs/latest-v24.x/api/cli.html
- 🔗 Node.js — Modules: packages and ESM vs CJS:
  https://nodejs.org/docs/latest-v24.x/api/packages.html
- 🔗 npm Docs — `package.json`: https://docs.npmjs.com/cli/v11/configuring-npm/package-json
- 🔗 npm Docs — semantic versioning: https://docs.npmjs.com/about-semantic-versioning
- 🔗 npm Docs — `npm ci`: https://docs.npmjs.com/cli/v11/commands/npm-ci
- 🔗 npm Docs — `npm audit`: https://docs.npmjs.com/cli/v11/commands/npm-audit
- 🔗 MDN — `fetch`, `URL`, `AbortController`, `structuredClone`:
  https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
- 🔗 Node.js — Debugging (`node --inspect`):
  https://nodejs.org/docs/latest-v24.x/api/debugger.html

### Walkthrough: The Module Workspace

Everything in this module lives in one ES-module project, `node-runtime-lab/`, with two programs: the
`log-report` CLI and the bare `node:http` server. There is no build step; Node 24 (pinned in `.nvmrc`)
runs the `.js` directly.

Create the folder and the three config files:

```bash
mkdir -p node-runtime-lab/scripts
cd node-runtime-lab
```

```bash
cat > package.json << 'EOF'
{
  "name": "node-runtime-lab",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "generate": "node scripts/generate-log.js --out sample.log --lines 5000",
    "report": "node log-report.js --file sample.log --top 5",
    "server": "node server.js"
  }
}
EOF
```

```bash
cat > .gitignore << 'EOF'
# .gitignore
node_modules/
.env
*.log
dist/
coverage/
EOF
```

```bash
cat > .env.example << 'EOF'
# Copy to .env for local runs. Never commit .env.
PORT=3000
LOG_LEVEL=info
EOF
```

Three things to notice before you run anything:

- **`"type": "module"`** is what makes `import`/`export` work in `.js` files. Without it Node treats
  every `.js` as CommonJS and your `import` throws `Cannot use import statement outside a module`.
- **`"engines"`** records the Node version the project expects. It does not enforce anything on its
  own, but tooling and CI can read it.
- **`.env` is git-ignored, `.env.example` is committed.** That is the convention for the whole
  program: secrets never enter git, but the shape of the config does.

### Walkthrough Part 2: A Tour of the Runtime

This is a script you run once. It is not a deliverable — it is a guided tour of the core modules and
globals this module expects you to be fluent in. Read the comments as you go.

```bash
cat > core-tour.js << 'EOF'
// core-tour.js — run: node core-tour.js
// A tour of the core modules and globals you will reach for in this module.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { parseArgs, promisify } from 'node:util';
import { gzip } from 'node:zlib';

// --- node:path — build paths without string math ------------------------
console.log('path.join :', path.join('logs', '2026', 'app.log'));
console.log('path.extname:', path.extname('app.log'));

// --- import.meta — the module's own location (ESM only) -----------------
console.log('dir  :', import.meta.dirname);
console.log('file :', import.meta.filename);

// --- node:os — facts about the machine -----------------------------------
console.log('os   :', os.platform(), os.arch(), 'cpus:', os.cpus().length);

// --- node:crypto — randomUUID, no dependency ----------------------------
console.log('uuid :', randomUUID());

// --- node:events — EventEmitter, the pub/sub built into Node -------------
class Ticker extends EventEmitter {
  tick(n) {
    for (let i = 1; i <= n; i++) this.emit('tick', i);
  }
}
const ticker = new Ticker();
ticker.on('tick', (n) => console.log('tick :', n));
ticker.tick(3);

// --- node:util — parseArgs and promisify ---------------------------------
console.log('args :', parseArgs({ args: ['--verbose'], options: { verbose: { type: 'boolean' } } }).values);

const gzipAsync = promisify(gzip); // callback API -> promise API
const zipped = await gzipAsync(Buffer.from('hello streams'));
console.log('gzip :', zipped.length, 'bytes');

// --- node:timers/promises — a correct sleep ------------------------------
await sleep(10);
console.log('slept: 10ms');

// --- globals: URL, structuredClone, AbortController ----------------------
const url = new URL('https://example.com/api/tasks?done=false');
url.searchParams.set('limit', '10');
console.log('url  :', url.pathname, url.searchParams.toString());

const original = { id: randomUUID(), tags: ['a', 'b'] };
const clone = structuredClone(original);
clone.tags.push('c');
console.log('clone:', clone.tags, 'orig:', original.tags);

const controller = new AbortController();
const timer = sleep(50, 'too slow', { signal: controller.signal });
controller.abort();
try {
  await timer;
} catch (err) {
  console.log('abort:', err.name);
}

// --- reading its own source, promise-style -------------------------------
const source = await readFile(import.meta.filename, 'utf8');
console.log('self :', source.split('\n').length, 'lines');
EOF
```

```bash
node core-tour.js
```

The output (yours will differ where it reflects your machine and a random id):

```
path.join : logs/2026/app.log
path.extname: .log
dir  : /path/to/node-runtime-lab
file : /path/to/node-runtime-lab/core-tour.js
os   : darwin arm64 cpus: 11
uuid : a5f37a1b-9e5b-4526-9963-1db828a09224
tick : 1
tick : 2
tick : 3
args : [Object: null prototype] { verbose: true }
gzip : 33 bytes
slept: 10ms
url  : /api/tasks done=false&limit=10
clone: [ 'a', 'b', 'c' ] orig: [ 'a', 'b' ]
abort: AbortError
self : 69 lines
```

Four of these are worth naming because you will reuse them:

- **`node:util` `promisify`** turns any callback-style API into a promise, so `zlib.gzip` composes
  with `await` exactly like the toolkit from Module 2.
- **`node:timers/promises` `setTimeout`** is a promise-based `sleep` that also takes an
  `AbortSignal` — that is how the `abort` line above printed `AbortError`.
- **`structuredClone`** is a real deep copy, so pushing to the clone's `tags` did not touch the
  original.
- **`import.meta.dirname` / `import.meta.filename`** replace the CommonJS `__dirname` / `__filename`,
  which do not exist in ESM.

> **Try the CommonJS version to feel the difference.** Save this as `cjs-tour.cjs` and run it with
> `node cjs-tour.cjs`. It does the same job with `require`, `module.exports`, and `__dirname` — no
> `"type": "module"`, no top-level `await`:
>
> ```bash
> cat > cjs-tour.cjs << 'EOF'
> const path = require('node:path');
> console.log('CJS dirname:', __dirname);
> console.log('CJS join   :', path.join('logs', 'app.log'));
> module.exports = { ok: true };
> EOF
> ```
>
> ```bash
> node cjs-tour.cjs
> ```
>
> In ESM those same names are a `ReferenceError` — `__dirname` and `__filename` do not exist; you use
> `import.meta` instead. That single difference is why the two styles cannot be mixed casually.

### Walkthrough Part 3: Generate a Log File and Stream It

The lab needs a large log file. Your trainer gives you a ~100 MB access-log file, but so you can
build and test without waiting on a download, this generator produces a small deterministic one — the
same seed always makes the same file. It is a script, not the deliverable.

```bash
cat > scripts/generate-log.js << 'EOF'
// scripts/generate-log.js — deterministic synthetic access log.
// Usage: node scripts/generate-log.js --out sample.log --lines 5000
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';
import { parseArgs } from 'node:util';

const METHODS = ['GET', 'GET', 'GET', 'POST', 'PUT', 'DELETE'];
const PATHS = ['/api/tasks', '/api/tasks/1', '/api/tasks/42', '/health', '/api/users', '/login', '/static/app.js'];
const STATUS = [200, 200, 200, 200, 201, 301, 400, 404, 404, 500];

function makeRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: 'sample.log' },
    lines: { type: 'string', default: '5000' },
    seed: { type: 'string', default: '42' },
  },
});

const total = Number(values.lines);
const random = makeRandom(Number(values.seed));
const pick = (arr) => arr[Math.floor(random() * arr.length)];

const out = createWriteStream(values.out);
const start = Date.parse('2026-10-13T09:00:00.000Z');

for (let i = 0; i < total; i++) {
  const ts = new Date(start + i * 250).toISOString();
  const method = pick(METHODS);
  const path = pick(PATHS);
  const status = pick(STATUS);
  const bytes = 100 + Math.floor(random() * 9000);
  if (!out.write(`${ts} ${method} ${path} ${status} ${bytes}\n`)) {
    await once(out, 'drain');
  }
}

out.end();
await once(out, 'finish');
console.error(`wrote ${total} lines to ${values.out}`);
EOF
```

```bash
node scripts/generate-log.js --out sample.log --lines 5000
head -3 sample.log
```

The file is newline-delimited, one request per line:

```
2026-10-13T09:00:00.000Z POST /api/tasks/1 200 4392
2026-10-13T09:00:00.250Z GET /login 404 1053
2026-10-13T09:00:00.500Z GET /static/app.js 200 2981
```

Now the deliverable: the `log-report` CLI. It **streams** the file — it never holds more than one
line — aggregates counts with `parseArgs` options, and writes a JSON report.

```bash
cat > log-report.js << 'EOF'
#!/usr/bin/env node
// log-report.js — stream a large access-log file and write a JSON report.
// Usage: node log-report.js --file sample.log --top 5
import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    file: { type: 'string', short: 'f', default: 'sample.log' },
    top: { type: 'string', short: 't', default: '5' },
    out: { type: 'string', short: 'o' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (values.help) {
  console.log('Usage: node log-report.js --file <path> [--top N] [--out <path>]');
  process.exit(0);
}

const LINE = /^(\S+) (\S+) (\S+) (\d{3}) (\d+)$/;

const report = {
  file: values.file,
  generatedAt: new Date().toISOString(),
  totalLines: 0,
  malformedLines: 0,
  bytes: 0,
  byMethod: {},
  byStatus: {},
  byStatusClass: {},
  paths: {},
};

let peakRssMb = 0;
const started = process.hrtime.bigint();

const stream = createReadStream(values.file, { encoding: 'utf8' });
const rl = createInterface({ input: stream, crlfDelay: Infinity });

for await (const line of rl) {
  report.totalLines += 1;
  report.bytes += Buffer.byteLength(line) + 1;

  if (report.totalLines % 1000 === 0) {
    peakRssMb = Math.max(peakRssMb, process.memoryUsage().rss / (1024 * 1024));
  }

  const m = LINE.exec(line);
  if (!m) {
    report.malformedLines += 1;
    continue;
  }

  const [, , method, path, status] = m;
  report.byMethod[method] = (report.byMethod[method] ?? 0) + 1;
  report.byStatus[status] = (report.byStatus[status] ?? 0) + 1;
  const cls = `${status[0]}xx`;
  report.byStatusClass[cls] = (report.byStatusClass[cls] ?? 0) + 1;
  report.paths[path] = (report.paths[path] ?? 0) + 1;
}

report.topPaths = Object.entries(report.paths)
  .sort((a, b) => b[1] - a[1])
  .slice(0, Number(values.top))
  .map(([path, count]) => ({ path, count }));
delete report.paths;

report.elapsedMs = Math.round(Number(process.hrtime.bigint() - started) / 1e6);
report.peakRssMb = +peakRssMb.toFixed(1);

const json = JSON.stringify(report, null, 2);
if (values.out) {
  await writeFile(values.out, json + '\n');
  console.error(`report written to ${values.out}`);
} else {
  console.log(json);
}
EOF
```

Run it against the sample, then against a much larger file:

```bash
node log-report.js --file sample.log --top 5
```

```bash
node scripts/generate-log.js --out big.log --lines 1000000
ls -lh big.log
node log-report.js --file big.log --top 3 --out report.json
node -e "const r=require('./report.json');console.log('lines',r.totalLines,'bytes',r.bytes,'elapsedMs',r.elapsedMs,'peakRssMb',r.peakRssMb)"
```

On the 1,000,000-line (≈48 MB) file this finishes in a few hundred milliseconds with a peak RSS in
the tens of megabytes — **bounded, not proportional to the file**. That is the whole point of
streaming.

To prove that claim, read the same file both ways and compare. Remember the module's rule: a
`readFile` allocates the *entire* file before you can touch a line; a stream holds one chunk.

```bash
cat > buffer-vs-stream.js << 'EOF'
// buffer-vs-stream.js — read the same file two ways and compare peak memory.
// Usage: node buffer-vs-stream.js sample.log
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';

const file = process.argv[2] ?? 'sample.log';
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1);

// --- Approach 1: load the whole file into memory ------------------------
const beforeBuffer = process.memoryUsage().rss;
const whole = await readFile(file, 'utf8');
const afterBuffer = process.memoryUsage().rss;
const lineCount = whole.split('\n').length - 1;
console.log(`buffer: ${lineCount} lines, file is ${mb(whole.length)} MB, RSS +${mb(afterBuffer - beforeBuffer)} MB`);

// --- Approach 2: stream it, one line at a time --------------------------
const beforeStream = process.memoryUsage().rss;
let streamed = 0;
const rl = createInterface({ input: createReadStream(file, 'utf8') });
for await (const _line of rl) streamed += 1;
const afterStream = process.memoryUsage().rss;
console.log(`stream: ${streamed} lines, RSS +${mb(afterStream - beforeStream)} MB`);
EOF
```

```bash
node buffer-vs-stream.js big.log
```

The buffer line grows with the file (≈+53 MB for a 48 MB file, and it would be ≈+100 MB on your
trainer's 100 MB log); the stream line stays near zero. Same answer, very different memory. Delete
`big.log` when you are done — it is in `.gitignore` but it is still 48 MB you do not need.

### Walkthrough Part 4: A Bare `node:http` Server

This is the second deliverable, and the one designed to hurt. **No framework.** You write routing,
body parsing, and error responses by hand, using only `node:http` and `node:crypto`. Feel how much
bookkeeping three endpoints already require — that feeling is the lesson.

```bash
cat > server.js << 'EOF'
// server.js — a bare node:http server with three JSON endpoints. No framework.
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 3000);

const tasks = [
  { id: randomUUID(), title: 'Write the log-report CLI', done: true },
  { id: randomUUID(), title: 'Build a bare node:http server', done: false },
];

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function sendError(res, status, code, message) {
  send(res, status, { error: { code, message } });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (raw.trim() === '') return {};
  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('Request body is not valid JSON');
    err.statusCode = 400;
    err.code = 'INVALID_JSON';
    throw err;
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const route = `${req.method} ${pathname}`;

  try {
    if (route === 'GET /health') {
      return send(res, 200, { status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
    }
    if (route === 'GET /api/tasks') {
      return send(res, 200, { count: tasks.length, tasks });
    }
    if (route === 'POST /api/tasks') {
      const body = await readJsonBody(req);
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return sendError(res, 400, 'VALIDATION_ERROR', 'title is required');
      }
      const task = { id: randomUUID(), title: body.title.trim(), done: Boolean(body.done) };
      tasks.push(task);
      return send(res, 201, task);
    }

    const known = ['/health', '/api/tasks'].includes(pathname);
    if (known) {
      res.setHeader('allow', pathname === '/health' ? 'GET' : 'GET, POST');
      return sendError(res, 405, 'METHOD_NOT_ALLOWED', `${req.method} not allowed on ${pathname}`);
    }
    return sendError(res, 404, 'NOT_FOUND', `No route for ${req.method} ${pathname}`);
  } catch (err) {
    return sendError(res, err.statusCode ?? 500, err.code ?? 'INTERNAL_ERROR', err.message);
  }
});

server.listen(PORT, () => {
  console.log(`bare node:http server listening on http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`\nreceived ${signal}, closing server...`);
  server.close(() => {
    console.log('server closed; bye');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
EOF
```

Start it and exercise every path from a second terminal:

```bash
node server.js
```

```bash
curl -s localhost:3000/health
curl -s localhost:3000/api/tasks
curl -s -X POST localhost:3000/api/tasks -H 'content-type: application/json' -d '{"title":"Ship M03"}'
curl -s -X POST localhost:3000/api/tasks -H 'content-type: application/json' -d '{"title":""}'
curl -s -X POST localhost:3000/api/tasks -H 'content-type: application/json' -d '{nope}'
curl -s localhost:3000/nope
curl -s -X DELETE localhost:3000/api/tasks
```

Expected responses:

```
{"status":"ok","uptimeSeconds":1}
{"count":2,"tasks":[{"id":"45ca...","title":"Write the log-report CLI","done":true},{"id":"596a...","title":"Build a bare node:http server","done":false}]}
{"id":"a8fb...","title":"Ship M03","done":false}
{"error":{"code":"VALIDATION_ERROR","message":"title is required"}}
{"error":{"code":"INVALID_JSON","message":"Request body is not valid JSON"}}
{"error":{"code":"NOT_FOUND","message":"No route for GET /nope"}}
{"error":{"code":"METHOD_NOT_ALLOWED","message":"DELETE not allowed on /api/tasks"}}
```

Then stop the server with **Ctrl-C**. Because of the `SIGINT` handler you wired, it prints
`received SIGINT, closing server...` and exits cleanly instead of being killed mid-request.

Look at what you wrote to get three endpoints: a manual `JSON.stringify` + header + length in `send`,
a separate `sendError`, an async body collector, a hand-rolled `method + pathname` string to route,
manual `405`/`404` branches, a hand-written validation check, and the shutdown plumbing. Every one of
those is a thing a framework gives you for free. You will meet that framework — Express — in Module 5.

### Walkthrough Part 5: npm and Config Ergonomics

You have used npm to install nothing yet, but npm is also the tool that runs and configures your
project. This walkthrough is a drill; run each command and read what it prints.

**Scripts and `node --run`.** `package.json` already defines three scripts. Node can run them itself:

```bash
node --run report
```

`npm run report` and `node --run report` do the same thing here; the second skips npm's overhead.

**Environment variables and `.env`.** Copy the example, then load it explicitly:

```bash
cp .env.example .env
node --env-file=.env -e "console.log('PORT =', process.env.PORT, '| LOG_LEVEL =', process.env.LOG_LEVEL)"
```

`process.env.PORT` is now `"3000"` — a **string**, always. Convert with `Number(...)` before doing
math. `--env-file` fails fast if the file is missing, so it doubles as a check that config exists.

**Watch mode.** `node --watch` restarts your process on file change — the zero-dependency alternative
to `nodemon`:

```bash
node --watch server.js
```

Edit `server.js` while it runs and watch it restart; Ctrl-C to stop.

**Semver, the lockfile, install vs ci.** Dependencies are the other half of npm. Add a tiny
dependency to a throwaway project and read what npm writes:

```bash
mkdir -p /tmp/npm-drill && cd /tmp/npm-drill
npm init -y
npm install picocolors
cat package.json
ls package-lock.json
npm ci
npm outdated
npm audit
```

What to take from it:

- `npm install picocolors` writes `"picocolors": "^1.1.1"` — the `^` means *any 1.x, at or above
  1.1.1*. `~1.1.1` would mean *1.1.x only*. Exact `1.1.1` is pinned. The lockfile records the exact
  version every install actually resolved.
- **`npm install`** may update the lockfile; **`npm ci`** installs *exactly* what the lockfile says
  and refuses to run if `package.json` and the lockfile disagree. `ci` is what CI uses — it is
  reproducible. `install` is what you use locally when you are adding a dependency.
- `npm outdated` shows newer versions; `npm update` moves within the allowed ranges.
- `npm audit` reports known vulnerabilities in your tree. Read it, but treat "0 vulnerabilities" as a
  snapshot, not a guarantee.
- `node_modules/` is never committed; the lockfile always is. `npm ci` on a fresh clone reproduces
  the tree exactly.

**Supply-chain hygiene.** Before you `npm install` anything, ask three questions: *Who publishes it,
how many maintainers, and how recently was it updated?* Read the package's `scripts` in its
`package.json`: a `preinstall` / `postinstall` script runs arbitrary code on your machine the moment
you install. Lockfile diffs are the other safety net — when a PR adds a dependency, review the diff
in `package-lock.json` as carefully as the code, because that is where surprising transitive
packages show up.

**`npx`.** `npx <tool>` downloads and runs a one-off CLI without adding it to your project — useful
for generators and linters. In this program you will always version-pin tools (`npx prisma@7`), never
trust an unversioned `npx <tool>`.

**dependencies vs devDependencies.** Something your program needs at runtime is a `dependency`
(`npm install express`). A tool used only while developing or testing is a `devDependency`
(`npm install --save-dev jest`). Production installs use `--omit=dev` to skip the second group.

### Walkthrough Part 6: Debugging

`console.log` is fine until it is not. Node ships better tools.

**Console methods beyond `log`:**

```bash
cat > console-methods.js << 'EOF'
// console-methods.js — run: node console-methods.js
const user = { id: 7, name: 'Ada', roles: ['admin', 'reviewer'] };
console.log('plain  :', user);
console.table(user.roles);
console.time('loop');
for (let i = 0; i < 1_000_000; i++) { /* work */ }
console.timeEnd('loop');
console.assert(user.id === 8, 'expected id 8, got', user.id); // prints only when false
console.error('to stderr, not stdout');
EOF
```

```bash
node console-methods.js
```

**`node --inspect` and the VS Code debugger.** Run the CLI under the inspector:

```bash
node --inspect-brk log-report.js --file sample.log
```

`--inspect-brk` pauses on the first line. Open Chrome (`chrome://inspect`) or, in VS Code, run the
**"Node.js: Attach"** configuration and set a breakpoint in `log-report.js`. You get real stepping,
watch expressions, and the call stack — the difference between guessing and looking.

**Reading a stack trace.** When Node throws, read it bottom-up:

```
TypeError: Cannot read properties of undefined (reading 'title')
    at Object.<anonymous> (/path/to/log-report.js:23:19)   ← your code: file:line:column
    at Module._compile (node:internal/modules/cjs/loader:1...)  ← runtime internals, ignore
    at ...
```

The **top** frame is where it broke; the **first frame pointing at your file** is where to look. The
`node:internal/...` frames beneath are the runtime doing its job — skim past them.

### What This Walkthrough Showed You

- Node is **V8 + libuv + core APIs** on one JavaScript thread; the event loop schedules callbacks and
  a small thread pool handles file/DNS/crypto work. Blocking that thread blocks everything.
- **Streams** keep memory flat: `createReadStream` + `readline` processed a 48 MB file with bounded
  RSS, while `readFile` grew with the file. Anything "too big to fit" wants a stream.
- **ESM** is the course's module system: `"type": "module"`, the `node:` prefix, named exports, and
  `import.meta.dirname` instead of `__dirname`.
- **npm** is more than an installer: scripts, the lockfile, `install` vs `ci`, semver ranges,
  `audit`, and lifecycle scripts are all part of managing a project safely.
- **A bare `node:http` server** means hand-writing routing, body parsing, JSON responses, and error
  branches — visible, tedious work that a framework removes. That is what motivates Express in M05.

### EXERCISE 3.1 — Prove streaming beats buffering

Run `node buffer-vs-stream.js` against a file you grow yourself: `--lines 10000`, then `100000`,
then `1000000` (edit the `generate` script's `--lines` or pass it directly). Record the RSS delta for
both approaches at each size in a short table. In one paragraph, state the relationship between the
buffer's RSS and the file size, and between the stream's RSS and the file size. Then explain why the
`log-report` CLI is built with the stream.

### EXERCISE 3.2 — A fourth endpoint, routed by hand

Add `GET /api/version` to `server.js` returning `{ name, node: process.version }`. Notice how much
you have to touch: the `send` call, the route string, and the `known` array for `405` handling. That
touching-many-spots feeling is the point. Write two sentences naming what a router would have done
instead.

### EXERCISE 3.3 — Request IDs with `randomUUID`

Give the server a request id: generate a `randomUUID()` per request, add it to every JSON error body
as `requestId`, and send it back in a response header `x-request-id`. This is the same idea the Task
API will use for logging and error correlation in M05, done here by hand.

### EXERCISE 3.4 — `promisify` a second callback API

Pick a callback-style core API — `node:zlib` (`gzip`), `node:crypto` (`scrypt`), or `node:dns`
(`lookup`) — and write a file `two-styles.js` that calls it (a) with a callback and (b) wrapped in
`promisify` and awaited. Show both produce the same result. Then explain when `promisify` is worth it
and when the API already supplies a `node:*` promise version you should prefer.

### EXERCISE 3.5 — A supply-chain review

Choose any small package (for example, one you already know). Without installing it, open its page on
npm and answer in writing: who maintains it, when it last published, how many weekly downloads it
has, whether it declares lifecycle scripts, and how many transitive dependencies it would add. State
whether you would install it in a production service and why. Then run `npm audit` in the drill
project and paste the summary line.

### EXERCISE 3.6 — Config and watch

Using `players.json` of your own making (a small array of objects), write `players.js` that reads the
file path from an environment variable `PLAYERS_FILE`, loads and prints it. Run it with
`node --env-file=.env players.js` after adding `PLAYERS_FILE=./players.json` to `.env`. Then run it
under `node --watch players.js`, edit `players.json`, and confirm the process reloads. Explain what
`--env-file` and `--watch` each replace.

### Self-Check

1. Node.js uses a single JavaScript thread. How can it serve thousands of simultaneous connections
   without waiting on any one of them?
2. What is the difference between the event loop and the libuv thread pool? Which kinds of work go
   to each?
3. Give one task that is a good fit for Node and one that is a poor fit, and say why in terms of the
   single thread.
4. You must process a 10 GB log file. Why is `await readFile(...)` the wrong tool, and what do you
   use instead?
5. What exactly does `"type": "module"` change, and what are `__dirname` / `__filename` replaced by
   in ESM?
6. Explain `^1.2.3` vs `~1.2.3` vs `1.2.3`, and explain the difference between `npm install` and
   `npm ci`.
7. What can a package's `postinstall` script do, and why does that matter before you run
   `npm install`?

### Module 3 Deliverable

Commit these inside your public training repo (link the repo from your write-up header):

- ☐ A **`log-report` CLI** that **streams** the log file (never loads it fully), aggregates counts,
  accepts options through `parseArgs`, and writes a **JSON report**.
- ☐ A **bare `node:http` server** with **three JSON endpoints**, with routing and body parsing written
  by hand (no framework).
- ☐ Evidence that the CLI **streams**: a memory comparison (buffer vs stream) showing the buffer's
  RSS growing with the file and the stream's staying flat.
- ☐ Your **own written explanation** of what a framework like Express would specifically remove pain
  from, grounded in the bare server you just wrote.
- ☐ Both programs merged to `main` through a **pull request** (branch → PR → merge, the M01 habit).

This is the **Week 1 Friday gate.**

### Appendix: Self-Check Answers

1. It hands blocking I/O to libuv and registers callbacks, then immediately returns to accepting the
   next connection. The one JavaScript thread only ever runs short bursts of synchronous code; it
   never sits idle waiting for a read or a socket. Concurrency comes from overlapping *waits*, not
   from running JavaScript in parallel.
2. The **event loop** is the single-threaded scheduler that runs your callbacks; the **thread pool**
   is a small set of background OS threads (four by default) that libuv uses for work with no async
   OS interface — file-system calls, DNS lookups, `zlib`, `crypto`. Network socket I/O is handled by
   OS async notifications and does not occupy the pool.
3. Good fit: a REST API serving many concurrent, mostly-idle-with-I/O requests — the thread is freed
   during every database and network wait. Poor fit: large in-memory numeric computation or video
   encoding — that work occupies the one thread for its whole duration, so every connection stalls.
4. Because `readFile` allocates the entire file in memory before you can process a byte — 10 GB would
   exhaust the process. Use a **stream**: `createReadStream` (optionally piped through
   `readline`), which processes the file in small chunks and keeps memory flat regardless of size.
5. `"type": "module"` tells Node to treat `.js` files in the project as ES modules, enabling
   `import`/`export` and top-level `await`. In ESM, `__dirname` and `__filename` do not exist; their
   replacements are `import.meta.dirname` and `import.meta.filename`.
6. `^1.2.3` allows any `1.x.y` at or above `1.2.3`; `~1.2.3` allows only `1.2.x` at or above `1.2.3`;
   `1.2.3` is exact. `npm install` resolves and may update the lockfile; `npm ci` installs exactly
   what the lockfile specifies and fails if `package.json` and the lockfile disagree, which is why CI
   uses it.
7. A `postinstall` script runs arbitrary code on your machine the moment the package is installed —
   it can read files, make network calls, or run other binaries. That is why you vet a package's
   maintainers and scripts, and review lockfile diffs, before installing it into anything that
   matters.
