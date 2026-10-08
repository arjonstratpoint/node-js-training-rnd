# M10 Write-Up — Capstone Project

> Fill this in as you go, stage by stage (Day 3 / Day 4 / Day 5) — not only at the end. This is the
> write-up a future trainee reads to understand what building a whole API solo, under this stack,
> actually took.

## Domain chosen, and why

## What I built

Your domain, the finished API — the models, the resources, the business rule.

## Why it's built this way (key decisions)

- Which business rule did you choose, and why did it need a transaction?
- Which two roles did you design, and what genuinely differs between them?
- Which password-hashing library and token strategy did you pick, and why?

## How to build it (teach it to the next trainee)

Write a guide to proving a transaction prevents a race condition under concurrent load, using your
own example to show the reasoning, not just the script.

## Concepts worth explaining

Pick 1-2 ideas — race conditions and transactions, role-based access control, or what makes an
error envelope "consistent" — and explain each in your own words.

## Security & Authorization

Your hashing library and why, JWT vs signed session and why, how your two roles differ in
practice, where rate-limiting is applied.

## Proving the concurrency fix

How you generated concurrent load against the contested resource, what happened before the
transaction was correct, what happened after — the actual evidence, not just a description.

## What tripped me up

## Checkpoint evidence

Show the concurrency script's before/after, the demo you gave, and the peer review you gave and
received. (Your rubric score and must-haves go in the self-score table below, not here.)

## Rubric self-score

| Criterion | Points available | My estimate | Evidence |
| --- | --- | --- | --- |
| Functionality and business rule | 15 | | |
| Testing quality and coverage | 15 | | |
| Validation and error handling | 10 | | |
| Security & Authorization | 15 | | |
| Data layer and migrations | 15 | | |
| TypeScript quality | 10 | | |
| Git/GitHub workflow and CI | 10 | | |
| Documentation and demo | 10 | | |
| **Total** | **100** | | |

## What I'd do differently

If you started this module over, what would you do differently?
