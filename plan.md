# CipherVault AI — Implementation Plan

## Approved scope

Build a complete hackathon-ready Next.js and TypeScript demo of CipherVault AI: a privacy-oriented gateway concept that detects and tokenizes sensitive values before model use, keeps key material outside the external model boundary, applies policy controls, records secret-free security events, and demonstrates controlled attack blocking. Because no provider key or live LLM integration was requested or supplied, responses must be identified as local demo simulations. The app must not imply that a real external model was contacted or that this prototype proves a system secure.

## Implementation approach

Use the Next.js App Router with TypeScript and a responsive client-side security console. Keep sensitive-input inspection and tokenization in browser code so raw demo secrets are not sent to a remote model or persisted in audit logs. Use established Web Crypto AES-GCM primitives for the ephemeral demo vault, with a non-exportable in-memory key and encrypted secret entries only for the running session; explain that a browser prototype is not a production key boundary. Keep the mock response generator, policy checks, and attack fixtures local and deterministic. Treat detections as privacy-preserving pattern matches for demo purposes, not as complete DLP coverage.

Implement the chat workflow as: user enters sample text → browser detector finds recognized patterns → values are encrypted in memory and replaced with `[SECRET_001]`-style placeholders → UI shows the sanitized payload → a visibly labeled local demonstration response is displayed. Never add a live provider call or accept a claim that the external model receives the true secret. Build a security dashboard, vault status view, prompt-injection/policy-block states, curated attack simulator, and redacted event feed from a shared client-side state model. Keep the simulator's number of scenarios, blocked outcomes, and score explicitly framed as results of the curated demo run rather than a comprehensive security certification.

No external database is needed. The managed Next.js server capability is already enabled for serving the application. No API secret, authentication, or persistent user data is planned. Use the project's existing runtime port 3000, a pnpm-pinned Node setup, checked-in package-manager lifecycle policy, and an accurate public route manifest before starting Preview. Add project documentation for setup, architecture, threat model, known limitations, and how to perform the demo.

## Project structure

- `src/app/` — App Router layout, dashboard page, global styles, and route metadata.
- `src/components/` — dashboard shell, navigation, secure chat, tokenization trace, policy/attack panels, vault status, and event list.
- `src/lib/` — pattern detection/tokenization, Web Crypto session vault, policy rules, curated attack fixtures, and shared state/types.
- `public/manus-routes.json` — declared website page routes for the platform.
- `docs/` — architecture and threat-model/limitations notes.
- `tests/` — focused checks for detection, tokenization, policy decisions, and log redaction.
- `README.md` — installation, local run instructions, demo walkthrough, technology summary, and truthful security caveats.
- `plan.md`, `TODO.md` — approved approach and outcome tracking.

## Design

Three distinct possibilities considered (probabilities sampled from the tails, each below 0.10):
1. **Security operations console** — graphite instrumentation, cool neutrals, teal signals, compact audit-focused layouts. Probability: 0.06.
2. **Editorial privacy lab** — warm paper surfaces, precise diagrams, restrained ink typography. Probability: 0.03.
3. **Neon terminal** — high-contrast black canvas, luminous green controls, monospace-first interface. Probability: 0.02.

Chosen: **Security operations console**, to make the live security state legible without looking like a fictional hacker movie.

- **Design Movement:** Contemporary security-operations software with editorial clarity and restrained instrument-panel detail.
- **Core Principles:** Make data flow visible; distinguish demonstrated behavior from claims; keep risk states legible; favor quiet confidence over alarmist decoration.
- **Color Philosophy:** Deep graphite and soft slate provide a calm operational canvas; cool teal marks protection and verified local processing; amber signals review; red is reserved for blocked threats. Color is paired with labels and icons for accessibility.
- **Layout Paradigm:** A left-side anchored command rail and a broad asymmetric workspace: primary chat and sanitization trace occupy the main plane, while compact status instruments and event history live in a narrower side column. Responsive layouts collapse into stacked sections.
- **Signature Elements:** A small shield/lock monogram built from geometric linework; a tokenization rail connecting original text to placeholders; fine telemetry-style borders and timestamps.
- **Interaction Philosophy:** Every security action shows its effect. Sending a sample reveals detected categories and sanitized text; blocked attempts show the exact policy category; no action silently implies a real provider call.
- **Animation:** Fast, subtle transitions for new events and token replacement; a short progress sweep during the curated simulator; no flashing or looping alarm motion. Respect reduced-motion preferences.
- **Typography System:** A neutral sans-serif UI face for interface copy, with a crisp monospaced face for tokens, timestamps, and payload traces. Large titles are restrained; data labels are compact but readable.
- **Brand Essence:** A transparent privacy layer for people who need to use AI around sensitive context; precise, candid, protective.
- **Brand Voice:** Headlines name the control, not a grand promise. Examples: “Your model gets the question—not the credential.” “Simulation complete. 8 curated attempts blocked; not a security certification.”
- **Wordmark & Logo:** A custom shield outline containing a split-keyhole mark, paired with the CipherVault wordmark; avoid a stock padlock glyph.
- **Signature Brand Color:** Signal teal, used consistently for local protection and sanitized-flow indicators.

## Demo video approach

After the UI is implemented, produce a landscape product walkthrough using authentic captures of the running app and/or deterministic animation around those captures. Follow the supplied brief's 3–4 minute target where feasible. Show the risk of sending raw credentials, CipherVault's local detection and tokenization trace, a simulated response from sanitized context, the local-only ephemeral vault status, curated prompt-injection/policy attacks being blocked, and the dashboard result. Narration and captions will explicitly say this is a local prototype/simulation, not an external LLM integration or proof of security. Verify the resulting MP4 is playable before delivery.

## Container deployment approach

Use the already-enabled Webdev server capability with a committed root `Dockerfile`. Pin pnpm to the project's `11.25.0`, install from the checked-in `pnpm-lock.yaml` and `pnpm-workspace.yaml` policy, build the Next.js production application in the image, and start the production server on `0.0.0.0:$PORT` with port 3000 as the fallback. Keep the app stateless and do not introduce provider credentials, a database, or a live LLM integration. Declare the container health path as `/`, which serves the existing unauthenticated application page. The container build from the canonical checkpoint is the authoritative deployment integration check; do not claim an image was locally tested when no Docker engine is available.

## GitHub delivery

Once the project is ready, initiate the managed GitHub connection workflow to create a new private repository after the owner's confirmation. Do not overwrite or adopt an existing repository, do not create a public repository, and do not say the repository switch is complete until the managed transfer reports completion. Commit and checkpoint the intended project state before initiating the transfer as required by the platform workflow.
