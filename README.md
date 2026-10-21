# CipherVault AI

**Your AI can use your secrets without owning them.**

CipherVault is a hackathon demo of a privacy-oriented gateway concept. It shows how a client can inspect sensitive context, encrypt detected values in a short-lived local vault, and replace them with placeholders before a model boundary. The interface includes a secure prompt lab, sanitized-payload trace, key-isolation status, policy decisions, curated attack simulation, and a secret-free event log.

> **Prototype notice:** This repository does not connect to an external LLM. Responses are generated locally from sanitized text. The eight attack cases are curated demonstrations, not a comprehensive security test or security certification. Browser-side code is not a production key-isolation boundary.

## Run locally

Requirements: Node.js 20.9 or later and pnpm 11.25.0 (the project pins the package manager).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). To check the project:

```bash
pnpm typecheck
pnpm test
pnpm build
```

No API key, database, or environment file is needed. There are no external provider calls in this demo.

## Container deployment

The repository includes a root [`Dockerfile`](Dockerfile) for the Next.js production runtime. It installs the lockfile with the checked-in pnpm 11.25.0 policy, builds the app, and starts `next start` on `0.0.0.0:$PORT` (default `3000`). The Webdev container health route is `/`, which serves the existing app without authentication. This project uses no database or deployment secret; no live LLM provider is configured. A real LLM gateway or production key boundary would require a separate server-side security review.

## Devpost demo video

Watch or download the [CipherVault AI product demo](demo/ciphervault-devpost-demo.mp4). It is a 3:01 landscape MP4 in 1920×1080 at 30 fps, with English narration and burned-in captions. The SRT sidecar, narration script, audio source segments, and captured UI frames are in `demo/`. The video shows the actual running app and clearly labels the local-only, simulated behavior.

## Guided demo

1. Open **Overview** and select **Try sample prompt** in Secure chat.
2. Submit the sample. The app detects the dummy API-key pattern in the browser, encrypts the detected value with Web Crypto AES-GCM using a non-exportable ephemeral key, and replaces the value with `[SECRET_001]` in the sanitized-payload trace.
3. Note the explicit **Demo only — this payload is not sent to any model** state. The local response discusses rotation without needing the credential value.
4. Open **Local vault** to see the key-isolation model and its limitations. Entries exist only in application memory for this tab.
5. Open **Attack lab** and run the eight fixed local policy fixtures. The result reports precisely the decisions for that curated set; it does not assert broad security coverage.
6. Review **Security events**. The log records categories, fixture IDs, and outcomes, not original prompts or detected values.

## Project structure

- `src/app/` — Next.js App Router page, metadata, and design tokens/styles.
- `src/components/` — CipherVault dashboard, navigation, secure chat, vault, attack lab, event log, and settings views.
- `src/lib/security.ts` — pattern detection, tokenization, policy rules, canned fixtures, and local demo responses.
- `src/lib/vault.ts` — ephemeral Web Crypto AES-GCM session vault.
- `tests/` — focused unit tests for redaction and policy behavior.
- `docs/architecture.md` — component and data-flow description.
- `docs/threat-model.md` — threat assumptions and explicit limitations.
- `docs/deployment.md` — container build, runtime port, and health-route contract.

## What this demo does not claim

CipherVault does not make AI mathematically impossible to hack, does not hide arbitrary plaintext from a model that must understand it, and does not claim that an LLM sees no data. This demo has no LLM provider, so no prompt—sanitized or otherwise—is sent externally. A real deployment would need a server-side gateway, robust data-loss-prevention coverage, secure key custody, authorization design, threat-model review, and independent testing before handling production secrets.
