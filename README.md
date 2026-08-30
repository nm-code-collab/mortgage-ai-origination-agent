# Mortgage AI Origination Agent — Prototype

A small, local-first product prototype for a mortgage-origination assistant. It organizes intake data, makes gaps and document conflicts visible, runs only deterministic calculations, and routes uncertain or high-risk situations to a human loan professional.

## Run it

Open `index.html` in any modern web browser. No account, installation, or borrower data leaves the computer.

## What the prototype demonstrates

- Structured borrower intake and source-document comparison
- Explicit `Known`, `Missing`, `Conflict`, and `Assumption` states
- Targeted follow-up questions generated from only identified gaps
- A policy panel that accepts provided policy text (the future retrieval corpus)
- Deterministic debt-to-income calculation, only when all required values are known
- Clear human-review routing and a hard “no decision” boundary

## Important design choice

This is deliberately **not** an underwriting engine. It never estimates income, debts, or assets; it never approves or denies a loan. A person must review all conflicts and escalations.

## Next product increments

1. Add a secure backend and connect an LLM for document extraction and follow-up wording.
2. Add a searchable policy library (RAG), returning the exact policy passages used.
3. Add authentication, encrypted storage, audit logs, and consent controls before using real borrower information.
4. Build a test set with expected outcomes and track extraction accuracy, missed conflicts, escalation precision, and time-to-complete.
