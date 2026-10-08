# M03 Write-Up — Node.js Runtime & npm

> Fill this in as you go. Write it so a trainee starting this stage next cohort could follow your
> path on their own.

## What I built

The `log-report` CLI and the bare `node:http` server, both merged by PR.

## Why it's built this way (key decisions)

- Why this streaming approach for the log file, specifically?
- What would have changed — and broken — if you'd loaded the file fully into memory instead of
  streaming it?
- How did you hand-roll routing and body parsing, and which design did you pick where more than
  one way was possible?

## How to build it (teach it to the next trainee)

Write a guide to streaming a large file through a CLI, using your own example to show the
reasoning, not just the code.

## Concepts worth explaining

Pick 1-2 ideas — streams, the event loop/thread pool, or ESM vs CommonJS — and explain each in
your own words.

## What tripped me up

Anything that didn't behave the way you expected the first time (especially: what made the bare
`node:http` server painful — that's the point of this lab).

## Checkpoint evidence

Show both programs merged to `main` by PR, the CLI's memory behavior on the full log file, and the
bare server's three endpoints responding.

## What I'd do differently

If you started this module over, what would you do differently?
